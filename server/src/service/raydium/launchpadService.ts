import {
  TxVersion,
  LAUNCHPAD_PROGRAM,
  DEV_LAUNCHPAD_PROGRAM,
  getPdaLaunchpadConfigId,
  LaunchpadConfig,
  Raydium,
  getPdaLaunchpadPoolId,
  PlatformConfig,
} from '@raydium-io/raydium-sdk-v2';
import {
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import {NATIVE_MINT} from '@solana/spl-token';
import BN from 'bn.js';
import {initSdk} from './config';
import {uploadToIpfs} from '../../utils/ipfs';
import FormData from 'form-data';

// Environment configurations
const CLUSTER = process.env.SOLANA_CLUSTER || 'mainnet-beta';
const IS_DEVNET = CLUSTER === 'devnet';
const PROGRAM_ID = IS_DEVNET ? DEV_LAUNCHPAD_PROGRAM : LAUNCHPAD_PROGRAM;

// Types for metadata
interface TokenMetadata {
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
interface CreateLaunchpadTokenParams {
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  metadataUri: string;
  quoteTokenMint: string;
  tokenSupply: string;
  solRaised: string;
  bondingCurvePercentage: string;
  poolMigration: string;
  vestingPercentage: string;
  vestingDuration?: string; // In months
  vestingCliff?: string; // In months
  enableFeeSharingPost?: boolean;
  userPublicKey: string;
  mode: 'justSendIt' | 'launchLab'; // Mode to identify which creation path to use
}

// Token parameters - For making it easier to pass to client
export interface TokenLaunchParameters {
  mintAccount: string; // base58 encoded secret key
  programId: string;
  mintPubkey: string;
  configId: string;
  configInfo: any; // LaunchpadConfig data
  mintBInfo: any; // Token info for quote token
  solRaisedAmount: string; // in lamports
  bondingCurvePercent: number;
  metadataUri: string;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  poolId: string;
}

export class RaydiumLaunchpadService {
  /**
   * Generate and upload metadata to IPFS
   * Uses the project's ipfs.ts utility to handle the upload
   */
  static async generateMetadataUri(metadata: TokenMetadata): Promise<string> {
    try {
      // Check if we have base64 image data
      let imageBuffer: Buffer | null = null;
      if (metadata.image && metadata.image.startsWith('data:image')) {
        // Extract the base64 data and convert to buffer
        const base64Data = metadata.image.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      // Prepare the metadata object for IPFS
      const metadataObj = {
        name: metadata.name,
        symbol: metadata.symbol,
        description:
          metadata.description ||
          `${metadata.name} token launched via Raydium Launchpad`,
        createdOn: metadata.createdOn || 'https://raydium.io/',
        twitter: metadata.twitter || '',
        telegram: metadata.telegram || '',
        website: metadata.website || metadata.external_url || '',
        showName: 'true', // Convert boolean to string
      };

      // If we don't have an image buffer, we can't upload an image
      // In a real implementation, you might want to use a default image
      if (!imageBuffer) {
        console.log(
          '[RaydiumLaunchpadService] No image data provided, using default metadata',
        );

        // Create a FormData object and make a direct request to the Pump.fun API
        const formData = new FormData();

        // Add metadata fields - ensure all values are strings
        for (const [key, value] of Object.entries(metadataObj)) {
          formData.append(key, value.toString());
        }

        const {default: fetch} = await import('node-fetch');
        const response = await fetch('https://pump.fun/api/ipfs', {
          method: 'POST',
          body: formData as any, // Cast to any to work around type issues
        });

        if (!response.ok) {
          throw new Error(`Failed to upload metadata: ${response.statusText}`);
        }

        const data = (await response.json()) as {metadataUri: string};
        return data.metadataUri;
      }

      // Use the existing uploadToIpfs function to upload both image and metadata
      return await uploadToIpfs(imageBuffer, metadataObj);
    } catch (error) {
      console.error(
        '[RaydiumLaunchpadService] Error generating metadata URI:',
        error,
      );
      throw new Error(
        `Failed to generate metadata URI: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Generate token launch parameters that will be sent to the client
   * for client-side transaction creation
   */
  static async generateLaunchParameters(
    params: CreateLaunchpadTokenParams,
  ): Promise<TokenLaunchParameters> {
    try {
      console.log('[RaydiumLaunchpadService] Generating launch parameters');
      console.log(
        '[RaydiumLaunchpadService] User public key:',
        params.userPublicKey,
      );

      const raydium = await initSdk();

      // Get program ID based on environment
      const programId = PROGRAM_ID;

      // Generate a keypair for the token mint
      const pair = Keypair.generate();
      const mintA = pair.publicKey;

      // Define the quote token (SOL by default)
      const mintB = new PublicKey(
        params.quoteTokenMint || NATIVE_MINT.toString(),
      );

      // Parse the user's public key
      const userPublicKey = new PublicKey(params.userPublicKey);

      // Get configId for the default (SOL) pair
      const configId = getPdaLaunchpadConfigId(
        programId,
        mintB,
        0,
        0,
      ).publicKey;

      console.log(`Using config ID: ${configId.toString()}`);

      // Get config info from chain
      const configData = await raydium.connection.getAccountInfo(configId);
      if (!configData) throw new Error('Launchpad config not found');

      const configInfo = LaunchpadConfig.decode(configData.data);
      const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB);

      // Apply different settings based on the mode
      let bondingCurvePercent: number;
      let solRaisedFloat: number;

      if (params.mode === 'justSendIt') {
        // JustSendIt mode - use standard settings according to Raydium docs
        console.log(
          '[RaydiumLaunchpadService] Using JustSendIt mode with standard settings',
        );
        // Standard is 85 SOL threshold and 50% on bonding curve
        bondingCurvePercent = 50;
        solRaisedFloat = 85;
      } else {
        // LaunchLab mode - use custom settings
        console.log(
          '[RaydiumLaunchpadService] Using LaunchLab mode with custom settings',
        );

        // Parse bonding curve percentage
        bondingCurvePercent = parseInt(params.bondingCurvePercentage);

        // Validate bonding curve percentage (20-80%)
        if (bondingCurvePercent < 20 || bondingCurvePercent > 80) {
          throw new Error(
            'Bonding curve percentage must be between 20% and 80%',
          );
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

      // Calculate the expected pool ID
      const poolId = getPdaLaunchpadPoolId(
        programId,
        mintA,
        mintB,
      ).publicKey.toString();

      // Prepare the parameters to send to the client
      return {
        mintAccount: Buffer.from(pair.secretKey).toString('base64'),
        programId: programId.toString(),
        mintPubkey: mintA.toString(),
        configId: configId.toString(),
        configInfo: {
          ...configInfo,
          mintB: configInfo.mintB.toString(), // Convert PublicKey to string for serialization
        },
        mintBInfo: {
          ...mintBInfo,
          address: mintBInfo.address.toString(), // Convert PublicKey to string
        },
        solRaisedAmount: buyAmount.toString(),
        bondingCurvePercent,
        metadataUri: params.metadataUri,
        tokenName: params.tokenName,
        tokenSymbol: params.tokenSymbol,
        decimals: params.decimals,
        poolId,
      };
    } catch (error) {
      console.error('[RaydiumLaunchpadService] Error generating parameters:', error);
      throw error;
    }
  }

  /**
   * Process and sign a transaction from the client
   * Used by the client to add server-side signatures
   */
  static async signTransaction(
    base64Transaction: string,
  ): Promise<string> {
    try {
      console.log('[RaydiumLaunchpadService] Signing transaction');
      
      // Decode base64 transaction
      const txBuffer = Buffer.from(base64Transaction, 'base64');
      
      // We should generate a secure server-side keypair and store it safely
      // For demo purposes, we'll just generate a random keypair
      // In production, you would use a fixed keypair stored securely
      const serverSigner = Keypair.generate();
      
      try {
        // Try to deserialize as a VersionedTransaction
        const versionedTx = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
        
        // Add server signature (in production you would verify the transaction first)
        versionedTx.sign([serverSigner]);
        
        // Return the signed transaction
        return Buffer.from(versionedTx.serialize()).toString('base64');
      } catch (error) {
        // Fall back to legacy Transaction format
        const transaction = Transaction.from(txBuffer);
        
        // Sign with server keypair
        transaction.partialSign(serverSigner);
        
        // Return the signed transaction
        return transaction.serialize().toString('base64');
      }
    } catch (error) {
      console.error('[RaydiumLaunchpadService] Error signing transaction:', error);
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Legacy method - Create a new token and launchpad pool
   * This is kept for compatibility but we'll use the new flow with client-side tx creation
   */
  static async createLaunchpadToken(
    params: CreateLaunchpadTokenParams,
  ): Promise<{
    transaction: string;
    mintAddress: string;
    poolId: string;
  }> {
    try {
      // Generate the launch parameters
      const launchParams = await this.generateLaunchParameters(params);
      
      // Return the required data
      return {
        transaction: '', // We're not creating a transaction on the server anymore
        mintAddress: launchParams.mintPubkey,
        poolId: launchParams.poolId,
      };
    } catch (error) {
      console.error('[RaydiumLaunchpadService] Error creating token:', error);
      throw error;
    }
  }
}
