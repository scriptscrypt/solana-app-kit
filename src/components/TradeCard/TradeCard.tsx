import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {styles} from './TradeCard.styles';

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
      {/* Left side: circular token image, name, price below */}
      <View style={styles.leftSide}>
        <Image source={tokenAvatar} style={styles.tokenImage} />
        <View style={styles.namePriceContainer}>
          <Text style={styles.tokenName}>{tokenName}</Text>
          <Text style={styles.tokenPrice}>{tokenPriceUsdLeft}</Text>
        </View>
      </View>

      {/* Right side: top sol price, bottom usd price */}
      <View style={styles.rightSide}>
        <Text style={styles.solPrice}>{tokenPriceSolRight}</Text>
        <Text style={styles.usdPrice}>{tokenPriceUsdRight}</Text>
      </View>

      {/* Full-width "copy trade" button */}
      <TouchableOpacity style={styles.copyButton}>
        <Text style={styles.copyButtonText}>copy trade</Text>
      </TouchableOpacity>
    </View>
  );
}
