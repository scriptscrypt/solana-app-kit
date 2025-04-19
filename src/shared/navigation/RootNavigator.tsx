import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import MainTabs from './MainTabs';
import CoinDetailPage from '@/screens/SampleUI/Threads/CoinDetailPage/CoinDetailPage';
import { PumpfunScreen, PumpSwapScreen } from '@/modules/pumpFun';
import { TokenMillScreen } from '@/modules/tokenMill';
import { NftScreen } from '@/modules/nft';
import ChatScreen from '@/screens/SampleUI/Chat/ChatScreen/ChatScreen';
import OtherProfileScreen from '@/screens/SampleUI/Threads/OtherProfileScreen/OtherProfileScreen';
import PostThreadScreen from '@/screens/SampleUI/Threads/PostThreadScreen/PostthreadScreen';
import FollowersFollowingListScreen from '@/core/profile/components/FollowersFollowingListScreen/FollowersFollowingListScreen';
import ProfileScreen from '@/screens/SampleUI/Threads/ProfileScreen/ProfileScreen';
import IntroScreen from '@/screens/Common/IntroScreen/IntroScreen';
import LoginScreen from '@/screens/Common/LoginScreen/LoginScreen';
import { MercuroScreen } from '@/modules/mercuro';

export type RootStackParamList = {
  IntroScreen: undefined;
  LoginOptions: undefined;
  MainTabs: undefined;
  CoinDetailPage: undefined;
  Blink: undefined;
  Pumpfun: undefined;
  TokenMill: undefined;
  NftScreen: undefined;
  ChatScreen: undefined;
  PumpSwap: undefined;
  MercuroScreen: undefined;
  // NEW ROUTE
  OtherProfile: { userId: string };
  PostThread: { postId: string };
  FollowersFollowingList: undefined;
  ProfileScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  useEffect(() => {
    console.log(`[RootNavigator] isLoggedIn state changed: ${isLoggedIn}`);
  }, [isLoggedIn]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CoinDetailPage" component={CoinDetailPage} />
          <Stack.Screen name="Pumpfun" component={PumpfunScreen} />
          <Stack.Screen name="TokenMill" component={TokenMillScreen} />
          <Stack.Screen name="NftScreen" component={NftScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="PumpSwap" component={PumpSwapScreen} />
          <Stack.Screen name="MercuroScreen" component={MercuroScreen} />

          {/* NEW SCREEN for viewing other user's profile */}
          <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
          <Stack.Screen name="PostThread" component={PostThreadScreen} />
          <Stack.Screen
            name="FollowersFollowingList"
            component={FollowersFollowingListScreen}
            options={{ title: '' }} // or "Followers / Following"
          />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="IntroScreen" component={IntroScreen} />
          <Stack.Screen name="LoginOptions" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </>
      )}
    </Stack.Navigator>
  );
}
