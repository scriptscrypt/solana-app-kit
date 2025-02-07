import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import IntroScreen from '../screens/IntroScreen/IntroScreen';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import CoinDetailPage from '../screens/CoinDetailPage/CoinDetailPage';
import BlinkScreen from '../screens/BlinkScreen';


export type RootStackParamList = {
  Intro: undefined;
  MainTabs: undefined;
  LoginOptions: undefined;
  CoinDetailPage : undefined;
  Blink : undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="LoginOptions"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CoinDetailPage"
        component={CoinDetailPage}
        options={{headerShown: false}}
      />
       <Stack.Screen name="Blink" component={BlinkScreen} />
    </Stack.Navigator>
  );
}
