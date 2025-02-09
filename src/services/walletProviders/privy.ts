// services/walletProviders/privyWallet.ts

import {
  useLogin,
  usePrivy,
  useEmbeddedSolanaWallet,
  isNotCreated,
  isConnected,
  needsRecovery,
} from '@privy-io/expo';

import {useEffect, useCallback} from 'react';

/**
 * This custom hook encapsulates the existing Privy logic
 * from your EmbeddedWallet component.
 */
export function usePrivyWalletLogic() {
  const {login} = useLogin();
  const {user, isReady, logout} = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();

  /**
   * The same login logic from your handleConnectWallet (Privy branch)
   */
  const handlePrivyLogin = useCallback(
    async ({
      userEmail,
      setStatusMessage,
    }: {
      userEmail?: string;
      setStatusMessage?: (msg: string) => void;
    }) => {
      // If user is already logged in, short-circuit
      if (user) {
        setStatusMessage?.(
          `You are already logged in as ${userEmail || user?.id}`,
        );
        return;
      }

      try {
        setStatusMessage?.('Connecting with privy...');
        const session = await login({
          loginMethods: ['email', 'sms'],
          appearance: {
            logo: '', // Optionally pass your custom logo
          },
        });
        console.log('Privy Session:', session);
        if (session?.user) {
          setStatusMessage?.(`Connected user: ${session.user.id}`);
        }
      } catch (error: any) {
        console.error('Privy Login Error:', error);
        setStatusMessage?.(`Connection failed: ${error.message}`);
      }
    },
    [user, login],
  );

  const monitorSolanaWallet = useCallback(
    async ({
      selectedProvider,
      setStatusMessage,
      onWalletConnected,
    }: {
      selectedProvider: string;
      setStatusMessage?: (msg: string) => void;
      onWalletConnected?: (info: {provider: 'privy'; address: string}) => void;
    }) => {
      if (selectedProvider !== 'privy' || !user || !isReady || !solanaWallet) {
        return;
      }

      try {
        if (isConnected(solanaWallet)) {
          const connectedWallet = solanaWallet.wallets[0];
          setStatusMessage?.(
            `Connected to existing wallet: ${connectedWallet.publicKey}`,
          );
          onWalletConnected?.({
            provider: 'privy',
            address: connectedWallet.publicKey,
          });
          return;
        }

        if (needsRecovery(solanaWallet)) {
          setStatusMessage?.('Wallet needs recovery');
          return;
        }

        // Only create if no wallet exists
        if (isNotCreated(solanaWallet)) {
          await solanaWallet.create();
          const newWallet = solanaWallet.wallets[0];
          setStatusMessage?.(`Created wallet: ${newWallet.publicKey}`);
          onWalletConnected?.({
            provider: 'privy',
            address: newWallet.publicKey,
          });
        }
      } catch (err: any) {
        setStatusMessage?.(`Wallet operation failed: ${err.message}`);
      }
    },
    [isReady, solanaWallet, user],
  );


  /**
   * Same logout logic from your handleLogout
   */
  const handlePrivyLogout = useCallback(
    async (setStatusMessage?: (msg: string) => void) => {
      try {
        await logout();
        setStatusMessage?.('Logged out successfully');
      } catch (error: any) {
        setStatusMessage?.(error.message || 'Logout failed');
      }
    },
    [logout],
  );

  return {
    user,
    isReady,
    solanaWallet,
    handlePrivyLogin,
    handlePrivyLogout,
    monitorSolanaWallet,
  };
}
