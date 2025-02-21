// File: src/hooks/usePumpfun.ts

import {useCallback} from 'react';
import {Alert} from 'react-native';
import {useAuth} from './useAuth';
import {
  buyTokenViaPumpfun,
  sellTokenViaPumpfun,
  launchTokenViaPumpfun,
} from '../services/pumpfun/pumpfunService';

interface BuyParams {
  tokenAddress: string;
  solAmount: number;
}
interface SellParams {
  tokenAddress: string;
  tokenAmount: number;
}
interface LaunchParams {
  tokenName: string;
  tokenSymbol: string;
  description?: string;
  imageUrl?: string;
  additionalOptions?: {
    twitter?: string;
    telegram?: string;
    website?: string;
  };
}

/**
 * usePumpfun hook: now uses Pinata under the hood for uploading metadata
 * (see launchTokenViaPumpfun in pumpfunService.ts).
 */
export function usePumpfun() {
  const {solanaWallet} = useAuth();

  const buyToken = useCallback(
    async ({tokenAddress, solAmount}: BuyParams) => {
      if (!solanaWallet) {
        Alert.alert('Error', 'No Solana wallet found. Please connect first.');
        return;
      }
      try {
        console.log('[usePumpfun.buyToken] Attempting to buy token:', {
          tokenAddress,
          solAmount,
        });
        await buyTokenViaPumpfun({
          buyerPublicKey: solanaWallet.wallets?.[0]?.publicKey || '',
          tokenAddress,
          solAmount,
          solanaWallet,
        });
        Alert.alert('Success', `Bought token: ${tokenAddress}`);
      } catch (error: any) {
        console.error('[usePumpfun.buyToken] Error:', error);
        Alert.alert('Error Buying Token', error?.message || String(error));
      }
    },
    [solanaWallet],
  );

  const sellToken = useCallback(
    async ({tokenAddress, tokenAmount}: SellParams) => {
      if (!solanaWallet) {
        Alert.alert('Error', 'No Solana wallet found. Please connect first.');
        return;
      }
      try {
        console.log('[usePumpfun.sellToken] Attempting to sell token:', {
          tokenAddress,
          tokenAmount,
        });
        await sellTokenViaPumpfun({
          sellerPublicKey: solanaWallet.wallets?.[0]?.publicKey || '',
          tokenAddress,
          tokenAmount,
          solanaWallet,
        });
        Alert.alert('Success', `Sold ${tokenAmount} tokens: ${tokenAddress}`);
      } catch (error: any) {
        console.error('[usePumpfun.sellToken] Error:', error);
        Alert.alert('Error Selling Token', error?.message || String(error));
      }
    },
    [solanaWallet],
  );

  const launchToken = useCallback(
    async ({
      tokenName,
      tokenSymbol,
      description,
      imageUrl,
      additionalOptions,
    }: LaunchParams) => {
      if (!solanaWallet) {
        Alert.alert('Error', 'No Solana wallet found. Please connect first.');
        return;
      }
      try {
        console.log('[usePumpfun.launchToken] Attempting to launch token:', {
          tokenName,
          tokenSymbol,
        });
        const {mintPubkey} = await launchTokenViaPumpfun({
          solanaWallet,
          tokenName,
          tokenSymbol,
          description,
          imageUrl,
          additionalOptions,
        });
        // Only show success alert if no error was thrown:
        Alert.alert('Success', `Launched new token with mint: ${mintPubkey}`);
      } catch (error: any) {
        console.error('[usePumpfun.launchToken] Error:', error);
        Alert.alert('Error Launching Token', error?.message || String(error));
      }
    },
    [solanaWallet],
  );

  return {
    buyToken,
    sellToken,
    launchToken,
  };
}
