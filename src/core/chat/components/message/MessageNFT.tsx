import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { buyNft, buyCollectionFloor } from '@/modules/nft';
import { TransactionService } from '@/modules/walletProviders/services/transaction/transactionService';
import TokenDetailsDrawer from '@/core/sharedUI/TokenDetailsDrawer/TokenDetailsDrawer';
// Import the shared NFTData interface
import { NFTData } from './message.types';

// Removed local interface definitions (NFTAttribute, NFTListing, NFTLastSale, CollectionStats, NFTData)
// They are now imported from message.types.ts

interface MessageNFTProps {
  nftData: NFTData;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

function MessageNFT({ nftData, isCurrentUser, onPress }: MessageNFTProps) {
  // Add a hover/press effect state
  const [isPressed, setIsPressed] = useState(false);

  // NFT buying states
  const [nftLoading, setNftLoading] = useState(false);
  const [nftStatusMsg, setNftStatusMsg] = useState('');
  const [nftConfirmationVisible, setNftConfirmationVisible] = useState(false);
  const [nftConfirmationMsg, setNftConfirmationMsg] = useState('');
  const [loadingFloor, setLoadingFloor] = useState(false);

  // Token Details Drawer states
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedTokenMint, setSelectedTokenMint] = useState<string | null>(null);

  const { wallet, address, publicKey, sendTransaction } = useWallet();

  // Determine if this is a collection or a specific NFT early on
  const isCollection = !!(nftData.isCollection && nftData.collId);
  const displayMint = isCollection ? nftData.collId : nftData.mintAddress;

  // Handle press with visual feedback and open drawer
  const handleCardPress = () => {
    console.log('[MessageNFT] Card pressed. Opening Token Details Drawer...');
    setIsPressed(true);
    // Reset press state after short delay
    setTimeout(() => setIsPressed(false), 150);

    if (displayMint) {
      setSelectedTokenMint(displayMint);
      setIsDrawerVisible(true);
    } else {
      console.warn('[MessageNFT] Cannot open drawer: No mint address or collection ID found.');
      Alert.alert('Error', 'Cannot display details for this item.');
    }

    // Call the original onPress handler if provided
    if (onPress) onPress();
  };

  /**
   * Handles the NFT purchase process
   */
  const handleBuyNft = async () => {
    if (!nftData.mintAddress) {
      Alert.alert('Error', 'No NFT mint address available.');
      return;
    }

    if (!publicKey || !address) {
      Alert.alert('Error', 'Wallet not connected.');
      return;
    }

    try {
      setNftLoading(true);
      setNftStatusMsg('Preparing buy transaction...');

      // Since we don't have owner and price in the NFT data, we'll use simple parameters
      // In a real app, you would get these from the NFT marketplace API
      const estimatedPrice = 0.1; // Example price in SOL
      const owner = ""; // Example owner address

      const signature = await buyNft(
        address,
        nftData.mintAddress,
        estimatedPrice,
        owner,
        sendTransaction,
        status => setNftStatusMsg(status)
      );

      setNftConfirmationMsg('NFT purchased successfully!');
      setNftConfirmationVisible(true);

      // Show success notification
      TransactionService.showSuccess(signature, 'nft');
    } catch (err: any) {
      console.error('Error during buy transaction:', err);
      // Show error notification
      TransactionService.showError(err);
    } finally {
      setNftLoading(false);
      setNftStatusMsg('');
    }
  };

  /**
   * Handles buying the floor NFT from a collection
   */
  const handleBuyCollectionFloor = async () => {
    if (!nftData.collId) { // Check collId directly
      Alert.alert('Error', 'No collection ID available.');
      return;
    }

    if (!publicKey || !address) {
      Alert.alert('Error', 'Wallet not connected.');
      return;
    }

    try {
      setLoadingFloor(true);
      setNftLoading(true);
      setNftStatusMsg('Fetching collection floor...');

      const signature = await buyCollectionFloor(
        address,
        nftData.collId,
        sendTransaction,
        status => setNftStatusMsg(status)
      );

      setNftConfirmationMsg(`Successfully purchased floor NFT from ${nftData.collectionName || nftData.name || 'Collection'} collection!`);
      setNftConfirmationVisible(true);

      // Show success notification
      TransactionService.showSuccess(signature, 'nft');
    } catch (err: any) {
      console.error('Error during buy transaction:', err);
      TransactionService.showError(err);
    } finally {
      setNftLoading(false);
      setLoadingFloor(false);
      setNftStatusMsg('');
    }
  };

  // Set CTA label based on type
  let ctaLabel = isCollection ? 'Buy Floor NFT' : 'Buy NFT';
  // Set CTA action based on type
  const onCtaPress = isCollection ? handleBuyCollectionFloor : handleBuyNft;

  // Prepare initial data for the drawer
  const drawerInitialData = {
    name: nftData.name,
    logoURI: nftData.image, // Use NFT image as logoURI
    isCollection: isCollection,
    // Pass relevant data based on type
    collectionData: isCollection ? {
      // Basic
      name: nftData.collectionName || nftData.name,
      description: nftData.description,
      // Detailed
      slugDisplay: nftData.slugDisplay,
      slugMe: nftData.slugMe,
      stats: nftData.stats,
      tokenCount: nftData.tokenCount || nftData.numMints, // Pass either
      numMints: nftData.numMints, // Also pass numMints if available
      tensorVerified: nftData.tensorVerified,
      discord: nftData.discord,
      twitter: nftData.twitter,
      website: nftData.website,
      // Pass floor price directly if available at top level too
      floorPrice: nftData.stats?.floorPrice,
    } : undefined,
    nftData: !isCollection ? {
      // Basic
      description: nftData.description,
      collName: nftData.collectionName,
      name: nftData.name, // Pass name here too if needed by drawer
      // Detailed
      owner: nftData.owner,
      rarityRankTN: nftData.rarityRankTN,
      numMints: nftData.numMints, // For rarity context
      attributes: nftData.attributes,
      listing: nftData.listing,
      lastSale: nftData.lastSale,
    } : undefined,
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      isPressed && styles.pressedContainer
    ]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCardPress}
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
            {isCollection ? (
              <Text style={styles.collectionText}>Collection ID</Text>
            ) : (
              <Text style={styles.mintText}>Mint</Text>
            )}
            <Text style={styles.mintAddress} numberOfLines={1} ellipsizeMode="middle">
              {displayMint || 'Unknown address'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[
            styles.buyButton,
            (nftLoading || loadingFloor) && styles.disabledButton
          ]}
          onPress={onCtaPress}
          disabled={nftLoading || loadingFloor}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>
            {loadingFloor ? 'Finding Floor...' : ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={nftLoading}
        transparent
        animationType="fade"
        onRequestClose={() => { /* Prevent closing while loading */ }}>
        <View style={styles.progressOverlay}>
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={COLORS.brandBlue} />
            {!!nftStatusMsg && (
              <Text style={styles.progressText}>{nftStatusMsg}</Text>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={nftConfirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNftConfirmationVisible(false)}>
        <View style={styles.progressOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>{nftConfirmationMsg}</Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setNftConfirmationVisible(false)}>
              <Text style={styles.confirmButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedTokenMint && (
        <TokenDetailsDrawer
          visible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
          tokenMint={selectedTokenMint}
          initialData={drawerInitialData}
          loading={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
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
  pressedContainer: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
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
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    fontSize: TYPOGRAPHY.size.lg,
    flex: 1,
    marginRight: 8,
    fontFamily: TYPOGRAPHY.fontFamily,
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
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  description: {
    color: COLORS.greyMid,
    fontSize: TYPOGRAPHY.size.sm,
    marginBottom: 8,
    fontFamily: TYPOGRAPHY.fontFamily,
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
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  collectionText: {
    color: COLORS.greyMid,
    fontSize: TYPOGRAPHY.size.xs,
    marginRight: 6,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  mintAddress: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  ctaContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDarkColor,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  progressOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: COLORS.lighterBackground,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  progressText: {
    color: COLORS.white,
    marginTop: 10,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  confirmContainer: {
    backgroundColor: COLORS.lighterBackground,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  confirmButton: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default MessageNFT; 