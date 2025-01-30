import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FeedScreen from '../screens/FeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeIcon from '../assets/svgs/Home idle.svg';
import SearchIcon from '../assets/svgs/Explore idle.svg';
import FeedIcon from '../assets/svgs/Frame 22.svg';
import NotificationIcon from '../assets/svgs/Notif idle.svg';
import ProfileIcon from '../assets/svgs/Profile idle v2.svg';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Feed: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'lightgray',
      }}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon width={size * 1.4} height={size * 1.4} stroke={color} fill="none" />
          ),
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SearchIcon width={size * 1.4} height={size * 1.4} stroke={color} fill="none" />
          ),
        }} 
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FeedIcon width={size * 1.4} height={size * 1.4} stroke={color} fill="none" />
          ),
        }} 
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <NotificationIcon width={size * 1.4} height={size * 1.4} stroke={color} fill="none" />
          ),
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon width={size * 1.4} height={size * 1.4} stroke={color} fill="none" />
          ),
        }} 
      />
    </Tab.Navigator>
  );
}
