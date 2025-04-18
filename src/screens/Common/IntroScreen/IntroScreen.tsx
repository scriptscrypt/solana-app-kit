import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import COLORS from '../../../assets/colors';
import Logo from '../../../assets/svgs/logo.svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../state/store';
import { getDynamicClient } from '../../../modules/walletProviders/services/walletProviders/dynamic';

export default function IntroScreen() {
  const navigation = useAppNavigation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsCheckingAuth(true);
      try {
        // Check if user is already authenticated using Dynamic client
        const client = getDynamicClient();
        const authUser = client?.auth?.authenticatedUser;

        if (authUser) {
          console.log('User already authenticated, navigating to MainTabs');
          // User is authenticated, navigate to MainTabs
          setTimeout(() => {
            navigation.navigate('MainTabs' as never);
            setIsCheckingAuth(false);
          }, 1000); // Small delay for smooth transition
        } else {
          console.log('User not authenticated, navigating to LoginOptions');
          // User is not authenticated, navigate to LoginOptions
          setTimeout(() => {
            navigation.navigate('LoginOptions');
            setIsCheckingAuth(false);
          }, 2000); // 2 seconds delay
        }
      } catch (e) {
        console.log('Dynamic client not initialized yet or error:', e);
        // If there's an error or client not initialized, fallback to Redux state
        setTimeout(() => {
          if (isLoggedIn) {
            navigation.navigate('MainTabs' as never);
          } else {
            navigation.navigate('LoginOptions');
          }
          setIsCheckingAuth(false);
        }, 2000); // 2 seconds delay
      }
    };

    checkAuthStatus();
  }, [navigation, isLoggedIn]);

  return (
    <View style={styles.container}>
      <Logo width={250} height={120} />
      {isCheckingAuth && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.brandPrimary} style={styles.loader} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
});
