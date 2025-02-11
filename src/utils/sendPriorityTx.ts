// src/utils/sendPriorityTx.ts
import {
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
  PublicKey,
  Connection,
} from '@solana/web3.js';
import {Buffer} from 'buffer';

export async function sendPriorityTransaction(
  provider: any,
  feeTier: 'low' | 'medium' | 'high' | 'very-high',
  instructions: TransactionInstruction[],
  connection: Connection,
  walletPublicKey: PublicKey,
): Promise<string> {
  // Map fee tiers to microLamports (example values)
  const feeMapping: Record<string, number> = {
    low: 100000,
    medium: 5000000,
    high: 100000000,
    'very-high': 2000000000,
  };
  const microLamports = feeMapping[feeTier];

  // Check the wallet balance; if less than 1 SOL, request an airdrop (for devnet)
  let balance = await connection.getBalance(walletPublicKey);
  if (balance < 1e9) {
    console.log(
      'Wallet balance is insufficient; requesting airdrop of 1 SOL for testing...',
    );
    const airdropSignature = await connection.requestAirdrop(
      walletPublicKey,
      1e9, // 1 SOL = 1e9 lamports
    );
    await connection.confirmTransaction(airdropSignature);

    // Poll until the wallet has at least 1 SOL
    balance = await connection.getBalance(walletPublicKey);
    while (balance < 1e9) {
      console.log(
        `Waiting for balance update... current balance: ${balance} lamports`,
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      balance = await connection.getBalance(walletPublicKey);
    }
    console.log(`Balance updated: ${balance} lamports`);
  }

  // Set compute unit limit and price instructions
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

  const {blockhash} = await connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: walletPublicKey,
    recentBlockhash: blockhash,
    instructions: allInstructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  // Serialize the transaction message and encode it as base64
  const serializedMessage = transaction.message.serialize();
  const base64Message = Buffer.from(serializedMessage).toString('base64');

  // Request signature from the wallet’s provider (EIP-1193 style)
  const {signature} = await provider.request({
    method: 'signMessage',
    params: {message: base64Message},
  });

  transaction.addSignature(walletPublicKey, Buffer.from(signature, 'base64'));

  try {
    VersionedTransaction.deserialize(transaction.serialize());
  } catch (error) {
    throw new Error('Invalid signature.');
  }

  const serializedTx = transaction.serialize();
  const txHash = await connection.sendRawTransaction(serializedTx);
  await connection.confirmTransaction(txHash);

  // Log the transaction URL for Solscan Devnet
  console.log(
    `Transaction sent. Check on Solscan Devnet: https://solscan.io/tx/${txHash}?cluster=devnet`,
  );

  return txHash;
}
