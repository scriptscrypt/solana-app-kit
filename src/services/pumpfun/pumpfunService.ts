// File: src/services/pumpfun/pumpfunService.ts

import {Connection, Keypair, PublicKey} from '@solana/web3.js';
import {PumpFunSDK, DEFAULT_DECIMALS} from 'pumpdotfun-sdk';
import {AnchorProvider} from '@coral-xyz/anchor';
import {HELIUS_RPC_URL} from '@env';

import {Buffer} from 'buffer';

// structuredClone polyfill (if needed)
if (typeof globalThis.structuredClone !== 'function') {
  console.log(
    '[pumpfunService] structuredClone not found. Applying polyfill...',
  );
  (globalThis as any).structuredClone = (val: any) =>
    JSON.parse(JSON.stringify(val));
}

// Ensure Buffer is available globally for React Native (if not already).
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

/**
 * A basic utility to create an AnchorProvider for Pumpfun usage.
 */
function getProvider(): AnchorProvider {
  if (!HELIUS_RPC_URL) {
    console.error(
      '[pumpfunService.getProvider] Missing HELIUS_RPC_URL environment variable.',
    );
    throw new Error('Please set HELIUS_RPC_URL in your .env file');
  }
  console.log(
    '[pumpfunService.getProvider] Creating AnchorProvider with endpoint:',
    HELIUS_RPC_URL,
  );
  const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
  const wallet = Keypair.generate();
  return new AnchorProvider(connection, {publicKey: wallet.publicKey} as any, {
    commitment: 'confirmed',
  });
}

/**
 * Helper: Convert remote image URL into a Blob (if your RN environment supports Blob).
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  console.log(
    '[pumpfunService.fetchImageAsBlob] Fetching image from URL:',
    url,
  );
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  console.log(
    '[pumpfunService.fetchImageAsBlob] Successfully fetched. Creating Blob.',
  );
  return new Blob([arrayBuffer], {type: 'image/png'});
}

/**
 * Launch (create) a new token on Pumpfun via `createAndBuy()`.
 */
export async function launchTokenViaPumpfun(
  privateKey: string,
  tokenName: string,
  tokenTicker: string,
  description: string,
  imageUrl: string,
  options?: {
    twitter?: string;
    telegram?: string;
    website?: string;
  },
): Promise<{signature: string; mintPK: string}> {
  console.log(
    '[pumpfunService.launchTokenViaPumpfun] Starting token launch with arguments:',
    {
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      options,
      // Private key intentionally omitted
    },
  );
  try {
    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);
    console.log(
      '[pumpfunService.launchTokenViaPumpfun] PumpFunSDK initialized.',
    );

    const secretKey = decodePrivateKeyBase58(privateKey);
    console.log(
      '[pumpfunService.launchTokenViaPumpfun] Decoded creator privateKey (masked in logs).',
    );
    const payerKeypair = Keypair.fromSecretKey(secretKey);

    const mintKeypair = Keypair.generate();
    console.log(
      '[pumpfunService.launchTokenViaPumpfun] Generated new mint Keypair:',
      mintKeypair.publicKey.toBase58(),
    );

    console.log(
      '[pumpfunService.launchTokenViaPumpfun] Converting imageUrl to Blob...',
    );
    const fileBlob = await fetchImageAsBlob(imageUrl);

    const createTokenMetadata = {
      name: tokenName,
      symbol: tokenTicker,
      description,
      file: fileBlob,
      twitter: options?.twitter ?? '',
      telegram: options?.telegram ?? '',
      website: options?.website ?? '',
    };

    const buyAmountSol = BigInt(0);
    console.log(
      '[pumpfunService.launchTokenViaPumpfun] Invoking createAndBuy on PumpFunSDK...',
    );
    const response = await sdk.createAndBuy(
      payerKeypair,
      mintKeypair,
      createTokenMetadata,
      buyAmountSol,
      500n,
    );
    console.log(
      '[pumpfunService.launchTokenViaPumpfun] createAndBuy response:',
      response,
    );

    if (!response.success) {
      const errorMsg =
        typeof response.error === 'string'
          ? response.error
          : 'Failed to launch token on Pumpfun (error unknown).';
      console.error(
        '[pumpfunService.launchTokenViaPumpfun] createAndBuy was not successful:',
        errorMsg,
      );
      throw new Error(errorMsg);
    }

    const signature = response.signature ?? '';
    const mintPK = mintKeypair.publicKey.toBase58();

    console.log(
      '[pumpfunService.launchTokenViaPumpfun] Successfully launched token =>',
      {signature, mintPK},
    );
    return {signature, mintPK};
  } catch (error) {
    console.error(
      '[pumpfunService.launchTokenViaPumpfun] Caught error launching token:',
      parseHeliusError(error),
    );
    throw parseHeliusError(error);
  }
}

/**
 * Buy a token with SOL
 */
export async function buyTokenViaPumpfun(
  buyerPublicKey: string,
  tokenAddress: string,
  solAmount: number,
): Promise<string> {
  console.log('[pumpfunService.buyTokenViaPumpfun] Called with:', {
    buyerPublicKey,
    tokenAddress,
    solAmount,
  });

  try {
    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);

    const mintPubKey = new PublicKey(tokenAddress);
    const buyAmountLamports = BigInt(Math.floor(solAmount * 1_000_000_000)); // 1 SOL = 1e9 lamports

    console.log(
      '[pumpfunService.buyTokenViaPumpfun] Creating ephemeral Keypair for demonstration...',
    );
    const ephemeralKeypair = Keypair.generate();

    console.log('[pumpfunService.buyTokenViaPumpfun] Invoking sdk.buy...');
    const buyResp = await sdk.buy(
      ephemeralKeypair,
      mintPubKey,
      buyAmountLamports,
      500n, // slippage
    );
    console.log('[pumpfunService.buyTokenViaPumpfun] buy() response:', buyResp);

    if (!buyResp.success) {
      const errorMsg =
        typeof buyResp.error === 'string'
          ? buyResp.error
          : 'Failed to buy token on Pumpfun (error unknown).';
      console.error(
        '[pumpfunService.buyTokenViaPumpfun] buy() not successful:',
        errorMsg,
      );
      throw new Error(errorMsg);
    }

    const txSig = buyResp.signature ?? '';
    console.log(
      '[pumpfunService.buyTokenViaPumpfun] Success! Transaction signature:',
      txSig,
    );
    return txSig;
  } catch (error) {
    console.error(
      '[pumpfunService.buyTokenViaPumpfun] Caught error:',
      parseHeliusError(error),
    );
    throw parseHeliusError(error);
  }
}

/**
 * Sell a certain number of tokens
 */
export async function sellTokenViaPumpfun(
  sellerPublicKey: string,
  tokenAddress: string,
  tokenAmount: number,
): Promise<string> {
  console.log('[pumpfunService.sellTokenViaPumpfun] Called with:', {
    sellerPublicKey,
    tokenAddress,
    tokenAmount,
  });

  try {
    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);

    const mintPubKey = new PublicKey(tokenAddress);

    // Convert the token amount into base units.
    const tokenAmountInBaseUnits = BigInt(
      Math.floor(tokenAmount * 10 ** DEFAULT_DECIMALS),
    );
    console.log(
      '[pumpfunService.sellTokenViaPumpfun] Calculated token base units:',
      tokenAmountInBaseUnits.toString(),
    );

    // DEMO ONLY: ephemeral Keypair
    const ephemeralKeypair = Keypair.generate();
    console.log('[pumpfunService.sellTokenViaPumpfun] Invoking sdk.sell...');
    const sellResp = await sdk.sell(
      ephemeralKeypair,
      mintPubKey,
      tokenAmountInBaseUnits,
      500n,
    );
    console.log(
      '[pumpfunService.sellTokenViaPumpfun] sell() response:',
      sellResp,
    );

    if (!sellResp.success) {
      const errorMsg =
        typeof sellResp.error === 'string'
          ? sellResp.error
          : 'Failed to sell token on Pumpfun (error unknown).';
      console.error(
        '[pumpfunService.sellTokenViaPumpfun] sell() not successful:',
        errorMsg,
      );
      throw new Error(errorMsg);
    }

    const txSig = sellResp.signature ?? '';
    console.log(
      '[pumpfunService.sellTokenViaPumpfun] Success! Transaction signature:',
      txSig,
    );
    return txSig;
  } catch (error) {
    console.error(
      '[pumpfunService.sellTokenViaPumpfun] Caught error:',
      parseHeliusError(error),
    );
    throw parseHeliusError(error);
  }
}

/**
 * Helper to decode a base58-encoded secret key.
 */
function decodePrivateKeyBase58(base58Key: string): Uint8Array {
  console.log(
    '[pumpfunService.decodePrivateKeyBase58] Decoding base58 private key (not printing full).',
  );
  const bs58 = require('bs58');
  return new Uint8Array(bs58.decode(base58Key));
}

/**
 * A small helper to transform the raw Helius/Cloudflare error (e.g., HTTP 522 with HTML body)
 * into a simpler error message if possible.
 */
function parseHeliusError(error: unknown): Error {
  if (!(error instanceof Error)) {
    // If it's not a real Error, coerce it to one
    return new Error(String(error));
  }

  // Check if it contains 522 or "Connection timed out"
  const msg = error.message || '';
  if (msg.includes('522') || msg.includes('Connection timed out')) {
    const newMsg =
      'RPC Endpoint unreachable or timed out (Cloudflare 522). Please try again later.';
    return new Error(`${newMsg}\nOriginal: ${msg}`);
  }

  return error; // default to the original
}
