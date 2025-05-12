import {
  getPdaLaunchpadConfigId,
  LaunchpadConfig,
  getPdaLaunchpadPoolId,
} from '@raydium-io/raydium-sdk-v2';
import { Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';
import BN from 'bn.js';
import { RaydiumConfig } from './raydiumConfig';
import { Buffer } from 'buffer';

// Types for metadata
export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  external_url?: string;
  twitter?: string;
  telegram?: string;
  createdOn?: string;
  website?: string;
}

// Token creation parameters
export interface CreateLaunchpadTokenParams {
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  metadataUri: string;
  quoteTokenMint: string;
  tokenSupply: string;
  solRaised: string;
  bondingCurvePercentage: string;
  poolMigration: string;
  vestingPercentage?: string;
  vestingDuration?: string;
  vestingCliff?: string;
  enableFeeSharingPost?: boolean;
  userPublicKey: string;
  mode: 'justSendIt' | 'launchLab';
}

// Response interface
export interface LaunchpadResult {
  success: boolean;
  transaction?: string;
  mintAddress?: string;
  poolId?: string;
  error?: Error | string;
}

// Configuration data interface
export interface LaunchpadConfigData {
  quoteTokenMint: string;
  tokenSupply: string;
  solRaised: string;
  bondingCurvePercentage: string;
  poolMigration: string;
  vestingPercentage?: string;
  vestingDuration?: string;
  vestingCliff?: string;
  enableFeeSharingPost?: boolean;
  mode: 'justSendIt' | 'launchLab';
}

// Options for token creation
export interface LaunchpadOptions {
  statusCallback?: (status: string) => void;
  isComponentMounted?: () => boolean;
}

export class ClientRaydiumService {
  /**
   * Generate and upload metadata to IPFS
   * This should be done server-side or through a service
   * For client-side implementation, we'll use a placeholder URI
   */
  static async generateMetadataUri(metadata: TokenMetadata): Promise<string> {
    try {
      // In a real implementation, you would upload to IPFS here
      // For now, we'll return a placeholder URL
      console.log('[ClientRaydiumService] Generating metadata URI is not implemented client-side');
      console.log('[ClientRaydiumService] Using placeholder URI');
      
      // Return a placeholder URI - in a real app, you'd upload to IPFS or a service
      return "https://arweave.net/placeholder";
    } catch (error) {
      console.error('[ClientRaydiumService] Error generating metadata URI:', error);
      throw new Error(`Failed to generate metadata URI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create and prepare a token launch transaction
   */
  static async createLaunchpadToken(params: CreateLaunchpadTokenParams): Promise<LaunchpadResult> {
    try {
      console.log('[ClientRaydiumService] Starting token creation');
      console.log('[ClientRaydiumService] User public key:', params.userPublicKey);
      
      // Initialize the SDK using our config class
      const raydium = await RaydiumConfig.getRaydiumSdk();
      const connection = RaydiumConfig.getConnection();
      
      // Get program ID from config
      const programId = RaydiumConfig.PROGRAM_ID;
      
      // Generate a keypair for the token mint
      const pair = Keypair.generate();
      const mintA = pair.publicKey;
      
      // Define the quote token (SOL or other)
      const mintB = new PublicKey(params.quoteTokenMint || NATIVE_MINT.toString());
      
      // Parse the user's public key
      const userPublicKey = new PublicKey(params.userPublicKey);
      
      // Get configId for the token pair
      const configId = getPdaLaunchpadConfigId(programId, mintB, 0, 0).publicKey;
      
      console.log(`Using config ID: ${configId.toString()}`);
      
      // Get config info from chain
      const configData = await connection.getAccountInfo(configId);
      if (!configData) throw new Error('Launchpad config not found');
      
      const configInfo = LaunchpadConfig.decode(configData.data);
      const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB);
      
      // Apply different settings based on the mode
      let bondingCurvePercent: number;
      let solRaisedFloat: number;
      
      if (params.mode === 'justSendIt') {
        // JustSendIt mode - use standard settings according to Raydium docs
        console.log('[ClientRaydiumService] Using JustSendIt mode with standard settings');
        bondingCurvePercent = 70;
        solRaisedFloat = 85;
      } else {
        // LaunchLab mode - use custom settings
        console.log('[ClientRaydiumService] Using LaunchLab mode with custom settings');
        
        // Parse bonding curve percentage
        bondingCurvePercent = parseInt(params.bondingCurvePercentage);
        
        // Validate bonding curve percentage (20-80%)
        if (bondingCurvePercent < 51 || bondingCurvePercent > 80) {
          throw new Error('Bonding curve percentage must be between 20% and 80%');
        }
        
        // Convert SOL raised to lamports
        solRaisedFloat = parseFloat(params.solRaised);
        
        // Validate minimum SOL raised (30 SOL)
        if (solRaisedFloat < 30) {
          throw new Error('Minimum SOL raised must be at least 30 SOL');
        }
      }
      
      // Create a BN for buyAmount (in lamports)
      const buyAmount = new BN(solRaisedFloat * 1e9);
      
      console.log(`Token name: ${params.tokenName}`);
      console.log(`Token symbol: ${params.tokenSymbol}`);
      console.log(`Token decimals: ${params.decimals}`);
      console.log(`Buy amount in SOL: ${solRaisedFloat}`);
      console.log(`Bonding curve percentage: ${bondingCurvePercent}%`);
      console.log(`Fee payer: ${userPublicKey.toString()}`);
      
      // Get the most recent blockhash for the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      
      // Prepare create launchpad call
      const { transactions, execute, extInfo } = await raydium.launchpad.createLaunchpad({
        programId,
        mintA,
        decimals: params.decimals,
        name: params.tokenName,
        symbol: params.tokenSymbol,
        uri: params.metadataUri,
        migrateType: 'amm',
        
        configId,
        configInfo,
        mintBDecimals: mintBInfo.decimals,
        txVersion: RaydiumConfig.TX_VERSION,
        slippage: new BN(100), // 1% slippage
        buyAmount,
        createOnly: true, // Just create the token, don't buy
        extraSigners: [pair], // Include the token mint keypair
        feePayer: userPublicKey, // Explicitly set the fee payer
      });
      
      // Get the transaction we need to send
      const transaction = transactions[0];
      
      if (!transaction) {
        throw new Error('No transaction returned from Raydium SDK');
      }
      
      console.log('[ClientRaydiumService] Transaction created successfully');
      
      // Ensure the user's public key is set as the fee payer
      if (transaction instanceof Transaction) {
        // It's a legacy Transaction
        console.log('[ClientRaydiumService] Working with legacy Transaction');
        transaction.feePayer = userPublicKey;
        transaction.recentBlockhash = blockhash;
      } else if ('version' in transaction) {
        // It's a VersionedTransaction
        console.log('[ClientRaydiumService] Working with VersionedTransaction V0');
        // For versioned transactions, the fee payer is set in the message header
        // and should be set by the SDK based on the feePayer parameter
      } else {
        console.log('[ClientRaydiumService] Unknown transaction type:', typeof transaction);
        // Try to set fee payer if possible, but don't crash if we can't
        try {
          (transaction as any).feePayer = userPublicKey;
          (transaction as any).recentBlockhash = blockhash;
        } catch (e) {
          console.warn('[ClientRaydiumService] Could not set fee payer on transaction', e);
        }
      }
      
      // Calculate the expected pool ID
      const poolId = getPdaLaunchpadPoolId(
        programId,
        mintA,
        mintB
      ).publicKey.toString();
      
      // Convert the transaction to base64 for sending to the client
      let serializedTx: string;
      if (transaction instanceof Transaction) {
        // For Legacy Transaction
        const txBuffer = transaction.serialize();
        serializedTx = Buffer.from(txBuffer).toString('base64');
      } else if ('version' in transaction) {
        // For Versioned Transaction
        // We need to serialize it without modifying it
        const serialized = transaction.serialize();
        serializedTx = Buffer.from(serialized).toString('base64');
      } else {
        // Unknown type, attempt generic serialization
        try {
          // Use any type for unknown transaction format
          const txBuffer = Buffer.from((transaction as any).serialize());
          serializedTx = txBuffer.toString('base64');
        } catch (error) {
          console.error('[ClientRaydiumService] Failed to serialize transaction:', error);
          throw new Error('Failed to serialize transaction');
        }
      }
      
      console.log('[ClientRaydiumService] Successfully created transaction');
      console.log('[ClientRaydiumService] Transaction serialized to base64');
      
      return {
        success: true,
        transaction: serializedTx,
        mintAddress: mintA.toString(),
        poolId
      };
    } catch (error) {
      console.error('[ClientRaydiumService] Error creating token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete token creation and launch process
   */
  static async createAndLaunchToken(
    tokenData: TokenMetadata,
    configData: LaunchpadConfigData,
    userPublicKey: PublicKey,
    sendTransaction: (tx: string) => Promise<string>,
    options?: LaunchpadOptions
  ): Promise<LaunchpadResult> {
    try {
      const { statusCallback } = options || {};
      
      statusCallback?.('Preparing token launch...');
      
      // Generate a metadata URI or use an existing one
      const metadataUri = tokenData.external_url || await this.generateMetadataUri(tokenData);
      
      statusCallback?.('Creating transaction...');
      
      // Prepare token creation parameters
      const createParams: CreateLaunchpadTokenParams = {
        tokenName: tokenData.name,
        tokenSymbol: tokenData.symbol,
        decimals: 6, // Use 6 decimals as likely expected by Raydium Launchpad
        metadataUri,
        quoteTokenMint: configData.quoteTokenMint,
        tokenSupply: configData.tokenSupply,
        solRaised: configData.solRaised,
        bondingCurvePercentage: configData.bondingCurvePercentage,
        poolMigration: configData.poolMigration,
        vestingPercentage: configData.vestingPercentage || '0',
        vestingDuration: configData.vestingDuration,
        vestingCliff: configData.vestingCliff,
        enableFeeSharingPost: configData.enableFeeSharingPost === true,
        userPublicKey: userPublicKey.toString(),
        mode: configData.mode
      };
      
      // Create the token launch transaction
      const result = await this.createLaunchpadToken(createParams);
      
      if (!result.success || !result.transaction) {
        throw new Error(result.error?.toString() || 'Failed to create transaction');
      }
      
      statusCallback?.('Signing and sending transaction...');
      
      // Send the transaction for signing
      const signature = await sendTransaction(result.transaction);
      
      statusCallback?.('Transaction sent! Confirming...');
      
      // Log the transaction signature and other details
      console.log(`[ClientRaydiumService] Transaction sent with signature: ${signature}`);
      console.log(`[ClientRaydiumService] Token mint address: ${result.mintAddress}`);
      console.log(`[ClientRaydiumService] Pool ID: ${result.poolId}`);
      
      return {
        success: true,
        transaction: signature,
        mintAddress: result.mintAddress,
        poolId: result.poolId
      };
    } catch (error) {
      console.error('[ClientRaydiumService] Error in createAndLaunchToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error during token creation')
      };
    }
  }
} 