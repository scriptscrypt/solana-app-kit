import React, {useState, useCallback} from 'react';
import {View, Text, SafeAreaView} from 'react-native';
import EmbeddedWallet, {
  WalletProvider,
} from '../components/wallet/EmbeddedWallet';

const EmbeddedWalletScreen: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<{
    provider: WalletProvider;
    address: string;
  } | null>(null);

  const handleWalletConnected = useCallback(
    (info: {provider: WalletProvider; address: string}) => {
      setWalletInfo(info);
    },
    [],
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <EmbeddedWallet
        walletProvider="privy"
        onWalletConnected={handleWalletConnected}
        // themeOverrides, styleOverrides, and userStyleSheet can be provided here for customization
      />
      {walletInfo && (
        <View style={{padding: 16, alignItems: 'center'}}>
          <Text style={{fontSize: 16, fontWeight: '600'}}>
            Wallet Connected!
          </Text>
          <Text style={{fontSize: 14}}>
            Provider:{' '}
            {walletInfo.provider.charAt(0).toUpperCase() +
              walletInfo.provider.slice(1)}
          </Text>
          <Text style={{fontSize: 14}}>Address: {walletInfo.address}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EmbeddedWalletScreen;
