import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DexScreen from '../screens/DexScreen';
import ProfileScreen from '../screens/PresaleScreen';
import TrendingScreen from '../screens/TrendingScreen';

export type BottomTabParamList = {
  Dex: undefined;
  Trending: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="Dex">
      <Tab.Screen name="Dex" component={DexScreen} />
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
