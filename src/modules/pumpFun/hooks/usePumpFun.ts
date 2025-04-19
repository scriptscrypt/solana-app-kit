// File: src/modules/pumpFun/hooks/usePumpFun.ts

import {useCallback} from 'react';
import {Alert} from 'react-native';
import {useWallet} from '../../walletProviders/hooks/useWallet';
import {
  buyTokenViaPumpfun,
  sellTokenViaPumpfun,
  createAndBuyTokenViaPumpfun,
} from '../services/pumpfunService';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';
import { PumpfunBuyParams, PumpfunSellParams, PumpfunLaunchParams } from '../types';
import { useAuth } from '../../walletProviders/hooks/useAuth';
import { verifyToken, VerifyTokenParams } from '../../../services/rugCheckService';

/**
 * Hook for interacting with Pump.fun platform
 * @returns Methods for buying, selling, and launching tokens on Pump.fun
 */
export function usePumpFun() {
  const {wallet, solanaWallet} = useAuth();
  // Also use the new useWallet hook which provides standard transaction methods
  const {publicKey, address, connected} = useWallet();
  
  console.log("[usePumpFun] Wallet:", {
    hasWallet: !!wallet,
    hasLegacyWallet: !!solanaWallet,
    walletType: wallet?.provider || 'none',
    publicKey: wallet?.publicKey || solanaWallet?.wallets?.[0]?.publicKey || 'none',
    connected
  });

  /**
   * Buy a token on Pump.fun
   * @param params Parameters for the token purchase 
   */
  const buyToken = useCallback(
    async ({
      tokenAddress,
      solAmount,
      onStatusUpdate,
    }: {
      tokenAddress: string;
      solAmount: number;
      onStatusUpdate?: (status: string) => void;
    }) => {
      // Use the best available wallet - prefer StandardWallet
      const availableWallet = wallet || solanaWallet;
      
      if (!availableWallet) {
        Alert.alert('Error', 'No Solana wallet found. Please connect first.');
        return;
      }
      try {
        console.log('[usePumpfun.buyToken] Attempting to buy token:', {
          tokenAddress,
          solAmount,
          walletProvider: wallet?.provider || 'privy' // Default to privy for legacy wallet
        });
        
        onStatusUpdate?.('Preparing buy transaction...');
        
        const buyParams: PumpfunBuyParams = {
          buyerPublicKey: address || solanaWallet?.wallets?.[0]?.publicKey || '',
          tokenAddress,
          solAmount,
          solanaWallet: availableWallet,
          onStatusUpdate,
        };
        
        const txSignature = await buyTokenViaPumpfun(buyParams);
        
        // Show success notification via TransactionService
        TransactionService.showSuccess(txSignature, 'token');
      } catch (error: any) {
        console.error('[usePumpfun.buyToken] Error:', error);
        // Show error notification via TransactionService
        TransactionService.showError(error);
        throw error; // Re-throw for component-level handling
      }
    },
    [wallet, solanaWallet, address],
  );

  /**
   * Sell a token on Pump.fun
   * @param params Parameters for the token sale
   */
  const sellToken = useCallback(
    async ({
      tokenAddress,
      tokenAmount,
      onStatusUpdate,
    }: {
      tokenAddress: string;
      tokenAmount: number;
      onStatusUpdate?: (status: string) => void;
    }) => {
      // Use the best available wallet - prefer StandardWallet
      const availableWallet = wallet || solanaWallet;
      
      if (!availableWallet) {
        Alert.alert('Error', 'No Solana wallet found. Please connect first.');
        return;
      }
      try {
        console.log('[usePumpfun.sellToken] Attempting to sell token:', {
          tokenAddress,
          tokenAmount,
          walletProvider: wallet?.provider || 'privy' // Default to privy for legacy wallet
        });
        
        onStatusUpdate?.('Preparing sell transaction...');
        
        const sellParams: PumpfunSellParams = {
          sellerPublicKey: address || solanaWallet?.wallets?.[0]?.publicKey || '',
          tokenAddress,
          tokenAmount,
          solanaWallet: availableWallet,
          onStatusUpdate,
        };
        
        const txSignature = await sellTokenViaPumpfun(sellParams);
        
        // Show success notification via TransactionService
        TransactionService.showSuccess(txSignature, 'token');
      } catch (error: any) {
        console.error('[usePumpfun.sellToken] Error:', error);
        // Show error notification via TransactionService
        TransactionService.showError(error);
        throw error; // Re-throw for component-level handling
      }
    },
    [wallet, solanaWallet, address],
  );

  /**
   * Submit token for verification on RugCheck
   * @param tokenMint The token mint address to verify
   * @param description Token description
   * @param links Social links object
   * @param dataIntegrityAccepted Whether data integrity is accepted
   * @param termsAccepted Whether terms are accepted
   * @returns Success status
   */
  const submitTokenForVerification = useCallback(
    async (
      tokenMint: string,
      description: string,
      links: { [key: string]: string } = {},
      dataIntegrityAccepted: boolean = true,
      termsAccepted: boolean = true,
      onStatusUpdate?: (status: string) => void
    ) => {
      try {
        onStatusUpdate?.('Preparing token verification...');
        
        // Current user's wallet info
        const userPublicKey = address || solanaWallet?.wallets?.[0]?.publicKey || '';
        if (!userPublicKey) {
          throw new Error('No wallet public key available for verification');
        }
        
        // We need a signature for verification
        // In a production app, this would be handled properly with signing
        // For this demo, we'll use a placeholder
        const signature = 'PLACEHOLDER_SIGNATURE';
        
        const verifyParams: VerifyTokenParams = {
          mint: tokenMint,
          payer: userPublicKey,
          signature: signature,
          data: {
            description,
            dataIntegrityAccepted,
            termsAccepted,
            links
          }
        };
        
        onStatusUpdate?.('Submitting token verification...');
        
        const result = await verifyToken(verifyParams);
        
        if (result && result.ok) {
          onStatusUpdate?.('Token verification submitted successfully!');
          return true;
        } else {
          onStatusUpdate?.('Token verification failed');
          return false;
        }
      } catch (error) {
        console.error('[usePumpfun.submitTokenForVerification] Error:', error);
        onStatusUpdate?.('Token verification failed');
        return false;
      }
    },
    [address, solanaWallet]
  );

  /**
   * Launch a new token on Pump.fun
   * @param params Parameters for the token launch
   */
  const launchToken = useCallback(
    async ({
      tokenName,
      tokenSymbol,
      description = '',
      twitter = '',
      telegram = '',
      website = '',
      imageUri,
      solAmount,
      verifyToken = false,
      dataIntegrityAccepted = false,
      termsAccepted = false,
      onStatusUpdate,
    }: {
      tokenName: string;
      tokenSymbol: string;
      description?: string;
      twitter?: string;
      telegram?: string;
      website?: string;
      imageUri: string;
      solAmount: number;
      verifyToken?: boolean;
      dataIntegrityAccepted?: boolean;
      termsAccepted?: boolean;
      onStatusUpdate?: (status: string) => void;
    }) => {
      // Use the best available wallet - prefer StandardWallet
      const availableWallet = wallet || solanaWallet;
      
      if (!availableWallet) {
        Alert.alert('Error', 'No Solana wallet found. Please connect first.');
        return;
      }
      
      // Use the best available address
      const userPublicKey = address || solanaWallet?.wallets?.[0]?.publicKey || '';
      
      try {
        console.log('[usePumpfun.launchToken] Creating + Buying token:', {
          tokenName,
          tokenSymbol,
          description,
          twitter,
          telegram,
          website,
          imageUri,
          solAmount,
          verifyToken,
          walletProvider: wallet?.provider || 'privy' // Default to privy for legacy wallet
        });
        
        onStatusUpdate?.('Preparing token launch...');
        
        const launchParams: PumpfunLaunchParams = {
          userPublicKey,
          tokenName,
          tokenSymbol,
          description,
          twitter,
          telegram,
          website,
          imageUri,
          solAmount,
          solanaWallet: availableWallet,
          onStatusUpdate,
          verifyToken,
          dataIntegrityAccepted,
          termsAccepted
        };
        
        const result = await createAndBuyTokenViaPumpfun(launchParams);
        
        if (result) {
          // Show success notification via TransactionService
          TransactionService.showSuccess(result.txSignature, 'token');
          
          // If verification was requested, submit the token for verification
          if (verifyToken && dataIntegrityAccepted && termsAccepted) {
            onStatusUpdate?.('Token launched, submitting for verification...');
            
            // Prepare social links for verification
            const links: { [key: string]: string } = {};
            if (website) links.website = website;
            if (twitter) links.twitter = twitter;
            if (telegram) links.telegram = telegram;
            
            // Submit the token for verification
            await submitTokenForVerification(
              result.mint,
              description,
              links,
              dataIntegrityAccepted,
              termsAccepted,
              onStatusUpdate
            );
          }
          
          return result;
        }
      } catch (error: any) {
        console.error('[usePumpfun.launchToken] Error:', error);
        // Show error notification via TransactionService
        TransactionService.showError(error);
        throw error; // Re-throw for component-level handling
      }
    },
    [wallet, solanaWallet, address, submitTokenForVerification],
  );

  return {
    buyToken,
    sellToken,
    launchToken,
    submitTokenForVerification,
  };
}
