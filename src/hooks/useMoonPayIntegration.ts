import { useEffect, useState } from 'react';
import { useMoonPaySdk } from '@moonpay/react-native-moonpay-sdk';
import { Linking } from 'react-native';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import 'react-native-url-polyfill/auto';

interface UseMoonPayOptions {
  apiKey: string;
  environment?: 'sandbox' | 'production';
}

export function useMoonPayIntegration({ apiKey, environment = 'sandbox' }: UseMoonPayOptions) {
  const { address } = useWallet();
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  try {
    // Add default configuration with necessary properties
    const config = {
      sdkConfig: {
        flow: 'buy',
        environment,
        variant: 'overlay', // Adding variant property to fix the error
        params: {
          apiKey,
          walletAddress: address,
          currencyCode: 'sol',
          baseCurrencyCode: 'usd',
          baseCurrencyAmount: 50,
          showWalletAddressForm: false,
          colorCode: '#3763FF', // Use a default color code
        },
      },
      browserOpener: {
        open: async (url: string) => {
          try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              return true;
            }
            return false;
          } catch (err) {
            console.error('Error opening URL:', err);
            return false;
          }
        },
      },
    };

    const { 
      openWithInAppBrowser, 
      generateUrlForSigning, 
      updateSignature 
    } = useMoonPaySdk(config);

    useEffect(() => {
      if (address && apiKey) {
        try {
          // In a real implementation, you would send this URL to your backend for signing
          // For now, we'll just simulate having a signature
          const urlForSigning = generateUrlForSigning();
          console.log('URL for signing:', urlForSigning);
          
          // Simulate getting a signature from backend
          // In production: fetch signature from your backend
          setTimeout(() => {
            // Note: In production, replace this with actual signature from your backend
            const mockSignature = 'mock_signature_for_testing';
            setSignature(mockSignature);
            updateSignature(mockSignature);
          }, 500);
        } catch (err) {
          console.error('Error generating URL for signing:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }, [address, apiKey, generateUrlForSigning, updateSignature]);

    const openMoonPayWidget = async () => {
      try {
        if (!signature) {
          console.warn('MoonPay signature not available yet');
          return;
        }
        
        await openWithInAppBrowser();
      } catch (err) {
        console.error('Error opening MoonPay widget:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    return {
      openMoonPayWidget,
      isReady: !!signature && !error,
      error,
    };
  } catch (err) {
    console.error('Fatal error in useMoonPayIntegration:', err);
    // Return a fallback object with safe default values
    return {
      openMoonPayWidget: async () => {
        console.error('MoonPay SDK failed to initialize');
      },
      isReady: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
} 