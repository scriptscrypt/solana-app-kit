// File: src/hooks/useAuth.ts

import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from '../state/auth/reducer';
import { usePrivyWalletLogic } from '../services/walletProviders/privy';
import { useDynamicWalletLogic } from '../services/walletProviders/dynamic';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

// For Node/React Native use of Buffer (if needed)
import { Buffer } from 'buffer';

const SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const solanaConnection = new Connection(SOLANA_RPC_ENDPOINT);

export type AuthProvider = 'privy' | 'dynamic' | 'turnkey';

export function useAuth(selectedProvider: AuthProvider = 'privy') {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<string>('');

  console.log('[useAuth] Hook called with provider:', selectedProvider);

  // -------------------------------
  // PRIVY PROVIDER
  // -------------------------------
  if (selectedProvider === 'privy') {
    const {
      handlePrivyLogin,
      handlePrivyLogout,
      user,
      isReady,
      solanaWallet,
    }: any = usePrivyWalletLogic();

    console.log('[useAuth] privy => user:', user);

    /**
     * Custom signTransaction callback for Privy.
     * Since PrivyEmbeddedSolanaProvider does not expose a direct signTransaction method,
     * we use provider.request. In this version, we pass the transaction (serialized
     * to base64) in an array (i.e. params: [base64Tx]) rather than an object.
     */
    const signTransaction = useCallback(
      async (transaction: VersionedTransaction): Promise<VersionedTransaction> => {
        console.log('[useAuth:privy] signTransaction called...');

        if (!solanaWallet || solanaWallet.wallets.length === 0) {
          throw new Error('[useAuth:privy] No embedded wallet found in Privy.');
        }

        // Use the first sub-wallet’s provider
        const provider = await solanaWallet.wallets[0].getProvider();
        if (!provider || typeof provider.request !== 'function') {
          throw new Error('[useAuth:privy] This provider does not support request(...).');
        }
        console.log('[useAuth:privy] provider:', provider);

        // Serialize the transaction to a Buffer, then convert to base64.
        const serializedTx = transaction.serialize();
        const base64Tx = Buffer.from(serializedTx).toString('base64');
        console.log('[useAuth:privy] base64Tx:', base64Tx);

        // Call provider.request. (Note: some providers expect the parameters as an array.)
        const result = await provider.request({
          method: 'signTransaction',
          params: [base64Tx],
        });
        console.log('[useAuth:privy] provider.request result:', result);

        // Expect result to be either a string or an object containing the signed transaction.
        let signedBase64: string;
        if (typeof result === 'string') {
          signedBase64 = result;
        } else if (result && typeof result.signedTransaction === 'string') {
          signedBase64 = result.signedTransaction;
        } else {
          throw new Error('[useAuth:privy] Invalid signedTransaction format returned by provider.');
        }
        console.log('[useAuth:privy] got signedBase64 from provider:', signedBase64);

        // Convert the base64 back to a Buffer and deserialize.
        const signedTxBuffer = Buffer.from(signedBase64, 'base64');
        try {
          const signedTx = VersionedTransaction.deserialize(signedTxBuffer);
          console.log('[useAuth:privy] Reconstructed signed VersionedTransaction.');
          return signedTx;
        } catch (err) {
          console.error('[useAuth:privy] Failed to deserialize signed transaction:', err);
          throw err;
        }
      },
      [solanaWallet],
    );

    // Convert the publicKey (from the first sub-wallet) into a PublicKey instance.
    let derivedPublicKey: PublicKey | null = null;
    if (solanaWallet?.wallets?.[0]?.publicKey) {
      derivedPublicKey = new PublicKey(solanaWallet.wallets[0].publicKey);
      console.log('[useAuth:privy] derivedPublicKey:', derivedPublicKey.toBase58());
    } else {
      console.warn('[useAuth:privy] No public key found in solanaWallet');
    }

    // Login / Logout callbacks
    const loginWithGoogle = useCallback(async () => {
      console.log('[useAuth:privy] loginWithGoogle called...');
      await handlePrivyLogin({
        loginMethod: 'google',
        setStatusMessage: setStatus,
      });
      if (user && user.id) {
        console.log('[useAuth:privy] User logged in with Google:', user.id);
        dispatch(loginSuccess({ provider: 'privy', address: user.id }));
      }
    }, [handlePrivyLogin, dispatch, user]);

    const loginWithApple = useCallback(async () => {
      console.log('[useAuth:privy] loginWithApple called...');
      await handlePrivyLogin({
        loginMethod: 'apple',
        setStatusMessage: setStatus,
      });
      if (user && user.id) {
        console.log('[useAuth:privy] User logged in with Apple:', user.id);
        dispatch(loginSuccess({ provider: 'privy', address: user.id }));
      }
    }, [handlePrivyLogin, dispatch, user]);

    const loginWithEmail = useCallback(async () => {
      console.log('[useAuth:privy] loginWithEmail called...');
      await handlePrivyLogin({
        loginMethod: 'email',
        setStatusMessage: setStatus,
      });
      if (user && user.id) {
        console.log('[useAuth:privy] User logged in with Email:', user.id);
        dispatch(loginSuccess({ provider: 'privy', address: user.id }));
      }
    }, [handlePrivyLogin, dispatch, user]);

    const logout = useCallback(async () => {
      console.log('[useAuth:privy] logout called...');
      await handlePrivyLogout(setStatus);
      console.log('[useAuth:privy] User logged out.');
      dispatch(logoutSuccess());
    }, [handlePrivyLogout, dispatch]);

    return {
      status,
      loginWithGoogle,
      loginWithApple,
      loginWithEmail,
      logout,
      user,
      // Nest signTransaction and publicKey into the wallet object.
      wallet: {
        ...solanaWallet,
        signTransaction,
        publicKey: derivedPublicKey,
      },
      connection: solanaConnection,
      isReady,
    };
  }

  // -------------------------------
  // DYNAMIC PROVIDER (placeholder)
  // -------------------------------
  else if (selectedProvider === 'dynamic') {
    console.log('[useAuth] dynamic => hooking up dynamic logic...');
    const { handleDynamicLogin, handleDynamicLogout, walletAddress, user } =
      useDynamicWalletLogic();

    const signTransaction = async (tx: VersionedTransaction) => {
      throw new Error('[useAuth:dynamic] signTransaction not implemented yet');
    };

    const loginWithEmail = useCallback(async () => {
      console.log('[useAuth:dynamic] loginWithEmail called...');
      await handleDynamicLogin({
        loginMethod: 'email',
        setStatusMessage: setStatus,
      });
      if (walletAddress) {
        console.log('[useAuth:dynamic] User logged in with Email (Dynamic):', walletAddress);
        dispatch(loginSuccess({ provider: 'dynamic', address: walletAddress }));
      }
    }, [handleDynamicLogin, dispatch, walletAddress]);

    const loginWithSMS = useCallback(async () => {
      console.log('[useAuth:dynamic] loginWithSMS called...');
      await handleDynamicLogin({
        loginMethod: 'sms',
        setStatusMessage: setStatus,
      });
      if (walletAddress) {
        console.log('[useAuth:dynamic] User logged in with SMS (Dynamic):', walletAddress);
        dispatch(loginSuccess({ provider: 'dynamic', address: walletAddress }));
      }
    }, [handleDynamicLogin, dispatch, walletAddress]);

    const loginWithGoogle = useCallback(async () => {
      console.log('[useAuth:dynamic] loginWithGoogle called...');
      await handleDynamicLogin({
        loginMethod: 'google',
        setStatusMessage: setStatus,
      });
      if (walletAddress) {
        console.log('[useAuth:dynamic] User logged in with Google (Dynamic):', walletAddress);
        dispatch(loginSuccess({ provider: 'dynamic', address: walletAddress }));
      }
    }, [handleDynamicLogin, dispatch, walletAddress]);

    const logout = useCallback(async () => {
      console.log('[useAuth:dynamic] logout called...');
      await handleDynamicLogout(setStatus);
      console.log('[useAuth:dynamic] User logged out (Dynamic).');
      dispatch(logoutSuccess());
    }, [handleDynamicLogout, dispatch]);

    return {
      status,
      loginWithEmail,
      loginWithSMS,
      loginWithGoogle,
      logout,
      user: walletAddress ? { id: walletAddress } : user,
      wallet: {
        publicKey: null,
        signTransaction,
      },
      connection: solanaConnection,
      isReady: true,
    };
  }

  // -------------------------------
  // TURNKEY PROVIDER (placeholder)
  // -------------------------------
  else if (selectedProvider === 'turnkey') {
    console.log('[useAuth] turnkey => hooking up placeholder logic...');
    const logout = useCallback(async () => {
      dispatch(logoutSuccess());
      console.log('[useAuth:turnkey] User logged out (Turnkey).');
    }, [dispatch]);

    return {
      status,
      loginWithEmail: async () => {
        /* not implemented */
      },
      logout,
      user: null,
      wallet: {
        publicKey: null,
        signTransaction: async () => {
          throw new Error('[useAuth:turnkey] signTransaction not implemented');
        },
      },
      connection: solanaConnection,
      isReady: true,
    };
  }

  console.warn('[useAuth] No valid provider selected. Returning default fallback.');
  return {
    status: '',
    logout: async () => {},
    user: null,
    wallet: {
      publicKey: null,
      signTransaction: async () => {
        throw new Error('No provider selected');
      },
    },
    connection: solanaConnection,
    isReady: false,
  };
}
