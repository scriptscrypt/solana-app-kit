// File: src/services/pumpfun/solanaSignUtils.ts

import {PublicKey, Transaction, VersionedTransaction} from '@solana/web3.js';
import {Buffer} from 'buffer';

/**
 * Sign a legacy Transaction using Privy's signMessage
 */
export async function signLegacyTransactionWithPrivy(
  transaction: Transaction,
  signerPubkey: PublicKey,
  privyProvider: any,
): Promise<Transaction> {
  console.log('[signLegacyTransactionWithPrivy] Start signing (legacy).');

  // Serialize the transaction's message
  const serializedMessage = transaction.serializeMessage();
  const base64Msg = Buffer.from(serializedMessage).toString('base64');

  // Request signature from Privy
  const signResult = await privyProvider.request({
    method: 'signMessage',
    params: {message: base64Msg},
  });
  if (!signResult || typeof signResult !== 'object' || !signResult.signature) {
    throw new Error(
      '[signLegacyTransactionWithPrivy] Invalid signature from provider.',
    );
  }

  // Attach signature
  const signatureBuffer = Buffer.from(signResult.signature, 'base64');
  transaction.addSignature(signerPubkey, signatureBuffer);

  // Verify
  if (!transaction.verifySignatures()) {
    throw new Error(
      '[signLegacyTransactionWithPrivy] Signature verification failed.',
    );
  }
  console.log('[signLegacyTransactionWithPrivy] Verified OK.');
  return transaction;
}

/**
 * Sign a VersionedTransaction using Privy's signMessage
 */
export async function signVersionedTransactionWithPrivy(
  versionedTx: VersionedTransaction,
  signerPubkey: PublicKey,
  privyProvider: any,
): Promise<VersionedTransaction> {
  console.log('[signVersionedTransactionWithPrivy] Start signing (versioned).');

  // Serialize the versioned transaction's message
  const serializedMsg = versionedTx.message.serialize();
  const base64Msg = Buffer.from(serializedMsg).toString('base64');

  const signResult = await privyProvider.request({
    method: 'signMessage',
    params: {message: base64Msg},
  });
  if (!signResult || typeof signResult !== 'object' || !signResult.signature) {
    throw new Error(
      '[signVersionedTransactionWithPrivy] Invalid signature from provider.',
    );
  }
  const signatureBuffer = Buffer.from(signResult.signature, 'base64');
  versionedTx.addSignature(signerPubkey, signatureBuffer);

  // Validate
  const reserialized = versionedTx.serialize();
  const reCheck = VersionedTransaction.deserialize(reserialized);
  if (!reCheck) {
    throw new Error(
      '[signVersionedTransactionWithPrivy] Re-deserialization failed.',
    );
  }

  console.log(
    '[signVersionedTransactionWithPrivy] Versioned transaction signed OK.',
  );
  return versionedTx;
}
