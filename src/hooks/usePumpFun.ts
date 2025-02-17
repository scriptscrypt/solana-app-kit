// File: src/hooks/usePumpfun.ts

import {useAppDispatch, useAppSelector} from './useReduxHooks';
import {
  launchTokenThunk,
  buyTokenThunk,
  sellTokenThunk,
  resetPumpfunState,
} from '../state/pumpfun/reducer';

function maskKey(key: string): string {
  if (!key) return '';
  // Show only first 5 and last 5 chars, for logging
  const firstFive = key.slice(0, 5);
  const lastFive = key.slice(-5);
  return `${firstFive}...${lastFive}`;
}

export function usePumpfun() {
  const dispatch = useAppDispatch();
  const pumpfunState = useAppSelector(state => state.pumpfun);

  /**
   * Launch a new Pumpfun token.
   */
  const launchToken = async ({
    privateKey,
    tokenName,
    tokenTicker,
    description,
    imageUrl,
    twitter,
    telegram,
    website,
  }: {
    privateKey: string;
    tokenName: string;
    tokenTicker: string;
    description: string;
    imageUrl: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  }) => {
    console.log('[usePumpfun.launchToken] Called with:', {
      maskedPrivateKey: maskKey(privateKey),
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      twitter,
      telegram,
      website,
    });
    try {
      dispatch(
        launchTokenThunk({
          privateKey,
          tokenName,
          tokenTicker,
          description,
          imageUrl,
          twitter,
          telegram,
          website,
        }),
      );
      console.log('[usePumpfun.launchToken] Dispatch successful.');
    } catch (error) {
      console.error(
        '[usePumpfun.launchToken] Error dispatching launchTokenThunk:',
        error,
      );
    }
  };

  /**
   * Buy a Pumpfun token with SOL.
   */
  const buyToken = async ({
    buyerPublicKey,
    tokenAddress,
    solAmount,
  }: {
    buyerPublicKey: string;
    tokenAddress: string;
    solAmount: number;
  }) => {
    console.log('[usePumpfun.buyToken] Called with:', {
      buyerPublicKey,
      tokenAddress,
      solAmount,
    });
    try {
      dispatch(buyTokenThunk({buyerPublicKey, tokenAddress, solAmount}));
      console.log('[usePumpfun.buyToken] Dispatch successful.');
    } catch (error) {
      console.error(
        '[usePumpfun.buyToken] Error dispatching buyTokenThunk:',
        error,
      );
    }
  };

  /**
   * Sell a certain amount of Pumpfun tokens.
   */
  const sellToken = async ({
    sellerPublicKey,
    tokenAddress,
    tokenAmount,
  }: {
    sellerPublicKey: string;
    tokenAddress: string;
    tokenAmount: number;
  }) => {
    console.log('[usePumpfun.sellToken] Called with:', {
      sellerPublicKey,
      tokenAddress,
      tokenAmount,
    });
    try {
      dispatch(sellTokenThunk({sellerPublicKey, tokenAddress, tokenAmount}));
      console.log('[usePumpfun.sellToken] Dispatch successful.');
    } catch (error) {
      console.error(
        '[usePumpfun.sellToken] Error dispatching sellTokenThunk:',
        error,
      );
    }
  };

  /**
   * Reset the pumpfun state in Redux.
   */
  const resetState = () => {
    console.log(
      '[usePumpfun.resetPumpfunState] Called. Dispatching resetPumpfunState.',
    );
    dispatch(resetPumpfunState());
  };

  return {
    pumpfunState,
    launchToken,
    buyToken,
    sellToken,
    resetPumpfunState: resetState,
  };
}
