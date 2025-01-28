import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import IntroScreen from '../screens/IntroScreen';
import MainTabs from './MainTabs';

/**
 * Root stack parameter list.
 * Adjust these if you need to pass params to each screen.
 */
export type RootStackParamList = {
  Intro: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    console.log('RootNavigator');
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
