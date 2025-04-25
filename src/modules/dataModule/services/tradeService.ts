import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { TokenInfo } from '../types/tokenTypes';
import { JupiterService, JupiterSwapResponse } from './jupiterService';
import { RaydiumService } from '../../raydium/services/raydiumService';
import { swapTokens, Direction, SwapParams } from '../../pumpFun/services/pumpSwapService';

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
    }
  ): Promise<TradeResponse> {
    try {
      // Select provider implementation
      switch (provider) {
        case 'Jupiter':
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
          // Use PumpSwapService for PumpSwap
          if (!options?.poolAddress) {
            throw new Error('Pool address is required for PumpSwap');
          }
          
          const numericAmount = parseFloat(inputAmount);
          if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error('Invalid amount specified');
          }
          
          // Call PumpSwap service
          if (callbacks?.statusCallback) {
            callbacks.statusCallback('Preparing PumpSwap transaction...');
          }
          
          // Get connection from walletPublicKey context
          const connection = new Connection(
            process.env.CLUSTER === 'mainnet-beta' ? 
              'https://api.mainnet-beta.solana.com' : 
              'https://api.devnet.solana.com'
          );
          
          // Set default slippage
          const DEFAULT_SLIPPAGE = 0.5; // 0.5%
          
          // Create a wallet wrapper that matches the type expected by swapTokens
          const walletWrapper: any = {
            sendTransaction: (tx: Transaction | VersionedTransaction) => {
              return sendTransaction(tx, connection, {
                statusCallback: callbacks?.statusCallback,
                confirmTransaction: true
              });
            }
          };
          
          // Execute the swap with PumpSwap
          const signature = await swapTokens({
            pool: options.poolAddress,
            amount: numericAmount,
            direction: Direction.BaseToQuote, // Assuming inputToken is the base token
            slippage: DEFAULT_SLIPPAGE,
            userPublicKey: walletPublicKey,
            connection,
            solanaWallet: walletWrapper,
            onStatusUpdate: callbacks?.statusCallback,
          });
          
          return {
            success: true,
            signature,
            inputAmount: numericAmount,
            outputAmount: 0 // We don't know the exact output amount here
          };
          
        default:
          throw new Error(`Unsupported swap provider: ${provider}`);
      }
    } catch (err: any) {
      console.error(`Trade error with provider ${provider}:`, err);
      
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