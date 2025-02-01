import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FeedScreen from '../screens/FeedScreen/FeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import Icons from '../assets/svgs';

import type {MainTabParamList} from '../hooks/useAppNavigation';

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
          tabBarIcon: ({color, size}) => (
            <Icons.HomeIcon
              width={size * 1.4}
              height={size * 1.4}
              stroke={color}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icons.ExploreIcon
              width={size * 1.4}
              height={size * 1.4}
              stroke={color}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icons.FeedIcon
              width={size * 1.4}
              height={size * 1.4}
              stroke={color}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icons.NotifIcon
              width={size * 1.4}
              height={size * 1.4}
              stroke={color}
              fill="none"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icons.ProfileIcon
              width={size * 1.4}
              height={size * 1.4}
              stroke={color}
              fill="none"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
