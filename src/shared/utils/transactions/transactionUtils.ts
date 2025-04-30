import {
  Connection,
  Transaction,
  VersionedTransaction,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  TransactionMessage,
  clusterApiUrl,
  Cluster,
} from '@solana/web3.js';
import {Buffer} from 'buffer';
import { TransactionService } from '@/modules/walletProviders/services/transaction/transactionService';
import { store } from '@/shared/state/store';
import { Platform } from 'react-native';
import { StandardWallet } from '@/modules/walletProviders/types';
import { 
  HELIUS_STAKED_URL, 
  HELIUS_STAKED_API_KEY, 
  CLUSTER 
} from '@env';

/**
 * Fee tier to microLamports mapping for priority transactions
 */
export const DEFAULT_FEE_MAPPING: Record<string, number> = {
  'low': 1_000,
  'medium': 10_000,
  'high': 100_000,
  'very-high': 1_000_000,
};

// Commission wallet to receive 0.5% of transaction amounts
export const COMMISSION_WALLET_ADDRESS = '4iFgpVYSqxjyFekFP2XydJkxgXsK7NABJcR7T6zNa1Ty';
export const COMMISSION_PERCENTAGE = 0.5; // 0.5%

/**
 * Creates a Solana Connection object, prioritizing Helius Staked RPC if available.
 */
export function getRpcConnection(): Connection {
  let rpcUrl = HELIUS_STAKED_URL;
  let apiKey: string | undefined = HELIUS_STAKED_API_KEY;

  // Fallback to clusterApiUrl if Helius URL is not set
  if (!rpcUrl) {
    console.warn('[getRpcConnection] Helius Staked RPC URL not found, using default cluster URL.');
    rpcUrl = clusterApiUrl(CLUSTER as Cluster);
    apiKey = undefined; // No API key for default cluster URL
  }

  console.log(`[getRpcConnection] Using RPC URL: ${rpcUrl.substring(0, 20)}...`);

  const connectionConfig: any = { commitment: 'confirmed' };
  if (apiKey) {
    // Note: Helius API keys are usually appended to the URL, not passed in config
    // Adjust if your specific Helius setup requires a different method
    // Example: rpcUrl = `${rpcUrl}?api-key=${apiKey}` - Let's assume URL already includes key if needed
  }

  return new Connection(rpcUrl, connectionConfig);
}

/**
 * Gets the current transaction mode from Redux state
 */
export const getCurrentTransactionMode = (): 'jito' | 'priority' => {
  return store.getState().transaction.transactionMode;
};

/**
 * Gets the current fee tier from Redux state
 */
export const getCurrentFeeTier = (): 'low' | 'medium' | 'high' | 'very-high' => {
  return store.getState().transaction.selectedFeeTier;
};

/**
 * Gets the microLamports value for the current fee tier
 */
export const getCurrentFeeMicroLamports = (feeMapping = DEFAULT_FEE_MAPPING): number => {
  const feeTier = getCurrentFeeTier();
  return feeMapping[feeTier] || feeMapping.medium;
};

/**
 * Calculates commission amount in lamports based on the transaction amount
 */
export const calculateCommissionLamports = (transactionLamports: number): number => {
  return Math.floor(transactionLamports * (COMMISSION_PERCENTAGE / 100));
};

/**
 * Creates an instruction to transfer the commission to the commission wallet
 */
export const createCommissionInstruction = (
  fromPubkey: PublicKey,
  transactionLamports: number
): TransactionInstruction => {
  const commissionLamports = calculateCommissionLamports(transactionLamports);
  
  return SystemProgram.transfer({
    fromPubkey,
    toPubkey: new PublicKey(COMMISSION_WALLET_ADDRESS),
    lamports: commissionLamports,
  });
};

/**
 * Creates priority fee instructions based on the current fee tier
 */
export const createPriorityFeeInstructions = (
  feeMapping = DEFAULT_FEE_MAPPING
): TransactionInstruction[] => {
  const feeTier = getCurrentFeeTier();
  const microLamports = feeMapping[feeTier] || feeMapping.medium;
  
  // Set compute unit limit (same for all transactions)
  const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 2_000_000,
  });
  
  // Set compute unit price based on selected fee tier
  const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports,
  });
  
  return [computeUnitLimitIx, computeUnitPriceIx];
};

/**
 * Send a transaction directly using MWA (Mobile Wallet Adapter) with priority fees
 */
export async function sendPriorityTransactionMWA(
  connection: Connection,
  recipient: string,
  lamports: number,
  feeMapping: Record<string, number> = DEFAULT_FEE_MAPPING,
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  onStatusUpdate?.('[sendPriorityTransactionMWA] Starting MWA priority tx');
  console.log(
    '[sendPriorityTransactionMWA] Starting MWA priority tx, recipient=',
    recipient,
    'lamports=',
    lamports
  );

  if (Platform.OS !== 'android') {
    throw new Error('MWA is only supported on Android');
  }

  const mwaModule = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
  const {transact} = mwaModule;
  const feeTier = getCurrentFeeTier();
  const microLamports = feeMapping[feeTier] || DEFAULT_FEE_MAPPING.low;

  console.log('[sendPriorityTransactionMWA] microLamports from feeMapping:', microLamports);
  onStatusUpdate?.(`Using ${feeTier} priority fee (${microLamports} microLamports)`);

  return await transact(async (wallet: any) => {
    try {
      console.log('[sendPriorityTransactionMWA] Inside transact callback...');
      onStatusUpdate?.('Authorizing with wallet...');
      
      // Use the correct cluster format with 'solana:' prefix
      const authResult = await wallet.authorize({
        cluster: 'devnet', // Changed from 'solana:devnet' to 'devnet'
        identity: {
          name: 'React Native dApp',
          uri: 'https://yourdapp.com',
          icon: 'favicon.ico',
        },
      });
      console.log('[sendPriorityTransactionMWA] Authorization result:', authResult);

      const {Buffer} = require('buffer');
      const userEncodedPubkey = authResult.accounts[0].address;
      const userPubkeyBytes = Buffer.from(userEncodedPubkey, 'base64');
      const userPubkey = new PublicKey(userPubkeyBytes);
      console.log('[sendPriorityTransactionMWA] userPubkey:', userPubkey.toBase58());
      onStatusUpdate?.(`User public key: ${userPubkey.toBase58().slice(0, 6)}...${userPubkey.toBase58().slice(-4)}`);

      // 2) Build instructions
      console.log('[sendPriorityTransactionMWA] Building instructions...');
      onStatusUpdate?.('Building transaction...');
      const toPublicKey = new PublicKey(recipient);
      
      // Calculate commission amount
      const commissionLamports = calculateCommissionLamports(lamports);
      const remainingLamports = lamports - commissionLamports;
      
      // Create transfer instruction for the main amount (minus commission)
      const transferIx = SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: toPublicKey,
        lamports: remainingLamports,
      });
      
      // Create commission transfer instruction
      const commissionIx = SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: new PublicKey(COMMISSION_WALLET_ADDRESS),
        lamports: commissionLamports,
      });

      const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 2_000_000,
      });
      const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports,
      });

      const instructions: TransactionInstruction[] = [
        computeUnitLimitIx,
        computeUnitPriceIx,
        transferIx,
        commissionIx,
      ];
      console.log('[sendPriorityTransactionMWA] Instructions created:', instructions.length);

      // 3) Build transaction with retry logic for blockhash
      console.log('[sendPriorityTransactionMWA] Fetching latest blockhash...');
      
      // Get the latest blockhash with retry logic
      const getLatestBlockhash = async (retries = 3): Promise<{ blockhash: string }> => {
        try {
          return await connection.getLatestBlockhash('confirmed');
        } catch (error: any) {
          if (retries > 0) {
            console.log(`Failed to get latest blockhash, retrying... (${retries} attempts left)`);
            // Wait a short time before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            return getLatestBlockhash(retries - 1);
          }
          throw new Error(`Failed to get latest blockhash after multiple attempts: ${error.message}`);
        }
      };
      
      const { blockhash } = await getLatestBlockhash();
      console.log('[sendPriorityTransactionMWA] blockhash:', blockhash);

      const messageV0 = new TransactionMessage({
        payerKey: userPubkey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      console.log('[sendPriorityTransactionMWA] Compiled transaction (MWA)', transaction);

      // Try using signTransactions first, then manually submit
      console.log('[sendPriorityTransactionMWA] Calling wallet.signTransactions()...');
      onStatusUpdate?.('Requesting signature from wallet...');
      const signedTransactions = await wallet.signTransactions({
        transactions: [transaction],
      });
      console.log('[sendPriorityTransactionMWA] signTransactions returned signed transactions');

      if (!signedTransactions?.length) {
        throw new Error('No signed transactions returned from signTransactions');
      }
      
      // Now submit the signed transaction
      const signedTx = signedTransactions[0];
      console.log('[sendPriorityTransactionMWA] Submitting signed transaction to network...');
      onStatusUpdate?.('Submitting transaction to network...');
      
      // Send transaction with retry logic
      const sendTransaction = async (tx: VersionedTransaction, retries = 3): Promise<string> => {
        try {
          return await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });
        } catch (error) {
          if (retries > 0) {
            console.log(`Failed to send transaction, retrying... (${retries} attempts left)`);
            // Wait a short time before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            return sendTransaction(tx, retries - 1);
          }
          throw error;
        }
      };
      
      const signature = await sendTransaction(signedTx);
      console.log('[sendPriorityTransactionMWA] Got signature:', signature);

      // 5) confirm
      console.log('[sendPriorityTransactionMWA] Confirming transaction on-chain...');
      onStatusUpdate?.(`Transaction submitted (${signature.slice(0, 8)}...)`);
      onStatusUpdate?.('Confirming transaction...');
      
      // Confirm transaction with retry logic
      const confirmTransaction = async (sig: string, retries = 3): Promise<any> => {
        try {
          return await connection.confirmTransaction(sig, 'confirmed');
        } catch (error: any) {
          if (retries > 0) {
            console.log(`Failed to confirm transaction, retrying... (${retries} attempts left)`);
            // Wait a short time before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return confirmTransaction(sig, retries - 1);
          }
          
          // If confirmation fails after all retries, check transaction status directly
          try {
            console.log(`[sendPriorityTransactionMWA] Checking transaction status directly: ${sig}`);
            const status = await connection.getSignatureStatus(sig, {searchTransactionHistory: true});
            
            if (status && status.value !== null) {
              if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
                console.log(`[sendPriorityTransactionMWA] Transaction verified as ${status.value.confirmationStatus} via status check`);
                return { value: { err: null } }; // Return a successful confirmation object
              } else if (!status.value.err) {
                return { value: { err: null } }; // No error but not confirmed yet
              }
            }
          } catch (statusError) {
            console.error(`[sendPriorityTransactionMWA] Error checking transaction status:`, statusError);
          }
          
          // Try checking getTransaction as a last resort
          try {
            const transaction = await connection.getTransaction(sig, {
              maxSupportedTransactionVersion: 0,
            });
            
            if (transaction) {
              console.log(`[sendPriorityTransactionMWA] Transaction found in ledger`);
              return { value: { err: null } }; // Return a successful confirmation object
            }
          } catch (txError) {
            console.error(`[sendPriorityTransactionMWA] Error fetching transaction details:`, txError);
          }
          
          throw error; // If we couldn't verify success, rethrow the original error
        }
      };
      
      // Attempt to confirm the transaction
      const confirmation = await confirmTransaction(signature);
      
      if (confirmation.value.err) {
        // Create a proper error with logs
        const error = new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        // Add logs if they exist
        if (confirmation.value.err && typeof confirmation.value.err === 'object' && 'logs' in confirmation.value.err) {
          (error as any).logs = confirmation.value.err.logs;
        }
        TransactionService.showError(error);
        throw error;
      }

      console.log('[sendPriorityTransactionMWA] Transaction confirmed successfully!');
      onStatusUpdate?.('Transaction confirmed successfully!');
      TransactionService.showSuccess(signature, 'transfer');
      return signature;
    } catch (error: any) {
      console.log('[sendPriorityTransactionMWA] Caught error inside transact callback:', error);
      // Don't send raw error details in status update
      onStatusUpdate?.('Transaction failed');
      throw error;
    }
  });
}

/**
 * Sends a transaction with the current priority fee settings
 */
export async function sendTransactionWithPriorityFee({
  wallet,
  instructions,
  connection,
  shouldUsePriorityFee = true,
  includeCommission = true,
  commissionData, // Optional data for commission calculation
  onStatusUpdate,
}: {
  wallet: StandardWallet | any;
  instructions: TransactionInstruction[];
  connection: Connection;
  shouldUsePriorityFee?: boolean;
  includeCommission?: boolean;
  commissionData?: { fromPubkey: PublicKey; transactionLamports: number };
  onStatusUpdate?: (status: string) => void;
}): Promise<string> {
  // Get transaction mode from Redux
  const transactionMode = getCurrentTransactionMode();
  
  // 1. Create all instructions
  let allInstructions: TransactionInstruction[] = [];
  
  // Add priority fee instructions only if we're in priority mode
  // and shouldUsePriorityFee is true
  if (transactionMode === 'priority' && shouldUsePriorityFee) {
    const priorityInstructions = createPriorityFeeInstructions();
    allInstructions = [...priorityInstructions, ...instructions];
    onStatusUpdate?.(`Using ${getCurrentFeeTier()} priority fee`);
  } 
  // For Jito mode, just add compute unit limit (no priority fee)
  else if (transactionMode === 'jito') {
    const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 2_000_000,
    });
    allInstructions = [computeUnitLimitIx, ...instructions];
    onStatusUpdate?.('Using Jito bundling');
  } 
  // No transaction mode specified, just use the instructions as is
  else {
    allInstructions = [...instructions];
  }
  
  // Add commission instruction if requested and commission data is provided
  if (includeCommission && commissionData) {
    const commissionIx = createCommissionInstruction(
      commissionData.fromPubkey,
      commissionData.transactionLamports
    );
    allInstructions.push(commissionIx);
    onStatusUpdate?.(`Adding 0.5% commission (${calculateCommissionLamports(commissionData.transactionLamports) / LAMPORTS_PER_SOL} SOL)`);
  }
  
  try {
    // 2. Get wallet public key
    let walletPublicKey: PublicKey;
    
    if (wallet.publicKey) {
      walletPublicKey = new PublicKey(wallet.publicKey);
    } else if (wallet.address) {
      walletPublicKey = new PublicKey(wallet.address);
    } else {
      throw new Error('No wallet public key or address found');
    }
    
    // 3. Create transaction
    onStatusUpdate?.('Creating transaction...');
    
    // Get the latest blockhash with retry logic
    const getLatestBlockhash = async (retries = 3): Promise<{ blockhash: string; lastValidBlockHeight: number }> => {
      try {
        return await connection.getLatestBlockhash('confirmed');
      } catch (error: any) {
        if (retries > 0) {
          console.log(`Failed to get latest blockhash, retrying... (${retries} attempts left)`);
          // Wait a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
          return getLatestBlockhash(retries - 1);
        }
        throw new Error(`Failed to get latest blockhash after multiple attempts: ${error.message}`);
      }
    };
    
    const { blockhash, lastValidBlockHeight } = await getLatestBlockhash();
    console.log('[sendTransactionWithPriorityFee] Retrieved blockhash:', blockhash.substring(0, 10) + '...');
    
    // Use versioned transaction for better compatibility
    const messageV0 = new TransactionMessage({
      payerKey: walletPublicKey,
      recentBlockhash: blockhash,
      instructions: allInstructions,
    }).compileToV0Message();
    
    const transaction = new VersionedTransaction(messageV0);
    
    // 4. Sign and send transaction using TransactionService
    onStatusUpdate?.('Signing transaction...');
    
    // Create a wrapped status callback that filters error messages
    const statusCallback = onStatusUpdate 
      ? (status: string) => {
          if (!status.startsWith('Error:')) {
            onStatusUpdate(status);
          } else {
            onStatusUpdate('Processing transaction...');
          }
        }
      : undefined;
    
    // Sign and send the transaction
    console.log('[sendTransactionWithPriorityFee] Sending transaction...');
    const signature = await TransactionService.signAndSendTransaction(
      { type: 'transaction', transaction },
      wallet,
      { 
        connection,
        statusCallback
      }
    );
    
    console.log('[sendTransactionWithPriorityFee] Transaction sent with signature:', signature);
    
    // Function to verify transaction success through different methods
    // Returns: true (success), false (failure), null (inconclusive)
    const verifyTransactionSuccess = async (sig: string): Promise<boolean | null> => {
      try {
        console.log(`[sendTransactionWithPriorityFee] Checking transaction status: ${sig}`);
        
        // 1. Check signature status (fastest)
        try {
          const status = await connection.getSignatureStatus(sig, { searchTransactionHistory: true });
          if (status && status.value) {
            if (!status.value.err) {
              // Success if confirmed or finalized
              if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
                console.log(`[sendTransactionWithPriorityFee] Verified Success (status check: ${status.value.confirmationStatus})`);
                return true;
              }
              // Still processing, inconclusive for now
              console.log(`[sendTransactionWithPriorityFee] Status inconclusive: ${status.value.confirmationStatus}`);
              // Continue to next check
            } else {
              // Explicit error found
              console.error(`[sendTransactionWithPriorityFee] Verified Failure (status check error)`, status.value.err);
              return false;
            }
          } else {
            console.log(`[sendTransactionWithPriorityFee] Status check returned no value.`);
            // Continue to next check
          }
        } catch (e: any) {
          console.warn(`[sendTransactionWithPriorityFee] Status check threw error:`, e.message);
          // Continue to next check
        }

        // 2. Check getTransaction (more reliable)
        try {
          const txResponse = await connection.getTransaction(sig, {
            maxSupportedTransactionVersion: 0,
          });
          if (txResponse) {
            if (!txResponse.meta?.err) {
              console.log(`[sendTransactionWithPriorityFee] Verified Success (getTransaction)`);
              return true;
            }
            console.error(`[sendTransactionWithPriorityFee] Verified Failure (getTransaction error)`, txResponse.meta.err);
            return false;
          } else {
            console.log(`[sendTransactionWithPriorityFee] getTransaction returned no value yet.`);
            // Inconclusive, might appear later
          }
        } catch (e: any) {
          console.warn(`[sendTransactionWithPriorityFee] getTransaction threw error:`, e.message);
        }

        // 3. Final attempt: confirmTransaction (can sometimes succeed when others fail)
        try {
          const confirmation = await connection.confirmTransaction({
            signature: sig,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');
          if (!confirmation.value.err) {
            console.log(`[sendTransactionWithPriorityFee] Verified Success (confirmTransaction)`);
            return true;
          }
          console.error(`[sendTransactionWithPriorityFee] Verified Failure (confirmTransaction error)`, confirmation.value.err);
          return false;
        } catch (confirmError: any) {
          console.warn(`[sendTransactionWithPriorityFee] confirmTransaction threw error:`, confirmError.message);
        }

        // If all checks are inconclusive or failed
        console.log(`[sendTransactionWithPriorityFee] All verification methods inconclusive for ${sig}`);
        return null;
      } catch (error: any) {
        console.error(`[sendTransactionWithPriorityFee] Outer verification error:`, error.message);
        return null; // Treat errors in verification as inconclusive
      }
    };
    
    // Wait for transaction to be confirmed with timeout
    const waitForConfirmation = async (sig: string, maxAttempts = 6, interval = 1500): Promise<boolean | null> => {
      // First, immediately show transaction as sent (optimistic UI)
      onStatusUpdate?.(`Transaction sent: ${sig.slice(0, 8)}...`);
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        console.log(`[sendTransactionWithPriorityFee] Verification attempt ${attempt + 1}/${maxAttempts} for ${sig}`);
        
        // Show verifying status occasionally
        if (attempt > 0 && attempt % 2 === 0) {
          onStatusUpdate?.(`Verifying transaction...`);
        }

        const verificationResult = await verifyTransactionSuccess(sig);
        
        if (verificationResult === true) {
          console.log(`[sendTransactionWithPriorityFee] Transaction verified successfully`);
          onStatusUpdate?.(`Transaction confirmed successfully!`);
          return true;
        } else if (verificationResult === false) {
          console.error(`[sendTransactionWithPriorityFee] Transaction failed verification`);
          onStatusUpdate?.(`Transaction failed. Check explorer for details: ${sig.slice(0, 8)}...`);
          return false;
        }
        
        // If inconclusive (null), wait and retry
        if (attempt < maxAttempts - 1) {
          console.log(`[sendTransactionWithPriorityFee] Verification inconclusive, waiting ${interval}ms before next attempt`);
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
      
      console.warn(`[sendTransactionWithPriorityFee] Verification inconclusive after ${maxAttempts} attempts for ${sig}`);
      // Return null after all attempts are exhausted without a definitive result
      return null;
    };
    
    // Start transaction verification in background but don't wait for it
    waitForConfirmation(signature)
      .then(isSuccess => {
        // isSuccess can be true, false, or null
        if (isSuccess === true) {
          // Already handled in waitForConfirmation
          TransactionService.showSuccess(signature, 'transfer');
        } else if (isSuccess === false) {
          // Already handled in waitForConfirmation
          // Optionally: Show an error toast if not already shown
          // TransactionService.showError(new Error(`Transaction failed verification: ${signature}`));
          console.error(`[waitForConfirmation] Explicit failure for ${signature}`);
        } else {
          // Inconclusive (null) - Treat as likely success for better UX
          console.log(`[waitForConfirmation] Verification inconclusive for ${signature}, assuming success for UX.`);
          onStatusUpdate?.(`Transaction sent. Check explorer for status: ${signature.slice(0, 8)}...`);
          // Show success toast optimistically
          TransactionService.showSuccess(signature, 'transfer');
        }
      })
      .catch(error => {
        // This catch is for errors *within* the waitForConfirmation logic itself, not verification errors
        console.error('[sendTransactionWithPriorityFee] Error in waitForConfirmation promise:', error);
      });

    // Return the signature immediately for better UX
    return signature;
  } catch (error: any) {
    console.error('[sendTransactionWithPriorityFee] Error:', error);
    // Only show a generic error in the status update
    onStatusUpdate?.('Transaction failed');
    TransactionService.showError(error);
    throw error;
  }
}

/**
 * Sends SOL to a recipient with the current priority fee settings
 */
export async function sendSOL({
  wallet,
  recipientAddress,
  amountSol,
  connection,
  includeCommission = true,
  onStatusUpdate,
}: {
  wallet: StandardWallet | any;
  recipientAddress: string;
  amountSol: number;
  connection: Connection;
  includeCommission?: boolean;
  onStatusUpdate?: (status: string) => void;
}): Promise<string> {
  // Validate inputs
  if (!wallet) {
    throw new Error('No wallet provided');
  }
  
  if (!recipientAddress) {
    throw new Error('No recipient address provided');
  }
  
  if (!amountSol || amountSol <= 0) {
    throw new Error('Invalid SOL amount');
  }

  onStatusUpdate?.('Preparing SOL transfer...');
  
  try {
    // Create recipient PublicKey
    const recipient = new PublicKey(recipientAddress);
    
    // Convert SOL to lamports
    const totalLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    
    // Calculate commission if enabled
    const commissionLamports = includeCommission ? calculateCommissionLamports(totalLamports) : 0;
    const transferLamports = totalLamports - commissionLamports;
    
    if (includeCommission) {
      onStatusUpdate?.(`Sending ${amountSol * (1 - COMMISSION_PERCENTAGE/100)} SOL to ${recipientAddress.slice(0, 6)}... with 0.5% commission`);
    } else {
      onStatusUpdate?.(`Sending ${amountSol} SOL (${totalLamports} lamports) to ${recipientAddress.slice(0, 6)}...`);
    }
    
    // Create transfer instruction for main amount (minus commission)
    const fromPubkey = new PublicKey(wallet.address || wallet.publicKey);
    const transferInstruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey: recipient,
      lamports: transferLamports,
    });
    
    let signature: string;
    
    // Special handling for MWA wallet
    if (wallet.provider === 'mwa' || Platform.OS === 'android') {
      onStatusUpdate?.('Using Mobile Wallet Adapter...');
      try {
        signature = await sendPriorityTransactionMWA(
          connection,
          recipientAddress,
          totalLamports, // The MWA function now handles the commission internally
          DEFAULT_FEE_MAPPING,
          // Filter out error messages from status updates
          (status) => {
            if (!status.startsWith('Error:')) {
              onStatusUpdate?.(status);
            } else {
              onStatusUpdate?.('Processing transaction...');
            }
          }
        );
      } catch (error: any) {
        // Check if the error contains a transaction signature
        const signatureMatch = error.message?.match(/(\w{32,})/);
        if (signatureMatch && signatureMatch[0]) {
          // We have a signature, so the transaction was likely submitted
          signature = signatureMatch[0];
          console.log('[sendSOL] Extracted signature from error:', signature);
          onStatusUpdate?.(`Transaction sent. Check explorer for status: ${signature.slice(0, 8)}...`);
          // Show success to the user
          TransactionService.showSuccess(signature, 'transfer');
          return signature;
        }
        
        // Check if error might be just confirmation-related
        if (error.message && (
          error.message.includes('confirmation') || 
          error.message.includes('timeout') ||
          error.message.includes('blockhash') ||
          error.message.includes('retries')
        )) {
          console.log('[sendSOL] MWA confirmation issue, transaction might still succeed:', error);
          // Don't show an error, just inform the user
          if (error.signature) {
            onStatusUpdate?.(`Transaction sent. Check explorer for status: ${error.signature.slice(0, 8)}...`);
            TransactionService.showSuccess(error.signature, 'transfer');
            return error.signature;
          } else {
            onStatusUpdate?.('Transaction sent, check block explorer for status');
            return 'unknown';
          }
        }
        
        console.error('[sendSOL] MWA transaction failed:', error);
        TransactionService.showError(error);
        throw error;
      }
    } else {
      // For non-MWA wallets, use standard flow with priority fees
      try {
        signature = await sendTransactionWithPriorityFee({
          wallet,
          instructions: [transferInstruction],
          connection,
          includeCommission,
          commissionData: includeCommission ? {
            fromPubkey,
            transactionLamports: totalLamports
          } : undefined,
          // Filter out error messages from status updates
          onStatusUpdate: status => {
            if (!status.startsWith('Error:')) {
              onStatusUpdate?.(status);
            } else {
              onStatusUpdate?.('Processing transaction...');
            }
          },
        });
      } catch (error: any) {
        // Check if the error contains a transaction signature
        const signatureMatch = error.message?.match(/(\w{32,})/);
        if (signatureMatch && signatureMatch[0]) {
          // We have a signature, so the transaction was likely submitted
          signature = signatureMatch[0];
          console.log('[sendSOL] Extracted signature from error:', signature);
          onStatusUpdate?.(`Transaction sent. Check explorer for status: ${signature.slice(0, 8)}...`);
          // Show success to the user
          TransactionService.showSuccess(signature, 'transfer');
          return signature;
        }
        
        // Check if error might be just confirmation-related
        if (error.message && (
          error.message.includes('confirmation') || 
          error.message.includes('timeout') ||
          error.message.includes('blockhash') ||
          error.message.includes('retries')
        )) {
          console.log('[sendSOL] Confirmation issue, transaction might still succeed:', error);
          // Instead of throwing, return a signature if we have one
          if (error.signature) {
            onStatusUpdate?.(`Transaction sent. Check explorer for status: ${error.signature.slice(0, 8)}...`);
            TransactionService.showSuccess(error.signature, 'transfer');
            return error.signature;
          }
        }
        
        console.error('[sendSOL] Error:', error);
        // Don't send raw error through the status update
        onStatusUpdate?.('Transaction failed');
        TransactionService.showError(error);
        throw error;
      }
    }
    
    // If we reach here, we have a signature
    console.log('[sendSOL] Transaction successful with signature:', signature);
    onStatusUpdate?.(`Transaction sent: ${signature.slice(0, 8)}...`);
    TransactionService.showSuccess(signature, 'transfer');
    return signature;
  } catch (error: any) {
    console.error('[sendSOL] Unhandled error:', error);
    // Don't send raw error through the status update
    onStatusUpdate?.('Transaction failed');
    TransactionService.showError(error);
    throw error;
  }
}

/**
 * Signs and sends an in-memory transaction (legacy or versioned) via the
 * Privy provider's `signAndSendTransaction` method. Returns the tx signature.
 */
export async function signAndSendWithPrivy(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  provider: any,
): Promise<string> {
  // The provider expects the raw transaction object, not base64.
  // This will produce an object that can be directly pass to signAndSendTransaction.
  const {signature} = await provider.request({
    method: 'signAndSendTransaction',
    params: {
      transaction,
      connection,
    },
  });

  if (!signature) {
    throw new Error('No signature returned from provider');
  }
  return signature;
}

/**
 * Takes a base64-encoded transaction (could be legacy or versioned),
 * deserializes it, and then uses Privy provider to sign+send.
 */
export async function signAndSendBase64Tx(
  base64Tx: string,
  connection: Connection,
  provider: any,
): Promise<string> {
  const txBuffer = Buffer.from(base64Tx, 'base64');
  let transaction: Transaction | VersionedTransaction;

  // Try to parse as VersionedTransaction; fallback to legacy Transaction.
  try {
    transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
  } catch {
    transaction = Transaction.from(new Uint8Array(txBuffer));
  }

  const {signature} = await provider.request({
    method: 'signAndSendTransaction',
    params: {
      transaction,
      connection,
    },
  });

  if (!signature) {
    throw new Error('No signature returned while signing base64 tx');
  }
  return signature;
}
