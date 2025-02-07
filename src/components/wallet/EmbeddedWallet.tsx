import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

import {
  useLogin,
  usePrivy,
  useEmbeddedSolanaWallet,
  isNotCreated,
  isConnected,
  needsRecovery,
} from '@privy-io/expo';

export type WalletProvider = 'privy' | 'dynamic' | 'turnkey';

interface EmbeddedWalletProps {
  walletProvider?: WalletProvider;
  onWalletConnected?: (walletInfo: {
    provider: WalletProvider;
    address: string;
  }) => void;

  // Additional customization if needed
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
  userStyleSheet?: {[key: string]: object};
}

const EmbeddedWallet: React.FC<EmbeddedWalletProps> = ({
  walletProvider: initialProvider = 'privy',
  onWalletConnected,
}) => {
  const [selectedProvider, setSelectedProvider] =
    useState<WalletProvider>(initialProvider);

  const {login} = useLogin();
  const {user, isReady, logout} = usePrivy();
  const solanaWallet = useEmbeddedSolanaWallet();

  const [statusMessage, setStatusMessage] = useState('');
  const emailAccount = user?.linked_accounts.find(
    account => account.type === 'email',
  );
  const userEmail = emailAccount?.address;

  useEffect(() => {
    setSelectedProvider(initialProvider);
  }, [initialProvider]);

  const handleConnectWallet = async () => {
    if (selectedProvider !== 'privy') {
      setStatusMessage(`Provider "${selectedProvider}" not implemented yet.`);
      return;
    }

    if (user) {
      setStatusMessage(`You are already logged in as ${userEmail || user?.id}`);
      return;
    }

    try {
      setStatusMessage(`Connecting with ${selectedProvider}...`);
      const session = await login({
        loginMethods: ['email', 'sms'],
        appearance: {
          logo: '',
        },
      });

      console.log('Privy Session:', session);

      if (session?.user) {
        setStatusMessage(`Connected user: ${session.user.id}`);
      }
    } catch (error: any) {
      console.log('Privy Login Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        fullError: error,
      });

      setStatusMessage(`Connection failed: ${error.message}`);
    }
  };

  // Main useEffect that handles wallet connection
  useEffect(() => {
    const handleWalletStatus = async () => {
      if (selectedProvider !== 'privy' || !user || !isReady || !solanaWallet)
        return;

      if (isConnected(solanaWallet)) {
        const connectedWallet = solanaWallet.wallets[0];
        setStatusMessage(
          `Solana wallet is connected: ${connectedWallet.publicKey}`,
        );

        onWalletConnected?.({
          provider: selectedProvider,
          address: connectedWallet.publicKey,
        });
      } else if (needsRecovery(solanaWallet)) {
        setStatusMessage(
          'This wallet must be recovered (e.g. passcode or iCloud).',
        );
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

  // === RENDER UI ===
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, padding: 20, alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 16}}>
          Embedded Solana Wallet
        </Text>
        <View style={{flexDirection: 'row', marginBottom: 20}}>
          {(['privy', 'dynamic', 'turnkey'] as WalletProvider[]).map(
            provider => {
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
                  }}>
                  <Text style={{color: isActive ? '#fff' : '#000'}}>
                    {provider.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {/* If not logged in, show "Connect" */}
        {!user && (
          <TouchableOpacity
            onPress={handleConnectWallet}
            style={{
              backgroundColor: '#2B8EF0',
              padding: 12,
              borderRadius: 8,
            }}>
            <Text style={{color: '#fff', fontWeight: '600'}}>
              Connect Wallet
            </Text>
          </TouchableOpacity>
        )}

        {/* If user is logged in, show a Logout button */}
        {user && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginTop: 10,
              backgroundColor: '#777',
              padding: 12,
              borderRadius: 8,
            }}>
            <Text style={{color: '#fff', fontWeight: '600'}}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* Status messages */}
        {statusMessage ? (
          <Text style={{marginTop: 20, color: '#555', textAlign: 'center'}}>
            {statusMessage}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default EmbeddedWallet;
