// File: /src/components/auth/EmbeddedWalletAuth.tsx
import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icons from '../../assets/svgs';
import {useAuth} from '../../hooks/useAuth';
import styles from './EmbeddedWalletAuth.styles';

export interface EmbeddedWalletAuthProps {
  provider?: 'privy' | 'dynamic' | 'turnkey';
  onLoginSuccess?: (provider: string, address: string) => void;
  containerStyle?: object;
  buttonStyle?: object;
  buttonTextStyle?: object;
  authMode?: 'login' | 'signup';
}

const EmbeddedWalletAuth: React.FC<EmbeddedWalletAuthProps> = ({
  provider = 'privy',
  onLoginSuccess,
  containerStyle,
  buttonStyle,
  buttonTextStyle,
  authMode = 'login',
}) => {
  const {status, loginWithGoogle, loginWithApple, loginWithEmail, user} =
    useAuth(provider);

  useEffect(() => {
    if (user && user.id && onLoginSuccess) {
      onLoginSuccess(provider, user.id);
    }
  }, [user, onLoginSuccess, provider]);

  return (
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[styles.loginButton, buttonStyle]}
          onPress={loginWithGoogle}>
          <Icons.Google width={24} height={24} />
          <Text style={[styles.buttonText, buttonTextStyle]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, buttonStyle]}
          onPress={loginWithApple}>
          <Icons.Apple width={24} height={24} />
          <Text style={[styles.buttonText, buttonTextStyle]}>
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, buttonStyle]}
          onPress={() => loginWithEmail}>
          <Icons.Device width={24} height={24} />
          <Text style={[styles.buttonText, buttonTextStyle]}>
            Continue with Email
          </Text>
        </TouchableOpacity>
      </View>
  );
};

export default EmbeddedWalletAuth;
