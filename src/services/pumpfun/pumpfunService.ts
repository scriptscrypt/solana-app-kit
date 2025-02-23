import {
  PublicKey,
  Connection,
  VersionedTransaction,
  Transaction,
} from '@solana/web3.js';
import {PumpFunSDK} from 'pumpdotfun-sdk';
import {getAssociatedTokenAddress} from '@solana/spl-token';
import {HELIUS_API_KEY} from '@env';

import {
  checkIfTokenIsOnRaydium,
  getSwapFee,
  getSwapQuote,
  getSwapTransaction,
  parseRaydiumVersionedTransaction,
  LAMPORTS_PER_SOL,
  RAYDIUM_SOL_MINT,
} from './raydiumService';

import {
  buildPumpFunBuyTransaction,
  buildPumpFunSellTransaction,
} from './pumpfunBonding';

import {
  signLegacyTransactionWithPrivy,
  signVersionedTransactionWithPrivy,
} from './solanaSignUtils';

// --- NEW: we import uploadPinataMetadata instead of the old “uploadPumpfunMetadata”
import {
  getProvider,
} from '../../utils/pumpfun/pumpfunUtils';

/* =========================================================================
   1) BUY UTILITY
   ========================================================================= */
export async function buyTokenViaPumpfun({
  buyerPublicKey,
  tokenAddress,
  solAmount,
  solanaWallet,
}: {
  buyerPublicKey: string;
  tokenAddress: string;
  solAmount: number;
  solanaWallet: any;
}) {
  console.log('[buyTokenViaPumpfun] Called with:', {
    buyerPublicKey,
    tokenAddress,
    solAmount,
  });

  if (!solanaWallet) {
    throw new Error(
      '[buyTokenViaPumpfun] No Solana wallet found. Please connect your wallet first.',
    );
  }

  try {
    const provider = getProvider();
    const connection = provider.connection;
    const buyerPubkey = new PublicKey(buyerPublicKey);

    // 1) Check Raydium
    console.log('[buyTokenViaPumpfun] Checking if token is on Raydium...');
    const isRaydium = await checkIfTokenIsOnRaydium(tokenAddress);
    let txId: string = '';

    if (isRaydium) {
      // ========== Raydium path => versioned transaction (SOL -> token) ==========
      console.log('[buyTokenViaPumpfun] Using Raydium path...');
      const lamportsIn = Math.floor(solAmount * LAMPORTS_PER_SOL);
      const swapResponse = await getSwapQuote(
        RAYDIUM_SOL_MINT,
        tokenAddress,
        lamportsIn,
      );
      const computeUnitPrice = await getSwapFee();
      const raydiumResult = await getSwapTransaction({
        swapResponse,
        computeUnitPriceMicroLamports: computeUnitPrice,
        userPubkey: buyerPublicKey,
        unwrapSol: false,
        wrapSol: true,
      });

      const base64Tx = raydiumResult.data?.[0]?.transaction;
      if (!base64Tx) {
        throw new Error('[Raydium] No transaction found in swap response');
      }
      const versionedTx = parseRaydiumVersionedTransaction(base64Tx);

      const privyProvider = await solanaWallet.getProvider();
      const signedVersionedTx = await signVersionedTransactionWithPrivy(
        versionedTx,
        buyerPubkey,
        privyProvider,
      );

      txId = await connection.sendRawTransaction(signedVersionedTx.serialize());
      console.log('[buyTokenViaPumpfun] => success, Raydium txId:', txId);
    } else {
      // ========== PumpFun bonding curve => legacy transaction ==========
      console.log('[buyTokenViaPumpfun] Using PumpFun path...');
      const sdk = new PumpFunSDK(provider);
      const tokenMint = new PublicKey(tokenAddress);
      const lamportsToBuy = BigInt(Math.floor(solAmount * LAMPORTS_PER_SOL));

      const transaction = await buildPumpFunBuyTransaction({
        payerPubkey: buyerPubkey,
        tokenMint,
        lamportsToBuy,
        sdk,
        connection,
      });

      const privyProvider = await solanaWallet.getProvider();
      const signedTx = await signLegacyTransactionWithPrivy(
        transaction,
        buyerPubkey,
        privyProvider,
      );

      txId = await connection.sendRawTransaction(signedTx.serialize());
      console.log('[buyTokenViaPumpfun] => success, Pumpfun txId:', txId);
    }

    return {txId, success: true};
  } catch (error: any) {
    console.error('[buyTokenViaPumpfun] Error:', error?.message || error);
    throw error;
  }
}

/* =========================================================================
   3) SELL UTILITY
   ========================================================================= */
export async function sellTokenViaPumpfun({
  sellerPublicKey,
  tokenAddress,
  tokenAmount,
  solanaWallet,
}: {
  sellerPublicKey: string;
  tokenAddress: string;
  tokenAmount: number;
  solanaWallet: any;
}) {
  console.log('[sellTokenViaPumpfun] Called with:', {
    sellerPublicKey,
    tokenAddress,
    tokenAmount,
  });

  if (!solanaWallet) {
    throw new Error(
      '[sellTokenViaPumpfun] No Solana wallet found. Please connect your wallet first.',
    );
  }

  try {
    const provider = getProvider();
    const connection = provider.connection;
    const sellerPubkey = new PublicKey(sellerPublicKey);

    // 1) Check Raydium
    console.log('[sellTokenViaPumpfun] Checking if token is on Raydium...');
    const isRaydium = await checkIfTokenIsOnRaydium(tokenAddress);
    let txId: string = '';

    if (isRaydium) {
      // ========== Raydium path => versioned transaction (token -> SOL) ==========
      console.log('[sellTokenViaPumpfun] Using Raydium path...');
      const supplyResult = await connection.getTokenSupply(
        new PublicKey(tokenAddress),
      );
      const decimals = supplyResult.value.decimals;

      const lamportsIn = Math.floor(tokenAmount * 10 ** decimals);
      console.log('[sellTokenViaPumpfun] lamportsIn =>', lamportsIn);

      const userTokenATA = await getAssociatedTokenAddress(
        new PublicKey(tokenAddress),
        sellerPubkey,
      );
      console.log(
        '[sellTokenViaPumpfun] userTokenATA =>',
        userTokenATA.toBase58(),
      );

      const swapResponse = await getSwapQuote(
        tokenAddress,
        RAYDIUM_SOL_MINT,
        lamportsIn,
      );
      const computeUnitPrice = await getSwapFee();
      const raydiumResult = await getSwapTransaction({
        swapResponse,
        computeUnitPriceMicroLamports: computeUnitPrice,
        userPubkey: sellerPublicKey,
        unwrapSol: true,
        wrapSol: false,
        inputAccount: userTokenATA.toBase58(),
      });

      const base64Tx = raydiumResult.data?.[0]?.transaction;
      if (!base64Tx) {
        throw new Error('[Raydium] No transaction found in swap response');
      }
      const versionedTx = parseRaydiumVersionedTransaction(base64Tx);

      const privyProvider = await solanaWallet.getProvider();
      const signedVersionedTx = await signVersionedTransactionWithPrivy(
        versionedTx,
        sellerPubkey,
        privyProvider,
      );

      txId = await connection.sendRawTransaction(signedVersionedTx.serialize());
      console.log('[sellTokenViaPumpfun] => success, Raydium txId:', txId);
    } else {
      // ========== PumpFun bonding curve => legacy transaction ==========
      console.log('[sellTokenViaPumpfun] Using PumpFun path...');
      const sdk = new PumpFunSDK(provider);
      const tokenMint = new PublicKey(tokenAddress);
      const supplyResult = await connection.getTokenSupply(tokenMint);
      const decimals = supplyResult.value.decimals;
      const lamportsToSell = BigInt(Math.floor(tokenAmount * 10 ** decimals));

      const transaction = await buildPumpFunSellTransaction({
        sellerPubkey,
        tokenMint,
        lamportsToSell,
        sdk,
        connection,
      });

      const privyProvider = await solanaWallet.getProvider();
      const signedTx = await signLegacyTransactionWithPrivy(
        transaction,
        sellerPubkey,
        privyProvider,
      );

      txId = await connection.sendRawTransaction(signedTx.serialize());
      console.log('[sellTokenViaPumpfun] => success, Pumpfun txId:', txId);
    }

    return {txId, success: true};
  } catch (error: any) {
    console.error('[sellTokenViaPumpfun] Error:', error?.message || error);
    throw error;
  }
}
