import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { ENDPOINTS } from '../../../config/constants';
import { CLUSTER, HELIUS_STAKED_URL } from '@env';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';
import { TokenInfo } from '../../dataModule/types/tokenTypes';
import { Buffer } from 'buffer';

// Types
export interface RaydiumSwapResponse {
  success: boolean;
  signature?: string;
  error?: Error | string;
  inputAmount: number;
  outputAmount: number;
}

export interface RaydiumSwapCallback {
  statusCallback?: (status: string) => void;
  isComponentMounted?: () => boolean;
}

/**
 * RaydiumService - Client-side service for executing Raydium swaps
 * 
 * This is just a thin wrapper around the server API. All logic is on the server.
 */
export class RaydiumService {
  /**
   * Convert amount to base units (e.g., SOL -> lamports)
   */
  static toBaseUnits(amount: string, decimals: number): number {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return Math.floor(val * Math.pow(10, decimals));
  }

  /**
   * Executes a token swap using Raydium API on the server
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
    callbacks?: RaydiumSwapCallback
  ): Promise<RaydiumSwapResponse> {
    const safeUpdateStatus = (status: string) => {
      if (!callbacks?.isComponentMounted || callbacks.isComponentMounted()) {
        callbacks?.statusCallback?.(status);
      }
    };

    try {
      const inputLamports = this.toBaseUnits(inputAmount, inputToken.decimals);
      
      safeUpdateStatus('Preparing swap transaction...');
      
      const response = await fetch(`${ENDPOINTS.serverBase}/api/raydium/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMint: inputToken.address,
          outputMint: outputToken.address,
          amount: inputLamports,
          userPublicKey: walletPublicKey.toString(),
        }),
      });
      
      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        throw new Error('Component unmounted');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText || response.statusText}`);
      }
      
      const swapData = await response.json();
      
      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        throw new Error('Component unmounted');
      }
      
      if (!swapData.success || !swapData.transaction) {
        throw new Error(swapData.error || 'Failed to get transaction from server');
      }
      
      const outputAmount = swapData.outputAmount || 0;
      
      safeUpdateStatus('Transaction received, please approve...');
      const txBuffer = Buffer.from(swapData.transaction, 'base64');
      
      let transaction: Transaction | VersionedTransaction;
      try {
        transaction = VersionedTransaction.deserialize(txBuffer);
      } catch (e) {
        transaction = Transaction.from(txBuffer);
        transaction.feePayer = walletPublicKey;
      }
      
      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        throw new Error('Component unmounted');
      }
      
      const rpcUrl = HELIUS_STAKED_URL || ENDPOINTS.helius || `https://api.${CLUSTER}.solana.com`;
      const connection = new Connection(rpcUrl, 'confirmed');
      
      const signature = await sendTransaction(
        transaction,
        connection,
        {
          statusCallback: (status) => {
            if (!callbacks?.isComponentMounted || callbacks.isComponentMounted()) {
              TransactionService.filterStatusUpdate(status, (filteredStatus) => {
                safeUpdateStatus(filteredStatus);
              });
            }
          },
          confirmTransaction: true
        }
      );
      
      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        console.log('[RaydiumService] Component unmounted after transaction, but transaction was successful with signature:', signature);
        return {
          success: true,
          signature,
          inputAmount: inputLamports,
          outputAmount
        };
      }
      
      console.log('[RaydiumService] Transaction sent with signature:', signature);
      TransactionService.showSuccess(signature, 'swap');
      safeUpdateStatus('Swap successful!');
      
      return {
        success: true,
        signature,
        inputAmount: inputLamports,
        outputAmount
      };
    } catch (err: any) {
      if (err.message === 'Component unmounted') {
        console.log('[RaydiumService] Operation cancelled because component unmounted');
        return {
          success: false,
          error: new Error('Operation cancelled'),
          inputAmount: 0,
          outputAmount: 0
        };
      }
      
      console.error('[RaydiumService] Error:', err);
      
      if (!callbacks?.isComponentMounted || callbacks.isComponentMounted()) {
        TransactionService.showError(err);
      }
      
      return {
        success: false,
        error: err,
        inputAmount: 0,
        outputAmount: 0
      };
    }
  }
} 