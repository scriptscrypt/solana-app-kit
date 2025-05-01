import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import AppHeader from '@/core/sharedUI/AppHeader';
import MoonPayWidget from '@/components/MoonPayWidget/MoonPayWidget';
import COLORS from '@/assets/colors';

// Replace with your actual MoonPay API key
const MOONPAY_API_KEY = 'pk_test_key'; // Use your real API key in production

/**
 * OnrampScreen component for adding funds via MoonPay
 */
function OnrampScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleWidgetOpen = () => {
    console.log('MoonPay widget opened');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AppHeader 
        title="Add Funds" 
        onBackPress={() => navigation.goBack()}
        showDefaultRightIcons={false}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }
        ]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Funds</Text>
          <Text style={styles.description}>
            Purchase SOL directly with your credit/debit card or bank transfer through MoonPay.
          </Text>
        </View>
        
        <View style={styles.widgetContainer}>
          <MoonPayWidget
            apiKey={MOONPAY_API_KEY}
            environment="sandbox" // Change to 'production' for live app
            onOpen={handleWidgetOpen}
            buttonLabel="Buy SOL with MoonPay"
          />
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About MoonPay</Text>
          <Text style={styles.infoText}>
            MoonPay is a financial technology company that builds payments infrastructure for crypto. 
            Our on-and-off-ramp suite of products provides a seamless experience for converting between 
            fiat currencies and cryptocurrencies.
          </Text>
          
          <Text style={styles.disclaimerText}>
            Note: Additional fees may apply. MoonPay services are subject to their terms of service 
            and may not be available in all regions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#121212',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.greyLight || '#bbbbbb',
    lineHeight: 24,
  },
  widgetContainer: {
    backgroundColor: COLORS.greyDark || '#222222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: COLORS.greyDark || '#222222',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.greyLight || '#bbbbbb',
    lineHeight: 22,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.greyMid || '#888888',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default OnrampScreen; 