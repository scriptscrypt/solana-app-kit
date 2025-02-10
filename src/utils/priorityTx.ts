// File: src/utils/priorityTx.ts

import {
    Connection,
    PublicKey,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage,
    Keypair,
    ComputeBudgetProgram,
  } from '@solana/web3.js';
  
  type FeeTier = 'low' | 'medium' | 'high' | 'very-high';
  
  const feeTierMap: Record<FeeTier, number> = {
    low: 0.2,
    medium: 0.5,
    high: 0.8,
    'very-high': 0.95,
  };
  
  export async function sendTxWithPriorityFee(
    connection: Connection,
    signTransaction: (
      tx: VersionedTransaction
    ) => Promise<VersionedTransaction>,
    payerPublicKey: PublicKey,
    instructions: TransactionInstruction[],
    feeTier: FeeTier,
    extraSigners?: Keypair[],
  ): Promise<string> {
    console.log('[priorityTx] Preparing to send transaction with priority fee...');
    try {
      console.log('[priorityTx] Fetching latest blockhash...');
      const { blockhash } = await connection.getLatestBlockhash();
  
      console.log('[priorityTx] Creating temp transaction for simulation...');
      const tempMessage = new TransactionMessage({
        payerKey: payerPublicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();
  
      const tempTx = new VersionedTransaction(tempMessage);
  
      console.log('[priorityTx] Simulating transaction to estimate compute units...');
      const simulationResult = await connection.simulateTransaction(tempTx);
      console.log('[priorityTx] Simulation result:', simulationResult);
  
      const estimatedComputeUnits = simulationResult.value.unitsConsumed || 200000;
      console.log('[priorityTx] Estimated compute units:', estimatedComputeUnits);
  
      const safeComputeUnits = Math.ceil(
        Math.max(estimatedComputeUnits + 100000, estimatedComputeUnits * 1.2),
      );
      console.log('[priorityTx] Safe compute units limit:', safeComputeUnits);
  
      const computeBudgetLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: safeComputeUnits,
      });
  
      const baseMicroLamports = 1000;
      const feeMultiplier = feeTierMap[feeTier] || 0.5;
      const computedMicroLamports = Math.floor(
        baseMicroLamports * (1 + feeMultiplier * 10),
      );
      console.log('[priorityTx] Faking priority fee. microLamports =', computedMicroLamports);
  
      const computeBudgetPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: computedMicroLamports,
      });
  
      const finalInstructions = [
        computeBudgetLimitIx,
        computeBudgetPriceIx,
        ...instructions,
      ];
  
      console.log('[priorityTx] Building final transaction with instructions...');
      const latestBlockhashObj = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: payerPublicKey,
        recentBlockhash: latestBlockhashObj.blockhash,
        instructions: finalInstructions,
      }).compileToV0Message();
  
      const finalTx = new VersionedTransaction(messageV0);
  
      if (extraSigners && extraSigners.length > 0) {
        console.log('[priorityTx] Signing with extraSigners:', extraSigners.length);
        finalTx.sign([...extraSigners]);
      }
  
      console.log('[priorityTx] Requesting signature from wallet...');
      const signedTx = await signTransaction(finalTx);
  
      console.log('[priorityTx] Sending transaction...');
      const signature = await connection.sendTransaction(signedTx, {
        maxRetries: 3,
        skipPreflight: false,
      });
      console.log('[priorityTx] Transaction sent with signature:', signature);
  
      console.log('[priorityTx] Confirming transaction...');
      const confirmationResult = await connection.confirmTransaction(signature, 'confirmed');
      console.log('[priorityTx] Transaction confirmation result:', confirmationResult);
  
      return signature;
    } catch (error) {
      console.error('[priorityTx] Error sending transaction with priority fee:', error);
      throw error;
    }
  }
  