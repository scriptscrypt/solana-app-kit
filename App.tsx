import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {navigationRef} from './src/hooks/useAppNavigation';
import {store} from './src/state/store';
import './src/utils/polyfills';

import {PrivyProvider, PrivyElements} from '@privy-io/expo';

// Dynamic client initialization
import {
  initDynamicClient,
  getDynamicClient,
} from './src/services/walletProviders/dynamic';

import {CustomizationProvider} from './src/CustomizationProvider';
import {DefaultCustomizationConfig} from './src/config';

export default function App() {
  const config = DefaultCustomizationConfig;

  // Initialize the dynamic client once (if "dynamic" is being used).
  // Even if you’re using "privy" or "turnkey", calling this won’t break anything;
  // it just sets up the dynamic client with the config environment ID.
  useEffect(() => {
    if (config.auth.provider === 'dynamic') {
      initDynamicClient(
        config.auth.dynamic.environmentId,
        config.auth.dynamic.appName,
        config.auth.dynamic.appLogoUrl,
      );
    }
    // If you want, you can do something similar for Turnkey or Privy if needed.
  }, [config.auth.provider]);

  // We only call `getDynamicClient()` once we’ve initialized. This is optional
  // to keep the code consistent with the existing <dynamicClient.reactNative.WebView /> usage.
  let dynamicClient: any;
  try {
    dynamicClient = getDynamicClient();
  } catch {
    dynamicClient = null;
  }

  return (
    <CustomizationProvider config={config}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          {config.auth.provider === 'privy' ? (
            <PrivyProvider
              appId={config.auth.privy.appId}
              clientId={config.auth.privy.clientId}
              config={{
                embedded: {
                  solana: {
                    createOnLogin: 'users-without-wallets',
                  },
                },
              }}>
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
              {/* Only render dynamic’s WebView if it’s been initialized and you need it */}
              {dynamicClient?.reactNative && (
                <dynamicClient.reactNative.WebView />
              )}
              <PrivyElements />
            </PrivyProvider>
          ) : (
            // If not using Privy, you can place your other root providers accordingly.
            // For example, if you are using Dynamic only, skip the PrivyProvider:
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
              <dynamicClient.reactNative.WebView />
            </NavigationContainer>
          )}
        </ReduxProvider>
      </SafeAreaProvider>
    </CustomizationProvider>
  );
}
