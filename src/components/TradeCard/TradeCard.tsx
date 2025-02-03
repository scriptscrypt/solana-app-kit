import React from 'react';
import {View, Text, Image} from 'react-native';
import {createThreadStyles, getMergedTheme} from '../thread/thread.styles';
import Icon from '../../assets/svgs/index';

interface TradeCardProps {
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
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
  userStyleSheet?: {[key: string]: object};
}

export default function TradeCard({
  token1,
  token2,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
}: TradeCardProps) {
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides,
    userStyleSheet,
  );

  return (
    <View style={styles.tradeCardContainer}>
      <View style={{position: 'relative'}}>
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

        {/* Swap Icon (Centered) */}
        <View style={styles.tradeCardSwapIcon}>
          <Icon.SwapIcon />
        </View>

        {/* Second Token Row */}
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
    </View>
  );
}
