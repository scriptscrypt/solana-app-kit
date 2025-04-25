import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { TokenInfo } from '../types/tokenTypes';
import { JupiterService, JupiterSwapResponse } from './jupiterService';
import { RaydiumService } from '../../raydium/services/raydiumService';
import { Direction } from '../../pumpFun/services/pumpSwapService';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';
import { SERVER_URL } from '@env';

const API_BASE_URL = SERVER_URL || 'http://localhost:8080';

export type SwapProvider = 'Jupiter' | 'Raydium' | 'PumpSwap';

export interface TradeResponse {
  success: boolean;
  signature?: string;
  error?: Error | string;
  inputAmount: number;
  outputAmount: number;
}

export interface SwapCallback {
  statusCallback: (status: string) => void;
  isComponentMounted?: () => boolean;
}

/**
 * TradeService - Provider-agnostic service for executing token swaps
 * 
 * This service delegates to provider-specific services based on the requested provider:
 * - Jupiter: JupiterService in dataModule
 * - Raydium: RaydiumService in raydium module
 * - PumpSwap: PumpSwapService in pumpFun module
 */
export class TradeService {
  /**
   * Executes a token swap using the specified provider
   */
  static async executeSwap(
    inputToken: TokenInfo,
    outputToken: TokenInfo,
    inputAmount: string,
    walletPublicKey: PublicKey,
    sendTransaction: (
      transaction: Transaction | VersionedTransaction,
      connection: Connection, 
      options?: { statusCallback?: (status: string) => void, confirmTransaction?: boolean }
    ) => Promise<string>,
    callbacks?: SwapCallback,
    provider: SwapProvider = 'Jupiter',
    options?: {
      poolAddress?: string;
      slippage?: number;
    }
  ): Promise<TradeResponse> {
    console.log(`[TradeService] executeSwap called with provider: ${provider}`);
    try {
      // Select provider implementation
      switch (provider) {
        case 'Jupiter':
          console.log('[TradeService] Using JupiterService for swap');
          // Use JupiterService for Jupiter swaps
          return await JupiterService.executeSwap(
            inputToken,
            outputToken,
            inputAmount,
            walletPublicKey,
            sendTransaction,
            callbacks
          );
          
        case 'Raydium':
          console.log('[TradeService] Using RaydiumService for swap');
          // Use RaydiumService for Raydium swaps
          return await RaydiumService.executeSwap(
            inputToken,
            outputToken,
            inputAmount,
            walletPublicKey,
            sendTransaction,
            callbacks
          );
          
        case 'PumpSwap':
          console.log('[TradeService] PumpSwap path selected');
          if (!options?.poolAddress) {
            throw new Error('Pool address is required for PumpSwap');
          }
          
          const numericAmount = parseFloat(inputAmount);
          if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error('Invalid amount specified');
          }
          
          try {
            // Status update helper
            const updateStatus = (status: string) => {
              console.log('[TradeService] Status:', status);
              callbacks?.statusCallback?.(status);
            };
            updateStatus('Preparing swap transaction...');
            
            // Get server URL
            const baseUrl = SERVER_URL || 'http://localhost:8080';
            console.log('[TradeService] Server URL:', baseUrl);
            
            // Use slippage from options or default to 10%
            const slippageValue = options.slippage || 10.0;
            console.log('[TradeService] Using slippage:', slippageValue);
            
            // Make API request
            console.log('[TradeService] Requesting transaction from server');
            const response = await fetch(`${baseUrl}/api/pump-swap/build-swap`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pool: options.poolAddress,
                inputAmount: numericAmount,
                direction: inputToken.symbol === "SOL" ? Direction.BaseToQuote : Direction.QuoteToBase,
                slippage: slippageValue,
                userPublicKey: walletPublicKey.toString()
              })
            });
            
            // Check response status
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Server error: ${response.status} ${errorText}`);
            }
            
            // Parse response JSON
            const data = await response.json();
            console.log('[TradeService] Response:', JSON.stringify(data, null, 2));
            
            if (!data.success) {
              throw new Error(data.error || 'Server returned error');
            }
            
            if (!data.data?.transaction) {
              throw new Error('No transaction in response');
            }
            
            // Log the transaction
            console.log('[TradeService] Got transaction base64 string, length:', data.data.transaction.length);
            
            // Status update
            updateStatus('Transaction received, sending to wallet...');
            
            // Create a connection
            const connection = new Connection('https://api.mainnet-beta.solana.com');
            
            // Create a Transaction object
            const txBuffer = Buffer.from(data.data.transaction, 'base64');
            const txData = new Uint8Array(txBuffer);
            
            console.log('[TradeService] Transaction buffer length:', txData.length);
            
            // Try as versioned transaction first
            let tx;
            try {
              tx = VersionedTransaction.deserialize(txData);
              console.log('[TradeService] Successfully parsed as VersionedTransaction');
            } catch (e) {
              console.log('[TradeService] Not a VersionedTransaction, trying legacy format');
              tx = Transaction.from(txBuffer);
              tx.feePayer = walletPublicKey;
              console.log('[TradeService] Successfully parsed as Transaction');
            }
            
            // Log transaction details
            if (tx instanceof VersionedTransaction) {
              console.log('[TradeService] tx is VersionedTransaction with', 
                tx.message.compiledInstructions.length, 'instructions');
            } else {
              console.log('[TradeService] tx is Transaction with', 
                tx.instructions.length, 'instructions');
            }
            
            // Send the transaction 
            console.log('[TradeService] Sending transaction to wallet');
            let signature: string;
            try {
              signature = await sendTransaction(tx, connection, {
                statusCallback: updateStatus,
                confirmTransaction: true
              });
              
              console.log('[TradeService] Transaction sent with signature:', signature);
              updateStatus('Swap completed successfully!');
              
              return {
                success: true,
                signature,
                inputAmount: numericAmount,
                outputAmount: 0
              };
            } catch (txError: any) {
              // Check if error is due to confirmation timeout but transaction might have succeeded
              if (txError.message && txError.message.includes('confirmation failed after maximum retries')) {
                console.log('[TradeService] Transaction may have succeeded but confirmation timed out');
                console.log('[TradeService] Transaction signature:', txError.signature || 'Unknown');
                
                // If we have a signature, we can use it to verify the transaction
                if (txError.signature) {
                  updateStatus('Transaction may have succeeded. Verifying on chain...');
                  
                  try {
                    // Give the transaction a moment to finalize
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Try to get the transaction status
                    const status = await connection.getSignatureStatus(txError.signature);
                    console.log('[TradeService] Transaction status:', JSON.stringify(status, null, 2));
                    
                    if (status.value && !status.value.err) {
                      // Transaction is confirmed or likely to be confirmed
                      updateStatus('Transaction verified successful!');
                      return {
                        success: true,
                        signature: txError.signature,
                        inputAmount: numericAmount,
                        outputAmount: 0
                      };
                    }
                  } catch (verifyError) {
                    console.error('[TradeService] Error verifying transaction:', verifyError);
                  }
                }
                
                // Return a more helpful error message
                updateStatus('Transaction sent but confirmation timed out. Check your wallet or blockchain explorer.');
                throw new Error(`Transaction may have succeeded but confirmation timed out. Signature: ${txError.signature || 'Unknown'}`);
              }
              
              // Re-throw the original error
              throw txError;
            }
          } catch (error: any) {
            console.error('[TradeService] Error:', error);
            return {
              success: false,
              error,
              inputAmount: 0,
              outputAmount: 0
            };
          }
          
        default:
          console.error('[TradeService] Unsupported swap provider:', provider);
          throw new Error(`Unsupported swap provider: ${provider}`);
      }
    } catch (err: any) {
      console.error(`[TradeService] Trade error with provider ${provider}:`, err);
      
      // Special handling for PumpSwap-specific errors
      if (provider === 'PumpSwap' && err.message) {
        console.log('[TradeService] PumpSwap error details:', err.message);
        
        // Enhance the error object with swap details for more helpful UI feedback
        err.swapDetails = {
          provider: 'PumpSwap',
          inputToken: inputToken.symbol,
          outputToken: outputToken.symbol,
          amount: inputAmount,
          poolAddress: options?.poolAddress
        };
        
        // If the error is specifically about slippage or price impact
        if (err.message.includes('ExceededSlippage') || err.message.includes('0x1774')) {
          err.message = 'Transaction failed due to extreme price impact in this pool. Please try a smaller amount or contact the pool creator.';
        }
      }
      
      return {
        success: false,
        error: err,
        inputAmount: 0,
        outputAmount: 0
      };
    }
  }
  
  /**
   * Converts a decimal amount to base units (e.g., SOL -> lamports)
   */
  static toBaseUnits(amount: string, decimals: number): number {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val * Math.pow(10, decimals);
  }
} 