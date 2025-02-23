// File: src/services/pumpfun/raydiumService.ts

import {PublicKey, VersionedTransaction} from '@solana/web3.js';
import {Buffer} from 'buffer';

/**
 * RAYDIUM ENDPOINTS & CONSTANTS
 */
const RAYDIUM_SWAP_API_BASE = 'https://transaction-v1.raydium.io';
const RAYDIUM_API_V3 = 'https://api-v3.raydium.io';

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const RAYDIUM_SOL_MINT = 'So11111111111111111111111111111111111111112'; // "Native" SOL identity used by Raydium

/**
 * Check if a token mint is recognized by Raydium
 */
export async function checkIfTokenIsOnRaydium(
  mintAddress: string,
): Promise<boolean> {
  console.log('[Raydium] Checking for mint:', mintAddress);

  const raydiumApiUrl = `${RAYDIUM_API_V3}/mint/ids?mints=${mintAddress}`;
  console.log('[Raydium] GET:', raydiumApiUrl);

  const response = await fetch(raydiumApiUrl);
  console.log(
    '[Raydium] checkIfTokenIsOnRaydium() -> status:',
    response.status,
  );

  if (!response.ok) {
    console.warn('[Raydium] Non-200 response checking token:', response.status);
    return false;
  }

  const data = await response.json();
  if (data?.success && Array.isArray(data.data) && data.data[0] !== null) {
    console.log('[Raydium] Token is supported:', mintAddress);
    return true;
  }
  return false;
}

/**
 * Attempt to fetch Raydium's "auto-fee" for compute unit price
 */
export async function getSwapFee(): Promise<string> {
  console.log('[Raydium] getSwapFee() called.');
  const url = `${RAYDIUM_API_V3}/main/auto-fee`;

  const response = await fetch(url);
  if (!response.ok) {
    console.warn('[Raydium] getSwapFee() failed:', response.statusText);
    return '5000';
  }

  const data = await response.json();
  if (data?.success && data?.data?.default?.h) {
    return data.data.default.h.toString();
  }
  return '5000';
}

/**
 * Generic fetch for Raydium swap quote
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amountInLamports: number,
  slippageBps = 200,
  txVersion = 'V0',
): Promise<any> {
  const url = `${RAYDIUM_SWAP_API_BASE}/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInLamports}&slippageBps=${slippageBps}&txVersion=${txVersion}`;
  console.log('[Raydium] getSwapQuote ->', url);

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[Raydium] getSwapQuote() failed: ${body}`);
  }

  return response.json();
}

/**
 * Build final Raydium swap transaction from a quote
 * Typically returns a V1 "versioned" transaction in base64
 */
export async function getSwapTransaction({
  swapResponse,
  computeUnitPriceMicroLamports,
  userPubkey,
  unwrapSol,
  wrapSol,
  txVersion = 'V0',
  inputAccount,
}: {
  swapResponse: any;
  computeUnitPriceMicroLamports: string;
  userPubkey: string;
  unwrapSol: boolean;
  wrapSol: boolean;
  txVersion?: string;
  inputAccount?: string; // e.g. user's token ATA if needed
}): Promise<any> {
  const body: any = {
    computeUnitPriceMicroLamports,
    swapResponse,
    txVersion,
    wallet: userPubkey,
    unwrapSol,
    wrapSol,
  };

  // If we have an inputAccount, attach it
  if (inputAccount) {
    body.inputAccount = inputAccount;
  }

  const url = `${RAYDIUM_SWAP_API_BASE}/transaction/swap-base-in`;
  console.log('[Raydium] getSwapTransaction POST ->', url, body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`[Raydium] getSwapTransaction() failed: ${msg}`);
  }

  return response.json();
}

/**
 * Parse a versioned transaction from base64
 */
export function parseRaydiumVersionedTransaction(
  base64Tx: string,
): VersionedTransaction {
  console.log('[Raydium] parseRaydiumVersionedTransaction()');
  const rawTx = Buffer.from(base64Tx, 'base64');
  const versionedTx = VersionedTransaction.deserialize(rawTx);
  console.log('[Raydium] parseRaydiumVersionedTransaction -> success');
  return versionedTx;
}
