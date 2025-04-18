import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../modules/walletProviders/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { styles } from './Modules.styles';

const sections = [
  {
    key: 'pumpfun',
    title: 'Pump Fun Screen',
    description:
      'Manage tokens, view balances, and execute buy/sell/swap actions seamlessly.',
    backgroundColor: '#C8E6C9', // light green
    navigateTo: 'Pumpfun',
  },
  {
    key: 'pumpswap',
    title: 'Pump Swap',
    description:
      'Swap tokens, add/remove liquidity, and create pools on the Solana blockchain.',
    backgroundColor: '#BBDEFB', // light blue
    navigateTo: 'PumpSwap',
  },
  {
    key: 'tokenmill',
    title: 'Token Mill',
    description:
      'Create and manage token markets, stake tokens, and design bonding curves.',
    backgroundColor: '#FFE0B2', // light orange
    navigateTo: 'TokenMill',
  },
  {
    key: 'nft',
    title: 'NFT Screen',
    description:
      'Browse, buy, and sell NFTs with integrated wallet support and listing functionality.',
    backgroundColor: '#E1BEE7', // light purple
    navigateTo: 'NftScreen',
  },
];

// Define additional Android-specific styles
const androidStyles = StyleSheet.create({
  safeArea: {
    paddingTop: 30,
  },
  loggingOutContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  loggingOutText: {
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  }
});

export default function ModuleScreen() {
  // State to track logout process
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Get the auth object and navigation
  const auth = useAuth();
  const navigation = useNavigation();

  // Safely extract logout function
  const logout = auth?.logout || (() => Promise.resolve());

  // Create a safe logout handler
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    try {
      setIsLoggingOut(true);
      console.log('Logging out...');
      
      // Use setTimeout to ensure state update is processed before logout
      setTimeout(async () => {
        try {
          await logout();
          console.log('Logout successful');
        } catch (error) {
          console.error('Error during logout:', error);
          Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
        } finally {
          // Keep this state true - we don't need to reset it as the component
          // will be unmounted during navigation changes
        }
      }, 100);
    } catch (error) {
      console.error('Error initiating logout:', error);
      setIsLoggingOut(false);
    }
  }, [logout, isLoggingOut]);

  const handlePress = useCallback((section: any) => {
    if (section.navigateTo && !isLoggingOut) {
      navigation.navigate(section.navigateTo as never);
    }
  }, [navigation, isLoggingOut]);

  // Render a loading overlay during logout
  const renderLoggingOutOverlay = () => {
    if (!isLoggingOut) return null;
    
    return (
      <View style={androidStyles.loggingOutContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={androidStyles.loggingOutText}>Logging out...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        Platform.OS === 'android' && androidStyles.safeArea,
      ]}>
      {renderLoggingOutOverlay()}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
          disabled={isLoggingOut}>
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {sections.map(section => (
          <View
            key={section.key}
            style={[styles.card, { backgroundColor: section.backgroundColor }]}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handlePress(section)}
              disabled={isLoggingOut}>
              <Text
                style={styles.cardButtonText}>{`Go to ${section.title}`}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
