import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import Icons from '../../assets/svgs';
import {useAuth} from '../../hooks/useAuth';
import styles from '../../screens/LoginScreen/LoginScreen.styles';

export interface EmbeddedWalletAuthProps {
  provider?: 'privy' | 'dynamic' | 'turnkey';
  onWalletConnected: (info: {
    provider: 'privy' | 'dynamic' | 'turnkey';
    address: string;
  }) => void;
  authMode?: 'login' | 'signup';
}

const EmbeddedWalletAuth: React.FC<EmbeddedWalletAuthProps> = ({
  provider = 'privy',
  onWalletConnected,
  authMode = 'login',
}) => {
  const {
    status,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    user,
    solanaWallet,
  } = useAuth(provider);

  useEffect(() => {
    console.log(solanaWallet, 'solanaWallet');
    if (user && solanaWallet && onWalletConnected) {
      const walletPublicKey =
            solanaWallet.wallets && solanaWallet.wallets.length > 0
              ? solanaWallet.wallets[0].publicKey
              : null;
      if (!solanaWallet || !walletPublicKey) {
        Alert.alert('Wallet Error', 'Wallet not connected');
        return;
      }
      onWalletConnected({provider, address: walletPublicKey});
    }
  }, [user, onWalletConnected, provider]);

  return (
    <View style={styles.bottomButtonsContainer}>
      <TouchableOpacity style={styles.loginButton} onPress={loginWithGoogle}>
        <Icons.Google width={24} height={24} />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={loginWithApple}>
        <Icons.Apple width={24} height={24} />
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.loginButton]}
        onPress={loginWithEmail}>
        <Icons.Device width={24} height={24} />
        <Text style={[styles.buttonText]}>Continue with Email</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmbeddedWalletAuth;
