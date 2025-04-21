import React from 'react';
import { View, StyleSheet } from 'react-native';
import TradeCard, { TradeData } from '@/core/sharedUI/TradeCard/TradeCard';
import { DEFAULT_IMAGES } from '@/config/constants';
import COLORS from '@/assets/colors';

interface MessageTradeCardProps {
  tradeData: TradeData;
  userAvatar?: any;
  isCurrentUser?: boolean;
}

function MessageTradeCard({ tradeData, userAvatar, isCurrentUser }: MessageTradeCardProps) {
  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      <TradeCard
        tradeData={tradeData}
        showGraphForOutputToken={true}
        userAvatar={userAvatar}
        styleOverrides={{
          tradeCardContainer: {
            backgroundColor: COLORS.lighterBackground,
            borderColor: COLORS.borderDarkColor,
            borderWidth: 1,
            borderRadius: 16,
            width: '100%',
            padding: 10,
          },
          chartContainer: {
            backgroundColor: 'transparent',
          },
          timeframeButton: {
            backgroundColor: COLORS.darkerBackground,
          },
          timeframeButtonActive: {
            backgroundColor: COLORS.brandBlue,
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  }
});

export default MessageTradeCard; 