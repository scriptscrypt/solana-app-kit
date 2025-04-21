import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

interface NFTData {
  id: string;
  name: string;
  description?: string;
  image: string;
  collectionName?: string;
  mintAddress?: string;
}

interface MessageNFTProps {
  nftData: NFTData;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

function MessageNFT({ nftData, isCurrentUser, onPress }: MessageNFTProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <IPFSAwareImage
          source={getValidImageSource(nftData.image)}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.nftName} numberOfLines={1} ellipsizeMode="tail">
            {nftData.name}
          </Text>
          <View style={styles.verifiedBadge} />
        </View>
        
        {nftData.collectionName && (
          <Text style={styles.collectionName} numberOfLines={1}>
            {nftData.collectionName}
          </Text>
        )}
        
        {nftData.description && (
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {nftData.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.mintText}>Mint</Text>
          <Text style={styles.mintAddress} numberOfLines={1} ellipsizeMode="middle">
            {nftData.mintAddress || 'Unknown address'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '85%',
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.darkerBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nftName: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.brandBlue,
  },
  collectionName: {
    color: COLORS.brandBlue,
    fontSize: TYPOGRAPHY.size.sm,
    marginBottom: 6,
  },
  description: {
    color: COLORS.greyMid,
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mintText: {
    color: COLORS.greyMid,
    fontSize: TYPOGRAPHY.size.xs,
    marginRight: 6,
  },
  mintAddress: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    flex: 1,
  },
});

export default MessageNFT; 