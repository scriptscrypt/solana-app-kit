import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { TokenInfo } from '../types/tokenTypes';
import { JupiterService, JupiterSwapResponse } from './jupiterService';

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
}

/**
 * TradeService - Provider-agnostic service for executing token swaps
 * 
 * This service delegates to provider-specific services based on the requested provider:
 * - Jupiter: JupiterService in dataModule
 * - PumpSwap: PumpSwapService in pumpFun module (future)
 * - Raydium: RaydiumService in a future module
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
    provider: SwapProvider = 'Jupiter'
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
          
        case 'PumpSwap':
          // In the future, this will use PumpSwapService
          throw new Error('PumpSwap integration not yet implemented');
          
        case 'Raydium':
          // In the future, this will use RaydiumService
          throw new Error('Raydium integration not yet implemented');
          
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