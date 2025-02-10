// File: src/components/TradeCard/TradeCard.tsx

import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { TransactionMode, FeeTier } from '../../state/trade/tradeSlice';

import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { sendTxWithPriorityFee } from '../../utils/priorityTx';

import { createThreadStyles, getMergedTheme } from '../thread/thread.styles';
import Icon from '../../assets/svgs/index';
import { useAuth } from '../../hooks/useAuth';

export interface TradeCardProps {
  token1: {
    avatar: any;
    name: string;
    priceUsd: string;
  };
  token2: {
    avatar: any;
    name: string;
    priceUsd: string;
    priceSol: string;
  };
  userPublicKey?: PublicKey | null;
  signTransaction?: (tx: any) => Promise<any>;
  connection?: any;
  destination?: string;
  onTradeSuccess?: (signature: string) => void;
  onTradeError?: (error: any) => void;
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: { [key: string]: object };
  userStyleSheet?: { [key: string]: object };
}

export default function TradeCard(props: TradeCardProps) {
  console.log('[TradeCard] Rendering TradeCard...');

  const {
    token1,
    token2,
    destination = '5GZJmjy3LmRXwYyNrKUB6mdijqjWM5cszSAwmND6BUV6',
    onTradeSuccess,
    onTradeError,
    themeOverrides,
    styleOverrides,
    userStyleSheet,
  } = props;

  console.log('[TradeCard] Props:', {
    token1,
    token2,
    destination,
    themeOverrides,
    styleOverrides,
    userStyleSheet,
  });

  // Get transaction mode and fee tier from Redux
  const transactionMode = useSelector<RootState, TransactionMode>(
    (state) => state.trade.transactionMode,
  );
  const feeTier = useSelector<RootState, FeeTier>(
    (state) => state.trade.feeTier,
  );
  console.log('[TradeCard] From Redux:', { transactionMode, feeTier });

  // Merge theme and styles
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(mergedTheme, styleOverrides, userStyleSheet);

  // Use the auth hook (Privy)
  const { wallet, connection } = useAuth('privy');
  console.log('[TradeCard] wallet:', wallet);
  console.log('[TradeCard] connection:', connection);

  const { publicKey: userPublicKey, signTransaction } = wallet || {};
  console.log(
    '[TradeCard] userPublicKey:',
    userPublicKey?.toBase58?.() ?? userPublicKey,
  );
  console.log('[TradeCard] signTransaction:', signTransaction);

  // Start Trade handler
  const startTradeTransaction = useCallback(async () => {
    console.log('[TradeCard] startTradeTransaction called...');
    try {
      if (!userPublicKey) {
        throw new Error('No user public key found. Make sure wallet is connected.');
      }
      if (!connection) {
        throw new Error('No connection found. Make sure your useAuth hook returns a valid connection.');
      }
      if (!signTransaction) {
        throw new Error('No signTransaction function found. Make sure your wallet provider is available.');
      }

      if (transactionMode === 'jito') {
        console.log('[TradeCard] Jito transaction mode selected...');
        throw new Error('Jito mode not yet implemented.');
      } else {
        console.log(`[TradeCard] Initiating Priority transaction with tier: ${feeTier}`);

        const lamportsToSend = 1000000; // 0.001 SOL
        console.log('[TradeCard] Creating SystemProgram.transfer instruction...');
        const ix = SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: new PublicKey(destination),
          lamports: lamportsToSend,
        });

        const instructions: TransactionInstruction[] = [ix];
        console.log('[TradeCard] Sending transaction with priority fee...');
        const signature = await sendTxWithPriorityFee(
          connection,
          signTransaction,
          userPublicKey,
          instructions,
          feeTier,
        );
        console.log('[TradeCard] Transaction successful with signature:', signature);
        onTradeSuccess?.(signature);
      }
    } catch (error) {
      console.error('[TradeCard] Trade transaction failed:', error);
      onTradeError?.(error as Error);
    }
  }, [
    userPublicKey,
    connection,
    signTransaction,
    destination,
    transactionMode,
    feeTier,
    onTradeSuccess,
    onTradeError,
  ]);

  return (
    <View style={styles.tradeCardContainer}>
      <View style={{ position: 'relative' }}>
        <View style={styles.tradeCardCombinedSides}>
          <View style={styles.tradeCardLeftSide}>
            <Image source={token1.avatar} style={styles.tradeCardTokenImage} />
            <View style={styles.tradeCardNamePriceContainer}>
              <Text style={styles.tradeCardTokenName}>{token1.name}</Text>
              <Text style={styles.tradeCardTokenPrice}>{token1.priceUsd}</Text>
            </View>
          </View>

          <View style={styles.tradeCardRightSide}>
            <Text style={styles.tradeCardSolPrice}>{token2.priceSol}</Text>
            <Text style={styles.tradeCardUsdPrice}>{token2.priceUsd}</Text>
          </View>
        </View>

        <View style={styles.tradeCardSwapIcon}>
          <Icon.SwapIcon />
        </View>

        <View style={styles.tradeCardCombinedSides}>
          <View style={styles.tradeCardLeftSide}>
            <Image source={token2.avatar} style={styles.tradeCardTokenImage} />
            <View style={styles.tradeCardNamePriceContainer}>
              <Text style={styles.tradeCardTokenName}>{token2.name}</Text>
              <Text style={styles.tradeCardTokenPrice}>{token2.priceUsd}</Text>
            </View>
          </View>

          <View style={styles.tradeCardRightSide}>
            <Text style={styles.tradeCardSolPrice}>{token2.priceSol}</Text>
            <Text style={styles.tradeCardUsdPrice}>{token2.priceUsd}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.tradeButton}
        onPress={startTradeTransaction}
        activeOpacity={0.8}
      >
        <Text style={styles.tradeButtonText}>Start Trade</Text>
      </TouchableOpacity>
    </View>
  );
}
