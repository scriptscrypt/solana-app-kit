import { Connection, Transaction, VersionedTransaction, PublicKey, SystemProgram } from '@solana/web3.js';
import { TokenInfo } from '../types/tokenTypes';
import { JupiterService, JupiterSwapResponse } from './jupiterService';
import { RaydiumService } from '../../raydium/services/raydiumService';
import { Direction } from '../../pumpFun/services/pumpSwapService';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';
import { SERVER_URL } from '@env';
import { Alert } from 'react-native';

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

// Fee configuration
const FEE_PERCENTAGE = 0.5; // 0.5%
const FEE_RECIPIENT = '4iFgpVYSqxjyFekFP2XydJkxgXsK7NABJcR7T6zNa1Ty';

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
   * Calculate fee amount from an output amount
   */
  static calculateFeeAmount(outputAmount: number): number {
    const feeAmount = Math.floor(outputAmount * (FEE_PERCENTAGE / 100));
    console.log(`[TradeService] 🧮 Calculated fee: ${feeAmount} lamports (${FEE_PERCENTAGE}% of ${outputAmount})`);
    return feeAmount;
  }

  /**
   * Creates a fee transaction to collect fees on behalf of the project
   */
  static async collectFee(
    outputAmount: number,
    walletPublicKey: PublicKey,
    sendTransaction: (
      transaction: Transaction | VersionedTransaction,
      connection: Connection, 
      options?: { statusCallback?: (status: string) => void, confirmTransaction?: boolean }
    ) => Promise<string>,
    statusCallback?: (status: string) => void
  ): Promise<string | null> {
    console.log('[TradeService] 🔍 STARTING FEE COLLECTION');
    console.log(`[TradeService] 🔍 Output amount: ${outputAmount}`);
    console.log(`[TradeService] 🔍 Wallet: ${walletPublicKey.toString()}`);
    
    try {
      // Calculate fee amount (0.5% of output)
      const feeAmount = this.calculateFeeAmount(outputAmount);
      
      if (feeAmount <= 0) {
        console.log('[TradeService] ⚠️ Fee amount too small, skipping fee collection');
        return null;
      }
      
      // Create direct RPC connection
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      
      // Get a fresh blockhash
      console.log('[TradeService] 🔗 Getting latest blockhash');
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      console.log(`[TradeService] 🔗 Blockhash received: ${blockhash}`);
      
      // Create fee transfer instruction
      const feeRecipientPubkey = new PublicKey(FEE_RECIPIENT);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: feeRecipientPubkey,
        lamports: feeAmount
      });
      
      // Create a new transaction for the fee
      const feeTx = new Transaction();
      feeTx.add(transferInstruction);
      feeTx.recentBlockhash = blockhash;
      feeTx.feePayer = walletPublicKey;
      
      // Prompt user to pay fee
      Alert.alert(
        'Pay Fee',
        `A fee of ${FEE_PERCENTAGE}% (${feeAmount} lamports) will be sent to support the project. Please approve this transaction.`,
        [
          {
            text: 'Approve',
            onPress: async () => {
              try {
                // Send the fee transaction
                if (statusCallback) {
                  console.log('[TradeService] 📱 Calling status callback for fee approval prompt');
                  statusCallback('Please approve the fee transaction...');
                }
                console.log('[TradeService] 📤 Sending fee transaction...');
                
                const signature = await sendTransaction(
                  feeTx,
                  connection,
                  {
                    statusCallback: (status) => {
                      console.log(`[TradeService Fee] 📡 Status: ${status}`);
                      if (statusCallback) {
                        statusCallback(`Fee: ${status}`);
                      }
                    },
                    confirmTransaction: true
                  }
                );
                
                console.log('[TradeService] ✅ Fee transaction successfully sent with signature:', signature);
                
                // Show notification for the fee transaction
                console.log('[TradeService] 🔔 Showing success notification');
                TransactionService.showSuccess(signature, 'transfer');
                
                return signature;
              } catch (sendError) {
                console.error('[TradeService] ❌ Error sending fee:', sendError);
                if (sendError instanceof Error) {
                  console.error('[TradeService] ❌ Error message:', sendError.message);
                }
                Alert.alert('Fee Error', 'There was an error sending the fee transaction. Your swap was still successful.');
                return null;
              }
            }
          },
          {
            text: 'Skip',
            style: 'cancel',
            onPress: () => {
              console.log('[TradeService] ⏭️ User chose to skip fee payment');
              return null;
            }
          }
        ]
      );
      
      // This will actually return before the user makes a choice,
      // but that's OK because we've initiated the process with the Alert
      return null;
    } catch (error) {
      console.error('[TradeService] ❌ Error collecting fee:', error);
      if (error instanceof Error) {
        console.error('[TradeService] ❌ Error message:', error.message);
        console.error('[TradeService] ❌ Error stack:', error.stack);
      }
      return null;
    }
  }

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
    console.log(`[TradeService] 🚀 executeSwap called with provider: ${provider}`);
    try {
      // Create a connection object that might be reused for fee collection
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      let swapResponse: TradeResponse;

      // Select provider implementation
      switch (provider) {
        case 'Jupiter':
          console.log('[TradeService] 🪐 Using JupiterService for swap');
          // Use JupiterService for Jupiter swaps
          swapResponse = await JupiterService.executeSwap(
            inputToken,
            outputToken,
            inputAmount,
            walletPublicKey,
            sendTransaction,
            callbacks
          );
          console.log('[TradeService] 🪐 Jupiter swap response:', JSON.stringify(swapResponse));
          break;
          
        case 'Raydium':
          console.log('[TradeService] 🌊 Using RaydiumService for swap');
          // Use RaydiumService for Raydium swaps
          swapResponse = await RaydiumService.executeSwap(
            inputToken,
            outputToken,
            inputAmount,
            walletPublicKey,
            sendTransaction,
            callbacks
          );
          console.log('[TradeService] 🌊 Raydium swap response:', JSON.stringify(swapResponse));
          break;
          
        case 'PumpSwap':
          console.log('[TradeService] 🔄 PumpSwap path selected');
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
              
              swapResponse = {
                success: true,
                signature,
                inputAmount: numericAmount,
                outputAmount: 0 // Not known for PumpSwap
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
          break;
          
        default:
          console.error('[TradeService] Unsupported swap provider:', provider);
          throw new Error(`Unsupported swap provider: ${provider}`);
      }

      // If the swap was successful, collect the fee
      if (swapResponse.success) {
        console.log('[TradeService] 🎉 Swap successful, preparing to collect fee');
        console.log(`[TradeService] 📊 Swap output amount: ${swapResponse.outputAmount}`);
        
        if (swapResponse.outputAmount > 0) {
          try {
            console.log('[TradeService] 💸 Proceeding with fee collection');
            
            // Get status update function
            const statusCallback = callbacks?.statusCallback || (() => {});
            
            // Collect fee - will create and send a separate transaction
            // This doesn't affect the success of the main swap
            this.collectFee(
              swapResponse.outputAmount,
              walletPublicKey,
              sendTransaction,
              statusCallback
            );
            
            // Note: We don't await this since it shows an Alert and waits for user input
          } catch (feeError) {
            console.error('[TradeService] ❌ Error collecting fee, but swap was successful:', feeError);
            if (feeError instanceof Error) {
              console.error('[TradeService] ❌ Fee error message:', feeError.message);
              console.error('[TradeService] ❌ Fee error stack:', feeError.stack);
            }
          }
        } else {
          console.log('[TradeService] ⚠️ Output amount is zero or invalid, cannot collect fee');
          console.log('[TradeService] ℹ️ outputAmount value:', swapResponse.outputAmount);
          console.log('[TradeService] ℹ️ outputAmount type:', typeof swapResponse.outputAmount);
        }
      } else {
        console.log('[TradeService] ❌ Swap was not successful, skipping fee collection');
        console.log('[TradeService] ℹ️ Swap error:', swapResponse.error);
      }
      
      return swapResponse;
    } catch (err: any) {
      console.error(`[TradeService] ❌ Trade error with provider ${provider}:`, err);
      
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