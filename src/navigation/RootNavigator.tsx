import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import IntroScreen from '../screens/IntroScreen/IntroScreen';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import type {RootStackParamList} from '../hooks/useAppNavigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="LoginOptions" component={LoginScreen} />
    </Stack.Navigator>
  );
}
