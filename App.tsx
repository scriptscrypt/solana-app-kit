// App.tsx
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import process from 'process';
global.process = process;

// Add a global dev mode flag that can be used anywhere in the app
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Declare global type for TypeScript
declare global {
  var __DEV_MODE__: boolean;
}

// Set a global __DEV_MODE__ flag during app initialization
global.__DEV_MODE__ = global.__DEV_MODE__ || false;

// Function to explicitly set dev mode for Expo Go
const forceDevMode = async () => {
  try {
    // Check if we're running yarn start --dev by looking at the app launch URL
    // This code will run before any React component mounts
    if (__DEV__) {
      // Check for dev mode in storage
      const storedDevMode = await AsyncStorage.getItem('devMode');

      // HACK: We know when start.js was run with --dev, we created a file
      // Try to read this manually from AsyncStorage which persists between runs
      const isInDevMode = storedDevMode === 'true';

      // Set the global flag
      global.__DEV_MODE__ = isInDevMode;

      console.log('[DEV MODE] Direct detection at startup:', {
        isInDevMode,
        storedDevMode
      });

      if (isInDevMode) {
        // FORCE DEV MODE WHEN DETECTED
        console.log('🟢 FORCE-ENABLING DEV MODE AT APP STARTUP');
      }
    }
  } catch (error) {
    console.error('[DEV MODE] Error in direct detection:', error);
  }
};

// Run this immediately at app startup
forceDevMode().catch(console.error);

import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/hooks/useAppNavigation';
import { store } from './src/state/store';
import './src/utils/polyfills';

import { PrivyProvider, PrivyElements } from '@privy-io/expo';
import { TurnkeyProvider } from '@turnkey/sdk-react-native';

// Dynamic client initialization
import { CustomizationProvider } from './src/CustomizationProvider';
import { DefaultCustomizationConfig } from './src/config';
import { getDynamicClient, initDynamicClient } from './src/modules/walletProviders/services/walletProviders/dynamic';
import TransactionNotification from './src/core/sharedUI/Common/TransactionNotification';

// Import DevMode components
import { DevModeProvider, useDevMode } from './src/context/DevModeContext';
import DevModeTrigger from './src/components/DevMode/DevModeTrigger';
import DevDrawer from './src/components/DevMode/DevDrawer';
import { View } from 'react-native';

// Import Environment Error provider and components
import { EnvErrorProvider, EnvErrorButton } from './src/context/EnvErrorContext';

// Component that conditionally renders dev tools
const DevModeComponents = () => {
  const { isDevMode } = useDevMode();

  if (!isDevMode) return null;

  return (
    <>
      <DevModeTrigger />
      <DevDrawer />
      <EnvErrorButton />
    </>
  );
};

export default function App() {
  const config = DefaultCustomizationConfig;
  const [dynamicInitialized, setDynamicInitialized] = useState(false);

  useEffect(() => {
    if (config.auth.provider === 'dynamic') {
      try {
        initDynamicClient(
          config.auth.dynamic.environmentId,
          config.auth.dynamic.appName,
          config.auth.dynamic.appLogoUrl
        );
        setDynamicInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Dynamic client:", error);
      }
    }
  }, [config.auth.provider]);

  // Get Dynamic client after initialization is complete
  const getDynamicWebView = () => {
    if (!dynamicInitialized) return null;

    try {
      const client = getDynamicClient();
      return client?.reactNative?.WebView ? <client.reactNative.WebView /> : null;
    } catch (error) {
      console.error("Error getting Dynamic WebView:", error);
      return null;
    }
  };

  // Component to render notification and any other global UI elements
  const GlobalUIElements = () => (
    <>
      <TransactionNotification />
    </>
  );

  // Configure Turnkey session
  const turnkeySessionConfig = {
    apiBaseUrl: config.auth.turnkey.baseUrl,
    organizationId: config.auth.turnkey.organizationId,
  };

  // Wrap the app with EnvErrorProvider for global env variable error handling
  return (
    <CustomizationProvider config={config}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <DevModeProvider>
            <EnvErrorProvider>
              <View style={{ flex: 1 }}>
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
                    }}
                  >
                    <NavigationContainer ref={navigationRef}>
                      <RootNavigator />
                    </NavigationContainer>
                    {getDynamicWebView()}
                    <GlobalUIElements />
                    <PrivyElements />
                  </PrivyProvider>
                ) : config.auth.provider === 'turnkey' ? (
                  <TurnkeyProvider config={turnkeySessionConfig}>
                    <NavigationContainer ref={navigationRef}>
                      <RootNavigator />
                    </NavigationContainer>
                    {getDynamicWebView()}
                    <GlobalUIElements />
                  </TurnkeyProvider>
                ) : (
                  <>
                    <NavigationContainer ref={navigationRef}>
                      <RootNavigator />
                    </NavigationContainer>
                    {getDynamicWebView()}
                    <GlobalUIElements />
                  </>
                )}

                {/* DevMode components will only render in dev mode */}
                <DevModeComponents />
              </View>
            </EnvErrorProvider>
          </DevModeProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </CustomizationProvider>
  );
}
