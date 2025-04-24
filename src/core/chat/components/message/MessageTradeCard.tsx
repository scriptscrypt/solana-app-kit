import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import TradeCard, { TradeData } from '@/core/sharedUI/TradeCard/TradeCard';
import COLORS from '@/assets/colors';
import TradeModal from '@/core/thread/components/trade/ShareTradeModal';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { DEFAULT_IMAGES } from '@/config/constants';
import { ThreadUser } from '@/core/thread/components/thread.types';

interface MessageTradeCardProps {
  tradeData: TradeData;
  userAvatar?: any;
  isCurrentUser?: boolean;
}

function MessageTradeCard({ tradeData, userAvatar, isCurrentUser }: MessageTradeCardProps) {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const storedProfilePic = useAppSelector(state => state.auth.profilePicUrl);
  const userName = useAppSelector(state => state.auth.username);
  const { address } = useWallet();

  const userPublicKey = address || null;
  const currentUser: ThreadUser = {
    id: userPublicKey || 'anonymous-user',
    username: userName || 'Anonymous',
    handle: userPublicKey
      ? '@' + userPublicKey.slice(0, 6) + '...' + userPublicKey.slice(-4)
      : '@anonymous',
    verified: true,
    avatar: storedProfilePic ? { uri: storedProfilePic } : DEFAULT_IMAGES.user,
  };

  const handleOpenTradeModal = () => {
    setShowTradeModal(true);
  };

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
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleOpenTradeModal}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonLabel}>Copy Trade</Text>
      </TouchableOpacity>

      <TradeModal
        visible={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        currentUser={currentUser}
        initialActiveTab="PAST_SWAPS"
        initialInputToken={{ address: tradeData.inputMint }}
        initialOutputToken={{ address: tradeData.outputMint }}
        onShare={() => {
          setShowTradeModal(false);
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
  },
  ctaButton: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginHorizontal: 10,
  },
  ctaButtonLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default MessageTradeCard; 