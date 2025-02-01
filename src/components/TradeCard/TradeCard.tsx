import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {styles} from './TradeCard.styles';
import COLORS from '../../assets/colors';
import Icon from '../../assets/svgs/index';
interface TradeCardProps {
  tokenAvatar: any;
  tokenName: string;
  tokenPriceUsdLeft: string;
  tokenPriceSolRight: string;
  tokenPriceUsdRight: string;
}

export default function TradeCard({
  tokenAvatar,
  tokenName,
  tokenPriceUsdLeft,
  tokenPriceSolRight,
  tokenPriceUsdRight,
}: TradeCardProps) {
  return (
    <View style={styles.container}>
      <View style={{position: 'relative', gap: 10}}>
        {/* First Token Row */}
        <View style={styles.combinedSides}>
          <View style={styles.leftSide}>
            <Image source={tokenAvatar} style={styles.tokenImage} />
            <View style={styles.namePriceContainer}>
              <Text style={styles.tokenName}>{tokenName}</Text>
              <Text style={styles.tokenPrice}>{tokenPriceUsdLeft}</Text>
            </View>
          </View>

          <View style={styles.rightSide}>
            <Text style={styles.solPrice}>{tokenPriceSolRight}</Text>
            <Text style={styles.usdPrice}>{tokenPriceUsdRight}</Text>
          </View>
        </View>

        {/* Swap Icon (Centered) */}
        <View style={styles.swapIcon}>
          <Icon.SwapIcon />
        </View>

        {/* Second Token Row */}
        <View style={styles.combinedSides}>
          <View style={styles.leftSide}>
            <Image source={tokenAvatar} style={styles.tokenImage} />
            <View style={styles.namePriceContainer}>
              <Text style={styles.tokenName}>{tokenName}</Text>
              <Text style={styles.tokenPrice}>{tokenPriceUsdLeft}</Text>
            </View>
          </View>

          <View style={styles.rightSide}>
            <Text style={styles.solPrice}>{tokenPriceSolRight}</Text>
            <Text style={styles.usdPrice}>{tokenPriceUsdRight}</Text>
          </View>
        </View>
      </View>

      {/* Full-width "copy trade" button */}
      <TouchableOpacity style={styles.copyButton}>
        <Text style={styles.copyButtonText}>copy trade</Text>
      </TouchableOpacity>
    </View>
  );
}
