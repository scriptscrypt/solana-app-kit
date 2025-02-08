import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  useLogin,
  usePrivy,
  useEmbeddedSolanaWallet,
  isNotCreated,
  isConnected,
  needsRecovery,
} from '@privy-io/expo';

import { createPasskey, PasskeyStamper } from '@turnkey/react-native-passkey-stamper';
import { TurnkeyClient } from '@turnkey/http';

export type WalletProvider = 'privy' | 'dynamic' | 'turnkey';

interface EmbeddedWalletProps {
  walletProvider?: WalletProvider;
  onWalletConnected?: (walletInfo: { provider: WalletProvider; address: string; }) => void;
  // Additional customization if needed
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: { [key: string]: object };
  userStyleSheet?: { [key: string]: object };
}

const EmbeddedWallet: React.FC<EmbeddedWalletProps> = ({
  walletProvider: initialProvider = 'privy',
  onWalletConnected,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<WalletProvider>(initialProvider);
  const { login } = useLogin();
  const { user, isReady, logout } = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();
  const [statusMessage, setStatusMessage] = useState('');
  const emailAccount = user?.linked_accounts.find(
    account => account.type === 'email'
  );
  const userEmail = emailAccount?.address;

  useEffect(() => {
    setSelectedProvider(initialProvider);
  }, [initialProvider]);

  const handleConnectWallet = async () => {
    // ---------- TURNKEY BRANCH ----------
    if (selectedProvider === 'turnkey') {
      setStatusMessage(`Connecting with Turnkey...`);
      try {
        // Create a new passkey.
        // These values are hardcoded for demo purposes.
        // In production, allow these to be passed in as props.
        const authenticatorParams = await createPasskey({
          authenticatorName: 'End-User Passkey', // Internal name for the authenticator
          rp: {
            id: 'your.site.com',   // Replace with your domain when hosted; placeholder for now.
            name: 'Your App',      // Replace with your app’s name.
          },
          user: {
            id: String(Date.now()), // Unique user id (for demo, Date.now() is acceptable)
            name: 'Demo User',
            displayName: 'Demo User',
          },
        });
        console.log('Turnkey authenticator parameters:', authenticatorParams);

        // Initialize the Turnkey Stamper and HTTP client.
        const stamper = new PasskeyStamper({
          rpId: 'your.site.com', // Must match the rp.id above.
        });
        const turnkeyClient = new TurnkeyClient(
          { baseUrl: 'https://api.turnkey.com' }, // Change this if using a custom endpoint.
          stamper
        );

        // For demo purposes, consider the turnkey flow successful once a passkey is created.
        setStatusMessage('Turnkey login flow initiated successfully.');

        // If your backend returns an address or identifier, pass it to onWalletConnected.
        onWalletConnected?.({
          provider: selectedProvider,
          address: String(Date.now()), // Use the same ID we generated earlier
        });
      } catch (error: any) {
        console.error('Turnkey login error:', error);
        setStatusMessage(`Turnkey login failed: ${error.message}`);
      }
      return;
    }

    // ---------- OTHER PROVIDERS (Privy as default) ----------
    // if (selectedProvider !== 'privy') {
    //   setStatusMessage(`Provider "${selectedProvider}" not implemented yet.`);
    //   return;
    // }

    if (user) {
      setStatusMessage(`You are already logged in as ${userEmail || user?.id}`);
      return;
    }

    try {
      setStatusMessage(`Connecting with ${selectedProvider}...`);
      const session = await login({
        loginMethods: ['email', 'sms'],
        appearance: {
          logo: '', // Optionally provide a custom logo here.
        },
      });
      console.log('Privy Session:', session);
      if (session?.user) {
        setStatusMessage(`Connected user: ${session.user.id}`);
      }
    } catch (error: any) {
      console.error('Privy Login Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        fullError: error,
      });
      setStatusMessage(`Connection failed: ${error.message}`);
    }
  };

  // This useEffect monitors the status of the embedded Solana wallet (for Privy integration).
  useEffect(() => {
    const handleWalletStatus = async () => {
      if (selectedProvider !== 'privy' || !user || !isReady || !solanaWallet)
        return;

      if (isConnected(solanaWallet)) {
        const connectedWallet = solanaWallet.wallets[0];
        setStatusMessage(`Solana wallet is connected: ${connectedWallet.publicKey}`);
        onWalletConnected?.({
          provider: selectedProvider,
          address: connectedWallet.publicKey,
        });
      } else if (needsRecovery(solanaWallet)) {
        setStatusMessage('This wallet must be recovered (e.g. passcode or iCloud).');
      } else if (isNotCreated(solanaWallet)) {
        try {
          await solanaWallet.create();
          const newWallet = solanaWallet.wallets[0];
          setStatusMessage(`Solana wallet created: ${newWallet.publicKey}`);
        } catch (err: any) {
          setStatusMessage(`Could not create wallet: ${err.message}`);
        }
      }
    };
    handleWalletStatus();
  }, [selectedProvider, user, isReady, solanaWallet, onWalletConnected]);

  const handleLogout = async () => {
    try {
      await logout();
      setStatusMessage('Logged out successfully');
    } catch (error: any) {
      setStatusMessage(error.message || 'Logout failed');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
          Embedded Solana Wallet
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          {(['privy', 'dynamic', 'turnkey'] as WalletProvider[]).map(provider => {
            const isActive = provider === selectedProvider;
            return (
              <TouchableOpacity
                key={provider}
                onPress={() => {
                  setSelectedProvider(provider);
                  setStatusMessage('');
                }}
                style={{
                  marginHorizontal: 5,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor: isActive ? '#2B8EF0' : '#ccc',
                  backgroundColor: isActive ? '#2B8EF0' : 'transparent',
                }}
              >
                <Text style={{ color: isActive ? '#fff' : '#000' }}>
                  {provider.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Show Connect Wallet button if not logged in */}
        {!user && (
          <TouchableOpacity
            onPress={handleConnectWallet}
            style={{
              backgroundColor: '#2B8EF0',
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Connect Wallet
            </Text>
          </TouchableOpacity>
        )}

        {/* Show Logout button if logged in */}
        {user && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginTop: 10,
              backgroundColor: '#777',
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* Display status messages */}
        {statusMessage ? (
          <Text style={{ marginTop: 20, color: '#555', textAlign: 'center' }}>
            {statusMessage}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default EmbeddedWallet;
