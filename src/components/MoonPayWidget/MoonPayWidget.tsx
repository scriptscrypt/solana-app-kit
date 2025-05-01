import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMoonPayIntegration } from '@/hooks/useMoonPayIntegration';
import COLORS from '@/assets/colors';

interface MoonPayWidgetProps {
  /**
   * MoonPay API key
   */
  apiKey: string;
  
  /**
   * Environment to use for MoonPay
   */
  environment?: 'sandbox' | 'production';
  
  /**
   * Called when widget is opened
   */
  onOpen?: () => void;
  
  /**
   * Button label
   */
  buttonLabel?: string;
}

/**
 * MoonPay widget component for adding funds
 */
function MoonPayWidget({
  apiKey,
  environment = 'sandbox',
  onOpen,
  buttonLabel = 'Add Funds with MoonPay',
}: MoonPayWidgetProps) {
  try {
    const { openMoonPayWidget, isReady, error } = useMoonPayIntegration({
      apiKey,
      environment,
    });

    const handleOpenWidget = async () => {
      await openMoonPayWidget();
      if (onOpen) {
        onOpen();
      }
    };

    // Handle error state
    if (error) {
      return (
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.button, styles.buttonDisabled]}
            disabled={true}
          >
            <Text style={styles.buttonText}>MoonPay not available</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>
            There was an error initializing MoonPay. Please try again later.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            !isReady && styles.buttonDisabled
          ]}
          onPress={handleOpenWidget}
          disabled={!isReady}
        >
          {!isReady ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.loadingText}>Initializing...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  } catch (error) {
    console.error('Error rendering MoonPayWidget:', error);
    // Fallback UI in case of error
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.buttonDisabled]}
          disabled={true}
        >
          <Text style={styles.buttonText}>MoonPay not available</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>
          There was an error initializing MoonPay. Please try again later.
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginLeft: 8,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.greyLight || '#bbbbbb',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default MoonPayWidget; 