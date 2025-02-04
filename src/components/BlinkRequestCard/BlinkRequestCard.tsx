import React from 'react';
import { View, Text } from 'react-native';
import { Blink } from '@dialectlabs/blinks-react-native';
import { useAction } from '@dialectlabs/blinks';
import { useWallet } from '@solana/wallet-adapter-react'; // Import the wallet hook
import { styles } from './BlinkRequestCard.style';

function getWalletAdapter(wallet : any) {
  return {
    connect: async () => {
      if (!wallet.connected) {
        await wallet.connect();
      }
      return wallet.publicKey.toString();
    },
    signTransaction: async (transaction : any) => {
      if (!wallet.connected) {
        throw new Error('Wallet not connected');
      }
      const signedTransaction = await wallet.signTransaction(transaction);
      return {
        signature: signedTransaction.signature.toString(),
      };
    },
    confirmTransaction: async (signature : any) => {
      console.log('confirmTransaction', signature);
    },
    signMessage: async (message : any) => {
      if (!wallet.connected) {
        throw new Error('Wallet not connected');
      }
      const signedMessage = await wallet.signMessage(message);
      return {
        signature: signedMessage.toString(),
      };
    },
    metadata: {
        name: 'Phantom Wallet', // Example wallet name
        icon: 'https://example.com/phantom-icon.png', // URL to the wallet's icon
        supportedBlockchainIds: ['solana'], // Solana is supported
      }
  };
}

export const BlinkRequestCard: React.FC<{ url: string }> = ({ url }) => {
  const wallet = useWallet(); // Use the wallet hook
  const adapter = getWalletAdapter(wallet);
  const { action } = useAction({ url });

  if (!action) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  const actionUrl = new URL(url);

  return (
    <View style={styles.container}>
      <Blink
        theme={{
          '--blink-button': '#1D9BF0',
          '--blink-border-radius-rounded-button': 9999,
        }}
        action={action as any}
        adapter={adapter}
        websiteUrl={actionUrl.href}
        websiteText={actionUrl.hostname}
      />
    </View>
  );
};

export default BlinkRequestCard;