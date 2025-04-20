import { Connection, clusterApiUrl, Cluster, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { ENDPOINTS } from '../../../config/constants';
import { CLUSTER, HELIUS_STAKED_URL } from '@env';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';
import { TokenInfo } from '../types/tokenTypes';

export interface JupiterSwapResponse {
  success: boolean;
  signature?: string;
  error?: Error | string;
  inputAmount: number;
  outputAmount: number;
}

export interface JupiterSwapCallback {
  statusCallback: (status: string) => void;
}

export interface JupiterQuoteData {
  data?: Array<{
    outAmount: string;
    [key: string]: any;
  }>;
  routePlan?: Array<any>;
  outAmount?: string;
  [key: string]: any;
}

/**
 * JupiterService - Provides methods for interacting with Jupiter Exchange
 * 
 * This service handles Jupiter-specific operations like:
 * - Getting quotes
 * - Building swap transactions
 * - Executing swaps
 */
export class JupiterService {
  /**
   * Gets a quote from Jupiter for a given swap
   */
  static async getQuote(
    inputMint: string, 
    outputMint: string, 
    inputAmount: number
  ): Promise<JupiterQuoteData> {
    try {
      console.log('Getting Jupiter quote...');
      
      const quoteUrl = `${ENDPOINTS.jupiter.quote}?inputMint=${inputMint
        }&outputMint=${outputMint}&amount=${Math.round(
          inputAmount,
        )}&slippageBps=50&swapMode=ExactIn`;
        
      const quoteResp = await fetch(quoteUrl);
      if (!quoteResp.ok) {
        throw new Error(`Jupiter quote failed: ${quoteResp.status}`);
      }
      
      const quoteData = await quoteResp.json();
      console.log('Jupiter quote received');
      
      return quoteData;
    } catch (error) {
      console.error("Error getting Jupiter quote:", error);
      throw error;
    }
  }

  /**
   * Extracts output amount from a Jupiter quote
   */
  static getOutputAmount(quoteData: JupiterQuoteData): number {
    let outLamports = 0;
    
    if (
      quoteData.data &&
      Array.isArray(quoteData.data) &&
      quoteData.data.length > 0
    ) {
      outLamports = parseFloat(quoteData.data[0].outAmount) || 0;
    } else if (
      quoteData.routePlan &&
      Array.isArray(quoteData.routePlan) &&
      quoteData.routePlan.length > 0
    ) {
      outLamports = parseFloat(quoteData.outAmount || '0') || 0;
    } else {
      throw new Error('No routes returned by Jupiter.');
    }
    
    return outLamports;
  }

  /**
   * Builds a swap transaction using Jupiter API
   */
  static async buildSwapTransaction(
    quoteData: JupiterQuoteData,
    walletPublicKey: string
  ): Promise<Buffer> {
    try {
      console.log('Building swap transaction from server...');
      
      const body = {
        quoteResponse: quoteData,
        userPublicKey: walletPublicKey,
      };
      
      const swapResp = await fetch(ENDPOINTS.jupiter.swap, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const swapData = await swapResp.json();
      if (!swapResp.ok || !swapData.swapTransaction) {
        throw new Error(
          swapData.error || 'Failed to get Jupiter swapTransaction.',
        );
      }
      
      console.log('Swap transaction received from server');

      const { swapTransaction } = swapData;
      return Buffer.from(swapTransaction, 'base64');
    } catch (error) {
      console.error("Error building swap transaction:", error);
      throw error;
    }
  }

  /**
   * Deserializes a transaction from a buffer
   */
  static deserializeTransaction(
    txBuffer: Buffer, 
    walletPublicKey: PublicKey
  ): Transaction | VersionedTransaction {
    let transaction: Transaction | VersionedTransaction;
    
    try {
      transaction = VersionedTransaction.deserialize(txBuffer);
      console.log('Deserialized as VersionedTransaction');
    } catch {
      transaction = Transaction.from(txBuffer);
      console.log('Deserialized as legacy Transaction');

      // Ensure feePayer is set for legacy transactions
      if (!transaction.feePayer) {
        transaction.feePayer = walletPublicKey;
        console.log('Set feePayer on legacy transaction');
      }
    }
    
    return transaction;
  }

  /**
   * Executes a token swap using Jupiter API
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
    callbacks?: JupiterSwapCallback
  ): Promise<JupiterSwapResponse> {
    try {
      // Convert to base units
      const inputLamports = this.toBaseUnits(inputAmount, inputToken.decimals);
      
      // Get quote from Jupiter
      callbacks?.statusCallback('Getting quote...');
      const quoteData = await this.getQuote(
        inputToken.address,
        outputToken.address,
        inputLamports
      );
      
      // Extract output amount
      const outLamports = this.getOutputAmount(quoteData);

      // Build swap transaction
      callbacks?.statusCallback('Building transaction...');
      const txBuffer = await this.buildSwapTransaction(
        quoteData,
        walletPublicKey.toString()
      );
      
      // Deserialize transaction
      const transaction = this.deserializeTransaction(txBuffer, walletPublicKey);

      // Get RPC connection
      const rpcUrl = HELIUS_STAKED_URL || ENDPOINTS.helius || clusterApiUrl(CLUSTER as Cluster);
      console.log('Using RPC URL:', rpcUrl);
      const connection = new Connection(rpcUrl, 'confirmed');

      // Send transaction with status updates
      callbacks?.statusCallback('Please approve the transaction...');
      console.log('Sending transaction...');
      
      const signature = await sendTransaction(
        transaction,
        connection,
        {
          statusCallback: (status) => {
            console.log(`[JupiterSwap] ${status}`);
            // Filter raw errors using TransactionService
            TransactionService.filterStatusUpdate(status, (filteredStatus) => {
              callbacks?.statusCallback(filteredStatus);
            });
          },
          confirmTransaction: true
        }
      );

      console.log('Transaction successfully sent with signature:', signature);

      // Show success notification
      TransactionService.showSuccess(signature, 'swap');

      callbacks?.statusCallback(`Swap successful!`);

      return {
        success: true,
        signature,
        inputAmount: inputLamports,
        outputAmount: outLamports
      };
    } catch (err: any) {
      console.error('Jupiter trade error:', err);
      
      // Show error notification
      TransactionService.showError(err);
      
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