import {
  Connection,
  Transaction,
  VersionedTransaction,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram
} from '@solana/web3.js';
import {ENDPOINTS} from '../../../config/constants';
import {CLUSTER, HELIUS_STAKED_URL} from '@env';
import {TransactionService} from '../../walletProviders/services/transaction/transactionService';
import {TokenInfo} from '../../dataModule/types/tokenTypes';
import {Buffer} from 'buffer';
// Note: You'll need to install this package
// import {
//   createCreateMetadataAccountV3Instruction,
//   PROGRAM_ID as METADATA_PROGRAM_ID,
//   findMetadataPda,
// } from '@metaplex-foundation/mpl-token-metadata';
import {
  createInitializeMintInstruction, 
  getMint, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import BN from 'bn.js';

// Constants
const DEFAULT_SLIPPAGE_BPS = 300; // 2% default slippage for Raydium

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

// Launchpad Types
export interface LaunchpadTokenData {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  imageData?: string;
}

export interface LaunchpadConfigData {
  quoteTokenMint: string;
  tokenSupply: string;
  solRaised: string;
  bondingCurvePercentage: string;
  poolMigration: string;
  vestingPercentage: string;
  vestingDuration?: string; // Duration in months
  vestingCliff?: string; // Cliff in months
  enableFeeSharingPost?: boolean; // Whether to enable fee sharing after pool migration
  mode: 'justSendIt' | 'launchLab'; // Mode to identify which creation path to use
}

export interface LaunchpadResponse {
  success: boolean;
  signature?: string;
  error?: Error | string;
  poolId?: string;
  mintAddress?: string;
}

// Token launch parameters from server
export interface TokenLaunchParameters {
  mintAccount: string; // base64 encoded secret key
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

// Stub for metadata instructions since we don't have the library
// In a real implementation, install @metaplex-foundation/mpl-token-metadata
const findMetadataPda = (mint: PublicKey): PublicKey => {
  // This is a placeholder - in real code you'd use the actual metaplex function
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mint.toBuffer()],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  )[0];
};

// Stub for metadata instructions
const createCreateMetadataAccountV3Instruction = (
  accounts: {
    metadata: PublicKey;
    mint: PublicKey;
    mintAuthority: PublicKey;
    payer: PublicKey;
    updateAuthority: PublicKey;
  },
  args: {
    createMetadataAccountArgsV3: {
      data: {
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
        creators: null;
        collection: null;
        uses: null;
      };
      isMutable: boolean;
      collectionDetails: null;
    };
  }
) => {
  // This is a placeholder - in a real implementation, you'd use the actual metaplex instruction
  return SystemProgram.transfer({
    fromPubkey: accounts.payer,
    toPubkey: accounts.metadata,
    lamports: 0,
  });
};

/**
 * RaydiumService - Client-side service for executing Raydium operations
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
   * Creates a new token and launches it on Raydium
   * Using Raydium's approach: client-side transaction creation
   */
  static async createAndLaunchToken(
    tokenData: LaunchpadTokenData,
    configData: LaunchpadConfigData,
    walletPublicKey: PublicKey,
    sendTransaction: (
      transaction: Transaction | VersionedTransaction,
      connection: Connection,
      options?: {
        statusCallback?: (status: string) => void;
        confirmTransaction?: boolean;
      },
    ) => Promise<string>,
    callbacks?: RaydiumSwapCallback,
  ): Promise<LaunchpadResponse> {
    const safeUpdateStatus = (status: string) => {
      if (!callbacks?.isComponentMounted || callbacks.isComponentMounted()) {
        callbacks?.statusCallback?.(status);
      }
    };

    try {
      safeUpdateStatus('Preparing token launch...');

      // Parse token supply (remove commas)
      const cleanSupply = configData.tokenSupply.replace(/,/g, '');

      // Step 1: Get token launch parameters from the server
      safeUpdateStatus('Getting token launch parameters...');
      const response = await fetch(
        `${ENDPOINTS.serverBase}/api/raydium/launchpad/get-parameters`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tokenName: tokenData.name,
            tokenSymbol: tokenData.symbol,
            decimals: tokenData.decimals || 9,
            description: tokenData.description,
            uri: tokenData.uri,
            twitter: tokenData.twitter,
            telegram: tokenData.telegram,
            website: tokenData.website,
            imageData: tokenData.imageData,
            quoteTokenMint: configData.quoteTokenMint,
            tokenSupply: cleanSupply,
            solRaised: configData.solRaised,
            bondingCurvePercentage: configData.bondingCurvePercentage,
            poolMigration: configData.poolMigration,
            vestingPercentage: configData.vestingPercentage,
            vestingDuration: configData.vestingDuration,
            vestingCliff: configData.vestingCliff,
            enableFeeSharingPost: configData.enableFeeSharingPost,
            userPublicKey: walletPublicKey.toString(),
            mode: configData.mode,
          }),
        },
      );

      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        throw new Error('Component unmounted');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText || response.statusText}`);
      }

      const paramsData = await response.json();

      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        throw new Error('Component unmounted');
      }

      if (!paramsData.success || !paramsData.parameters) {
        throw new Error(
          paramsData.error || 'Failed to get token launch parameters',
        );
      }

      // Get the launch parameters
      const params: TokenLaunchParameters = paramsData.parameters;

      // Step 2: Create transaction on the client side
      safeUpdateStatus('Creating transaction...');
      
      // Setup connection
      const rpcUrl =
        HELIUS_STAKED_URL ||
        ENDPOINTS.helius ||
        `https://api.${CLUSTER}.solana.com`;
      const connection = new Connection(rpcUrl, 'confirmed');

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = 
        await connection.getLatestBlockhash();
      
      // Create a new transaction
      const transaction = new Transaction({
        feePayer: walletPublicKey,
        blockhash,
        lastValidBlockHeight,
      });
      
      // Reconstruct the mint account from the provided secret key
      const mintKeyBuffer = Buffer.from(params.mintAccount, 'base64');
      const mintKeypair = Keypair.fromSecretKey(
        new Uint8Array(mintKeyBuffer)
      );
      
      // Add instructions to create the token mint
      const mintPubkey = new PublicKey(params.mintPubkey);
      const decimals = params.decimals;
      
      // Create and initialize the mint account
      const mintRent = await connection.getMinimumBalanceForRentExemption(
        82 // Mint account size
      );
      
      // Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: walletPublicKey,
          newAccountPubkey: mintPubkey,
          space: 82,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      
      // Initialize mint
      transaction.add(
        createInitializeMintInstruction(
          mintPubkey,
          decimals,
          walletPublicKey,
          walletPublicKey
        )
      );
      
      // Create metadata
      const metadataPDA = findMetadataPda(mintPubkey);
      
      // Add metadata instruction
      transaction.add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataPDA,
            mint: mintPubkey,
            mintAuthority: walletPublicKey,
            payer: walletPublicKey,
            updateAuthority: walletPublicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: params.tokenName,
                symbol: params.tokenSymbol,
                uri: params.metadataUri,
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );
      
      // Create token account for the user if it doesn't exist
      const userTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        walletPublicKey
      );
      
      // Add instruction to create token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletPublicKey,
          userTokenAccount,
          walletPublicKey,
          mintPubkey
        )
      );
      
      // Mint initial tokens to the user
      const totalSupply = new BN(params.solRaisedAmount)
        .mul(new BN(10).pow(new BN(params.decimals)));
      
      transaction.add(
        createMintToInstruction(
          mintPubkey,
          userTokenAccount,
          walletPublicKey,
          totalSupply.toNumber()
        )
      );
      
      // Step 3: Sign the transaction with user wallet
      safeUpdateStatus('Please approve the transaction...');
      
      const { blockhash: newBlockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = newBlockhash;
      
      // The partially signed transaction needs to include both the user's signature and the mint keypair's signature
      transaction.partialSign(mintKeypair);
      
      // Get serialized transaction with the mint keypair signature
      const serializedTx = transaction.serialize({
        requireAllSignatures: false, // Important: don't require all signatures yet
      }).toString('base64');
      
      // Step 4: Send to the client's wallet for signing
      const userSignedTxId = await sendTransaction(transaction, connection, {
        statusCallback: status => {
          safeUpdateStatus(`Signing: ${status}`);
        },
        confirmTransaction: false, // Don't confirm yet
      });
      
      // Step 5: Send user-signed transaction to server for additional signing (if needed)
      safeUpdateStatus('Transaction signed, finalizing...');
      
      const signResponse = await fetch(
        `${ENDPOINTS.serverBase}/api/raydium/launchpad/sign-transaction`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            tx: userSignedTxId, // This contains the serialized transaction
          }),
        }
      );
      
      if (!signResponse.ok) {
        const errorText = await signResponse.text();
        throw new Error(`Server error during signing: ${errorText || signResponse.statusText}`);
      }
      
      const signData = await signResponse.json();
      
      if (!signData.success || !signData.tx) {
        throw new Error('Failed to get signed transaction');
      }
      
      // Step 6: Submit the fully signed transaction to the network
      safeUpdateStatus('Submitting transaction to the network...');
      
      // Deserialize the fully signed transaction
      const fullSignedTxBuffer = Buffer.from(signData.tx, 'base64');
      let finalTx;
      
      try {
        finalTx = Transaction.from(fullSignedTxBuffer);
      } catch (e) {
        // Try as VersionedTransaction if Transaction.from fails
        finalTx = VersionedTransaction.deserialize(new Uint8Array(fullSignedTxBuffer));
      }
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(
        finalTx.serialize(),
        { skipPreflight: true }
      );
      
      // Wait for confirmation
      safeUpdateStatus('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: newBlockhash,
        lastValidBlockHeight,
      });
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }
      
      // Success!
      safeUpdateStatus('Token created successfully!');
      TransactionService.showSuccess(signature, 'token');
      
      return {
        success: true,
        signature,
        mintAddress: params.mintPubkey,
        poolId: params.poolId,
      };
      
    } catch (err: any) {
      if (err.message === 'Component unmounted') {
        console.log(
          '[RaydiumService] Operation cancelled because component unmounted',
        );
        return {
          success: false,
          error: new Error('Operation cancelled'),
        };
      }

      console.error('[RaydiumService] Error:', err);

      if (!callbacks?.isComponentMounted || callbacks.isComponentMounted()) {
        TransactionService.showError(err);
      }

      return {
        success: false,
        error: err,
      };
    }
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
      options?: {
        statusCallback?: (status: string) => void;
        confirmTransaction?: boolean;
      },
    ) => Promise<string>,
    callbacks?: RaydiumSwapCallback,
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          inputMint: inputToken.address,
          outputMint: outputToken.address,
          amount: inputLamports,
          userPublicKey: walletPublicKey.toString(),
          slippageBps: DEFAULT_SLIPPAGE_BPS, // Use a higher default slippage to mitigate failures
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
        throw new Error(
          swapData.error || 'Failed to get transaction from server',
        );
      }

      const outputAmount = swapData.outputAmount || 0;

      safeUpdateStatus('Transaction received, please approve...');
      const txBuffer = Buffer.from(swapData.transaction, 'base64');

      let transaction: Transaction | VersionedTransaction;
      try {
        transaction = VersionedTransaction.deserialize(
          new Uint8Array(txBuffer),
        );
      } catch (e) {
        transaction = Transaction.from(txBuffer);
        transaction.feePayer = walletPublicKey;
      }

      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        throw new Error('Component unmounted');
      }

      const rpcUrl =
        HELIUS_STAKED_URL ||
        ENDPOINTS.helius ||
        `https://api.${CLUSTER}.solana.com`;
      const connection = new Connection(rpcUrl, 'confirmed');

      const signature = await sendTransaction(transaction, connection, {
        statusCallback: status => {
          if (
            !callbacks?.isComponentMounted ||
            callbacks.isComponentMounted()
          ) {
            TransactionService.filterStatusUpdate(status, filteredStatus => {
              safeUpdateStatus(filteredStatus);
            });
          }
        },
        confirmTransaction: true,
      });

      if (callbacks?.isComponentMounted && !callbacks.isComponentMounted()) {
        console.log(
          '[RaydiumService] Component unmounted after transaction, but transaction was successful with signature:',
          signature,
        );
        return {
          success: true,
          signature,
          inputAmount: inputLamports,
          outputAmount,
        };
      }

      console.log(
        '[RaydiumService] Transaction sent with signature:',
        signature,
      );
      TransactionService.showSuccess(signature, 'swap');
      safeUpdateStatus('Swap successful!');

      return {
        success: true,
        signature,
        inputAmount: inputLamports,
        outputAmount,
      };
    } catch (err: any) {
      if (err.message === 'Component unmounted') {
        console.log(
          '[RaydiumService] Operation cancelled because component unmounted',
        );
        return {
          success: false,
          error: new Error('Operation cancelled'),
          inputAmount: 0,
          outputAmount: 0,
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
        outputAmount: 0,
      };
    }
  }
}
