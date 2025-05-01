import { NavigatorScreenParams } from '@react-navigation/native';

// Define the root stack param list
export type RootStackParamList = {
  // Add existing screens here
  Home: undefined;
  Wallet: undefined;
  OnrampScreen: undefined;
  // Add other screens as needed
};

// Declare the navigation type to use in your components
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 