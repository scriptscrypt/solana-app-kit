import {
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
  PublicKey,
  Connection,
  clusterApiUrl,
} from '@solana/web3.js';
import {Buffer} from 'buffer';

const lamportsToSol = (lamports: number): number => {
  return lamports / 1e9;
};

export async function sendPriorityTransaction(
  provider: any,
  feeTier: 'low' | 'medium' | 'high' | 'very-high',
  instructions: TransactionInstruction[],
  connection: Connection,
  walletPublicKey: PublicKey,
  feeMapping: Record<string, number>,
): Promise<string> {
  if (!feeMapping) {
    throw new Error(
      'Fee mapping is required. Please provide a fee mapping from configuration.',
    );
  }
  const microLamports = feeMapping[feeTier];

  // Check if we're on testnet or devnet
  const endpoint = connection.rpcEndpoint;
  const isTestNetwork =
    endpoint.includes('testnet') || endpoint.includes('devnet');

  let balance = await connection.getBalance(walletPublicKey);
  console.log(`Initial balance: ${lamportsToSol(balance)} SOL`);
  if (balance < 0.001 * 1e9) {
    if (isTestNetwork) {
      console.log('On test network, requesting airdrop...');
      const airdropSignature = await connection.requestAirdrop(
        walletPublicKey,
        1e9,
      );
      // Wait for airdrop confirmation using the new confirmation strategy
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: airdropSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      balance = await connection.getBalance(walletPublicKey);
      while (balance < 1e9) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        balance = await connection.getBalance(walletPublicKey);
      }
      console.log(`Balance updated: ${balance} lamports`);
    } else {
      throw new Error('Insufficient balance for transaction');
    }
  }

  const computeUnitLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: 2000000,
  });
  const computeUnitPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports,
  });

  const allInstructions = [
    computeUnitLimitInstruction,
    computeUnitPriceInstruction,
    ...instructions,
  ];

  // Get the latest blockhash (includes lastValidBlockHeight)
  const latestBlockhash = await connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: walletPublicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: allInstructions,
  }).compileToV0Message();
  console.log('Message compiled.');
  const transaction = new VersionedTransaction(messageV0);

  const serializedMessage = transaction.message.serialize();
  const base64Message = Buffer.from(serializedMessage).toString('base64');

  const {signature} = await provider.request({
    method: 'signMessage',
    params: {message: base64Message},
  });
  console.log('Signature obtained.');
  transaction.addSignature(walletPublicKey, Buffer.from(signature, 'base64'));

  try {
    VersionedTransaction.deserialize(transaction.serialize());
  } catch (error) {
    console.log('Transaction Validation Error Details:', {
      error: (error as any).message,
      fullError: error,
      transactionDetails: {
        numInstructions: allInstructions.length,
        signerPublicKey: walletPublicKey.toString(),
        hasSignature: transaction.signatures.length > 0,
      },
    });
    throw new Error(`Transaction validation failed: ${(error as any).message}`);
  }
  console.log('Transaction validated.');
  const serializedTx = transaction.serialize();
  console.log('Transaction serialized.');
  try {
    const txHash = await connection.sendRawTransaction(serializedTx);
    console.log(`Transaction sent. Hash: ${txHash}`);

    // Poll for confirmation status for up to 30 seconds.
    let confirmed = false;
    const maxRetries = 30;
    for (let i = 0; i < maxRetries; i++) {
      const statusResponse = await connection.getSignatureStatuses([txHash]);
      const status = statusResponse.value[0];
      if (
        status &&
        (status.confirmationStatus === 'confirmed' ||
          status.confirmationStatus === 'finalized')
      ) {
        confirmed = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!confirmed) {
      throw new Error('Transaction was not confirmed in time');
    }

    const solscanBase = isTestNetwork ? '?cluster=devnet' : '';
    console.log(
      `Transaction confirmed. Check on Solscan: https://solscan.io/tx/${txHash}${solscanBase}`,
    );
    return txHash;
  } catch (error) {
    console.error('Error sending raw transaction:', {
      error: (error as any).message,
      fullError: error,
      transactionDetails: {
        serializedTx: serializedTx.toString(),
        signerPublicKey: walletPublicKey.toString(),
        numInstructions: allInstructions.length,
      },
    });
    throw new Error(`Failed to send transaction: ${(error as any).message}`);
  }
}
