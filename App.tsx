import 'react-native-gesture-handler';
import React from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {navigationRef} from './src/hooks/useAppNavigation';
import {store} from './src/state/store';
import {PRIVY_APP_ID, PRIVY_CLIENT_ID} from '@env';

import {PrivyElements, PrivyProvider} from '@privy-io/expo';

export default function App() {
  console.log('PRIVY_APP_ID:', PRIVY_APP_ID);
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PrivyProvider
          appId={PRIVY_APP_ID}
          clientId={PRIVY_CLIENT_ID}
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
