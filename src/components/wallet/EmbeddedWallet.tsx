import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, SafeAreaView} from 'react-native';

import {handleTurnkeyConnect} from '../../services/walletProviders/turnkey';
import {handleDynamicConnect} from '../../services/walletProviders/dynamic';
import {usePrivyWalletLogic} from '../../services/walletProviders/privy';

export type WalletProvider = 'privy' | 'dynamic' | 'turnkey';
interface EmbeddedWalletProps {
  walletProvider?: WalletProvider;
  onWalletConnected?: (walletInfo: {
    provider: WalletProvider;
    address: string;
  }) => void;
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
  userStyleSheet?: {[key: string]: object};
}

export const EmbeddedWallet: React.FC<EmbeddedWalletProps> = ({
  walletProvider: initialProvider = 'privy',
  onWalletConnected,
}) => {
  const [selectedProvider, setSelectedProvider] =
    useState<WalletProvider>(initialProvider);
  const [statusMessage, setStatusMessage] = useState('');

  // === PRIVY HOOKS ===
  const {
    user,
    isReady,
    handlePrivyLogin,
    handlePrivyLogout,
    monitorSolanaWallet,
  } = usePrivyWalletLogic();

  const emailAccount = user?.linked_accounts.find(
    account => account.type === 'email',
  );
  const userEmail = emailAccount?.address;

  useEffect(() => {
    setSelectedProvider(initialProvider);
  }, [initialProvider]);

  // Update the useEffect in EmbeddedWallet.tsx to handle wallet status better
  useEffect(() => {
    if (selectedProvider === 'privy' && user && isReady) {
      monitorSolanaWallet({
        selectedProvider,
        setStatusMessage,
        onWalletConnected,
      });
    }
  }, [selectedProvider, user, isReady, monitorSolanaWallet, onWalletConnected]);

  /**
   * Called when user taps "Connect Wallet"
   */
  const handleConnectWallet = async () => {
    // If Turnkey
    if (selectedProvider === 'turnkey') {
      try {
        await handleTurnkeyConnect(onWalletConnected, setStatusMessage);
      } catch (error) {
        // handle error if needed
      }
      return;
    }

    // If Dynamic
    if (selectedProvider === 'dynamic') {
      await handleDynamicConnect(onWalletConnected, setStatusMessage);
      return;
    }

    // Otherwise, Privy
    await handlePrivyLogin({userEmail, setStatusMessage});
  };

  const handleLogout = async () => {
    if (selectedProvider === 'turnkey' || selectedProvider === 'dynamic') {
      setStatusMessage(`No logout flow implemented for ${selectedProvider}.`);
      return;
    }
    // Privy logout
    await handlePrivyLogout(setStatusMessage);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, padding: 20, alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 16}}>
          Embedded Solana Wallet
        </Text>

        {/* Provider Selector */}
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

        {(selectedProvider !== 'privy' || !user) && (
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

        {selectedProvider === 'privy' && user && (
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
