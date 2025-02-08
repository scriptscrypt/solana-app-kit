import 'react-native-gesture-handler';
import React from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {navigationRef} from './src/hooks/useAppNavigation';
import {store} from './src/state/store';

import {PrivyElements, PrivyProvider} from '@privy-io/expo';

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PrivyProvider
          appId="cm6uomkl50041far9mfyj0i34"
          clientId="client-WY5gJ6MajBtnHq1Zq8Sawz75FEaYiZ2iiFFruvM7WgmkT"
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
          <PrivyElements />
        </PrivyProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
