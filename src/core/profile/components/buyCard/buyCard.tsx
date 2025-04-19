import React, { useState, useMemo } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  Platform,
  ImageStyle,
} from 'react-native';
import { styles } from './buyCard.style';
import Icons from '../../../../assets/svgs/index';
import { DEFAULT_IMAGES } from '../../../../config/constants';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

import { useFetchPortfolio, fixImageUrl } from '@/modules/dataModule/hooks/useFetchTokens';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import TradeModal from '../../../thread/components/trade/TradeModal';
import TokenDetailsDrawer from '@/core/sharedUI/TokenDetailsDrawer/TokenDetailsDrawer';

// Import collection search functionality
import { searchCollections } from '@/modules/nft/services/nftService';
import { CollectionResult } from '@/modules/nft/types';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { useAuth } from '@/modules/walletProviders/hooks/useAuth';
import { AssetItem } from '@/modules/dataModule/types/assetTypes';
import NFTCollectionDrawer from '@/core/sharedUI/NFTCollectionDrawer/NFTCollectionDrawer';

/**
 * Define props for the BuyCard
 */
export interface BuyCardProps {
  /** The name (symbol) of the token to buy (e.g. "$YASH"). */
  tokenName?: string;
  /** A short "title" or default text under the name (e.g. "Sanctum Creator Coin"). */
  description?: string;
  /**
   * The token's main image. This can be:
   *  - A local require(...) asset
   *  - A remote URL string
   *  - Or null/undefined
   */
  tokenImage?: any;
  /**
   * Additional user-provided description or text you want to display,
   * e.g. "This is a custom user description"
   */
  tokenDesc?: string;
  /** The mint address of the token (optional). */
  tokenMint?: string;
  /** Callback triggered when user taps the "Buy" button. */
  onBuyPress?: () => void;
  /** Optional style overrides for the container. */
  containerStyle?: object;

  /**
   * Whether to show the down arrow. If true, we render the arrow
   * that calls `onArrowPress` when tapped.
   */
  showDownArrow?: boolean;

  /**
   * Called when the down arrow is pressed (e.g. open a modal).
   */
  onArrowPress?: () => void;

  /**
   * Optional wallet address to show portfolio for.
   * If not provided, will use connected wallet.
   */
  walletAddress?: string;

  /**
   * Callback when an asset is selected from the portfolio
   * Used for profile token selection.
   */
  onSelectAsset?: (asset: AssetItem) => void;

  /**
   * Whether to show a remove button for the token
   */
  showRemoveButton?: boolean;

  /**
   * Callback when remove button is pressed
   */
  onRemoveToken?: () => void;

  /** Optional asset type hint if known */
  assetType?: 'token' | 'nft' | 'cnft' | 'collection';
}

// Portfolio asset item display
const PortfolioAssetItem: React.FC<{
  asset: AssetItem;
  onSelect?: (asset: AssetItem) => void;
}> = ({ asset, onSelect }) => {
  const { width } = Dimensions.get('window');
  const itemWidth = (width - 48) / 2;

  // For tokens, use a list item style
  if (asset.assetType === 'token') {
    const imageUrl = asset.image ? fixImageUrl(asset.image) : '';

    const formattedBalance = asset.token_info ?
      parseFloat(
        (parseInt(asset.token_info.balance) / Math.pow(10, asset.token_info.decimals))
          .toFixed(asset.token_info.decimals)
      ).toString() : '0';

    const tokenValue = asset.token_info?.price_info?.total_price
      ? `$${asset.token_info.price_info.total_price.toFixed(2)}`
      : '';

    return (
      <TouchableOpacity
        style={assetStyles.tokenItem}
        onPress={() => onSelect && onSelect(asset)}
        activeOpacity={0.7}
      >
        {/* Token Logo */}
        <View style={assetStyles.tokenLogoContainer}>
          {imageUrl ? (
            <IPFSAwareImage
              source={getValidImageSource(imageUrl)}
              style={assetStyles.tokenLogo}
              resizeMode="cover"
              defaultSource={DEFAULT_IMAGES.token}
              key={Platform.OS === 'android' ? `token-${asset.mint || asset.id}-${Date.now()}` : `token-${asset.mint || asset.id}`}
            />
          ) : (
            <View style={assetStyles.tokenLogoPlaceholder}>
              <Text style={assetStyles.tokenLogoPlaceholderText}>
                {asset.symbol?.[0] || asset.name?.[0] || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Token Details */}
        <View style={assetStyles.tokenDetails}>
          <Text style={assetStyles.tokenName} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={assetStyles.tokenSymbol} numberOfLines={1}>
            {asset.token_info?.symbol || asset.symbol || ''}
          </Text>
        </View>

        {/* Token Balance & Value */}
        <View style={assetStyles.tokenBalanceContainer}>
          <Text style={assetStyles.tokenBalance}>
            {formattedBalance}
          </Text>
          {tokenValue ? (
            <Text style={assetStyles.tokenValue}>
              {tokenValue}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  // For NFTs, use a grid item style
  // Properly handle image rendering
  const renderAssetImage = () => {
    const imageUrl = asset.image ? fixImageUrl(asset.image) : '';

    if (!imageUrl) {
      return (
        <View style={assetStyles.assetPlaceholder}>
          <Text style={assetStyles.assetPlaceholderText}>
            {asset.symbol?.[0] || asset.name?.[0] || '?'}
          </Text>
        </View>
      );
    }

    return (
      <View style={assetStyles.assetImageWrapper}>
        <Image
          source={require('../../../../assets/images/SENDlogo.png')}
          style={assetStyles.fallbackImage}
          resizeMode="cover"
        />
        <IPFSAwareImage
          source={getValidImageSource(imageUrl)}
          style={assetStyles.assetImage}
          resizeMode="cover"
          defaultSource={require('../../../../assets/images/SENDlogo.png')}
          key={Platform.OS === 'android' ? `nft-${asset.mint || asset.id}-${Date.now()}` : `nft-${asset.mint || asset.id}`}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[assetStyles.assetItem, { width: itemWidth }]}
      onPress={() => onSelect && onSelect(asset)}
      activeOpacity={0.7}
    >
      <View style={assetStyles.assetImageContainer}>
        {renderAssetImage()}

        {asset.compression?.compressed && (
          <View style={assetStyles.compressedBadge}>
            <Text style={assetStyles.compressedText}>C</Text>
          </View>
        )}

        {/* Show price if available */}
        {asset.token_info?.price_info?.price_per_token && (
          <View style={assetStyles.priceBadge}>
            <Text style={assetStyles.priceText}>
              ${asset.token_info.price_info.price_per_token.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={assetStyles.assetDetails}>
        <Text style={assetStyles.assetName} numberOfLines={1}>
          {asset.name}
        </Text>

        {asset.collection?.name ? (
          <Text style={assetStyles.assetCollection} numberOfLines={1}>
            {asset.collection.name}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

/**
 * A card component for purchasing creator coins or viewing NFTs/Collections.
 * Displays an image, name/symbol, optional user description, and relevant action buttons.
 */
const BuyCard: React.FC<BuyCardProps> = ({
  tokenName = '$YASH',
  description = 'Sanctum Creator Coin',
  tokenImage,
  tokenDesc = '',
  tokenMint,
  onBuyPress,
  containerStyle,
  showDownArrow = false,
  onArrowPress,
  walletAddress,
  onSelectAsset,
  showRemoveButton = false,
  onRemoveToken,
  assetType: assetTypeHint, // Get the asset type hint
}) => {
  // Move all hooks to the top level - IMPORTANT: No conditional hook calls
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showTokenDetailsDrawer, setShowTokenDetailsDrawer] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [showNftCollectionDrawer, setShowNftCollectionDrawer] = useState(false);
  const [nftLoading, setNftLoading] = useState(false);
  const [nftStatusMsg, setNftStatusMsg] = useState('');

  // States for NFT collection search and selection
  const [collectionName, setCollectionName] = useState('');
  const [searchResults, setSearchResults] = useState<CollectionResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionResult | null>(null);

  // Get Redux state and hooks BEFORE any conditional logic
  const storedProfilePic = useAppSelector(state => state.auth.profilePicUrl);
  const userName = useAppSelector(state => state.auth.username);

  // Get auth and wallet hooks - these must be at the top level
  const auth = useAuth();  // Store the whole auth object to avoid destructuring issues
  const walletUtils = useWallet();  // Store the whole wallet object

  // Extract values from auth and wallet objects safely
  const solanaWallet = auth?.solanaWallet;
  const { wallet, address, publicKey, sendTransaction } = walletUtils;

  // Is this a "Pin your coin" state? (No token attached yet)
  const isPinYourCoin = tokenName === 'Pin your coin' || !tokenMint;

  // For simplicity, using the first connected wallet
  const userPublicKey = address || (solanaWallet?.wallets?.[0]?.publicKey?.toString() || '');
  const effectiveWalletAddress = walletAddress || userPublicKey;

  // Fetch portfolio data when needed
  const { portfolio, loading, error } = useFetchPortfolio(
    showPortfolioModal ? effectiveWalletAddress : undefined
  );

  const currentUser = useMemo(() => ({
    id: userPublicKey || 'anonymous-user',
    username: userName || 'Anonymous',
    handle: userPublicKey
      ? '@' + userPublicKey.slice(0, 6) + '...' + userPublicKey.slice(-4)
      : '@anonymous',
    verified: true,
    avatar: storedProfilePic ? { uri: storedProfilePic } : DEFAULT_IMAGES.user,
  }), [userPublicKey, userName, storedProfilePic]);

  // --- Asset Type Determination ---
  const determinedAssetType = useMemo(() => {
    // Priority 1: Use the provided hint if available
    if (assetTypeHint) {
      return assetTypeHint;
    }

    // Priority 2: Check tokenMint format
    // Tensor collection IDs often look like UUIDs
    if (tokenMint && tokenMint.includes('-')) {
      return 'collection';
    }

    // Priority 3: Check text indicators (less reliable)
    const lowerDesc = (description || '').toLowerCase();
    const lowerName = (tokenName || '').toLowerCase();
    const lowerTokenDesc = (tokenDesc || '').toLowerCase();

    const nftIndicators = ['nft', 'collectible', 'collection'];
    if (
      nftIndicators.some(ind => lowerDesc.includes(ind)) ||
      nftIndicators.some(ind => lowerName.includes(ind)) ||
      nftIndicators.some(ind => lowerTokenDesc.includes(ind))
    ) {
      // If it includes "collection", assume collection, otherwise assume individual NFT
      if (lowerDesc.includes('collection') || lowerName.includes('collection') || lowerTokenDesc.includes('collection')) {
        return 'collection';
      }
      return 'nft';
    }

    // Default to token if no NFT indicators found
    return 'token';
  }, [assetTypeHint, tokenMint, description, tokenName, tokenDesc]);

  // Derived states based on asset type
  const isNftOrCollection = determinedAssetType === 'nft' || determinedAssetType === 'cnft' || determinedAssetType === 'collection';
  const isCollection = determinedAssetType === 'collection';
  const isToken = determinedAssetType === 'token';

  // Group portfolio items by type - memoize to prevent unnecessary recalculations
  const portfolioItems = useMemo(() => {
    const tokens = portfolio.items?.filter(item => item.assetType === 'token') || [];
    const regularNfts = portfolio.items?.filter(item => item.assetType === 'nft') || [];
    const compressedNfts = portfolio.items?.filter(item => item.assetType === 'cnft') || [];
    const solBalance = portfolio.nativeBalance ? (portfolio.nativeBalance.lamports / 1000000000).toFixed(4) : '0';

    return { tokens, regularNfts, compressedNfts, solBalance };
  }, [portfolio]);

  // Extract values from memoized portfolioItems
  const { tokens, regularNfts, compressedNfts, solBalance } = portfolioItems;

  // Determine button text and action based on asset type
  const actionButtonText = isToken ? 'Buy' : 'View';

  // Memoize data for modals/drawers to prevent recreating on each render
  const tokenDetailsData = useMemo(() => {
    const cleanTokenName = tokenName.startsWith('$') ? tokenName.substring(1) : tokenName;

    return {
      symbol: cleanTokenName || '',
      name: tokenName || description || '',
      logoURI: typeof tokenImage === 'string' ? (tokenImage ? fixImageUrl(tokenImage) : undefined) : undefined,
      isCollection: isCollection,
      nftData: isNftOrCollection && !isCollection ? {
        name: tokenName || description,
        description: tokenDesc || 'NFT Details',
      } : undefined,
      collectionData: isCollection ? {
        name: tokenName || description || 'NFT Collection',
        description: tokenDesc || 'Collection Details',
        imageUri: typeof tokenImage === 'string' ? (tokenImage ? fixImageUrl(tokenImage) : undefined) : undefined,
      } : undefined,
    };
  }, [tokenName, description, tokenImage, isCollection, isNftOrCollection, tokenDesc]);

  const nftCollectionData = useMemo(() => ({
    collId: tokenMint || '',
    name: tokenName || description || 'NFT Asset',
    image: typeof tokenImage === 'string'
      ? fixImageUrl(tokenImage)
      : tokenImage || require('../../../../assets/images/SENDlogo.png'),
    description: tokenDesc || `Asset: ${tokenName || description}`,
  }), [tokenMint, tokenName, description, tokenImage, tokenDesc]);

  const tradeModalData = useMemo(() => {
    const cleanTokenName = tokenName.startsWith('$') ? tokenName.substring(1) : tokenName;

    return {
      initialInputToken: {
        address: 'So11111111111111111111111111111111111111112', // SOL mint address
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
      },
      initialOutputToken: {
        address: tokenMint || '',
        symbol: cleanTokenName,
        name: description || cleanTokenName,
        decimals: 6,
        logoURI: typeof tokenImage === 'string' ? fixImageUrl(tokenImage) : '',
      }
    };
  }, [tokenMint, tokenName, description, tokenImage]);

  // Search collections functionality
  const handleSearchCollections = async () => {
    if (!collectionName.trim()) return;
    setLoadingSearch(true);
    setSearchResults([]);

    try {
      const results = await searchCollections(collectionName.trim());
      setSearchResults(results);
    } catch (err: any) {
      console.error('Error searching collections:', err);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle selection of an NFT collection
  const handleSelectCollection = (collection: CollectionResult) => {
    // Prevent multiple selections from happening at once
    if (isAssetSelectionInProgress) {
      console.log('Selection already in progress, ignoring');
      return;
    }

    console.log('Collection selected, beginning closing sequence:', collection);
    setIsAssetSelectionInProgress(true);

    // Close the portfolio modal first
    setShowPortfolioModal(false);

    // Wait for the modal to fully close before proceeding
    setTimeout(() => {
      console.log('Portfolio modal should be closed, proceeding with collection selection');

      // Now it's safe to create the asset and call onSelectAsset
      if (onSelectAsset) {
        // Create a collection asset with a special description that marks it as a collection
        const assetItem = {
          mint: collection.collId,
          name: collection.name,
          image: collection.imageUri,
          assetType: 'collection', // Change to 'collection' to properly identify it
          collection: {
            name: collection.name,
          },
          // Adding metadata - This gets stored in tokenDesc
          metadata: {
            description: `NFT Collection: ${collection.description || collection.name}`
          }
        } as unknown as AssetItem;

        console.log('Calling onSelectAsset with collection as asset:', assetItem);
        onSelectAsset(assetItem);
      }

      // Reset the selection flag after a delay
      setTimeout(() => {
        setIsAssetSelectionInProgress(false);
      }, 500);
    }, 500);
  };

  const handleActionPress = () => {
    // Don't proceed if an asset selection is already in progress
    if (isAssetSelectionInProgress) {
      console.log('Selection already in progress, ignoring action press');
      return;
    }

    console.log('Action button pressed');

    // Reset modals
    setShowTradeModal(false);
    setShowTokenDetailsDrawer(false);
    setShowNftCollectionDrawer(false);

    // Open the appropriate modal/drawer based on asset type
    // Slight delay to ensure any closing modals have time to close
    setTimeout(() => {
      if (isToken) {
        console.log('Opening trade modal');
        setShowTradeModal(true);
      } else {
        // For both NFTs and Collections, open the NFTCollectionDrawer
        console.log('Opening NFT collection drawer');
        setShowNftCollectionDrawer(true);
      }
    }, 100);
  };

  const handleArrowPress = () => {
    // Custom handler if provided
    if (onArrowPress) {
      onArrowPress();
      return; // Don't open portfolio modal if custom handler is provided
    }

    // Open portfolio modal
    setShowPortfolioModal(true);
  };

  // Before the handleSelectAsset function, add a new state
  const [isAssetSelectionInProgress, setIsAssetSelectionInProgress] = useState(false);

  const handleSelectAsset = (asset: AssetItem) => {
    // Prevent multiple selections from happening at once
    if (isAssetSelectionInProgress) {
      console.log('Selection already in progress, ignoring');
      return;
    }

    console.log('Asset selected, beginning closing sequence:', asset);
    setIsAssetSelectionInProgress(true);

    // Close the modal first
    setShowPortfolioModal(false);

    // Wait for the modal to fully close before proceeding
    setTimeout(() => {
      console.log('Portfolio modal should be closed, proceeding with selection');

      // Now it's safe to call onSelectAsset
      if (onSelectAsset) {
        console.log('Calling onSelectAsset with:', asset);
        onSelectAsset(asset);
      } else {
        console.log('No onSelectAsset handler provided');
      }

      // Reset the selection flag after a delay
      setTimeout(() => {
        setIsAssetSelectionInProgress(false);
      }, 500);
    }, 500);
  };

  // Handle click on token image or name to view details
  const handleTokenDetailsPress = () => {
    // Don't proceed if an asset selection is already in progress
    if (isAssetSelectionInProgress) {
      console.log('Selection already in progress, ignoring token details press');
      return;
    }

    if (tokenMint && !isPinYourCoin) {
      console.log('Token details pressed, showing drawer');

      // Reset modals
      setShowTradeModal(false);
      setShowNftCollectionDrawer(false);

      // Small delay to ensure other modals have time to close
      setTimeout(() => {
        setShowTokenDetailsDrawer(true);
      }, 100);
    }
  };

  // Render image for the buy card
  const renderBuyCardImage = () => {
    // If we're in "Pin your coin" state and no token image, don't show an image
    if (isPinYourCoin && !tokenImage) {
      return null;
    }

    if (tokenImage) {
      if (typeof tokenImage === 'string') {
        return (
          <View style={styles.imgWrapper}>
            <Image
              source={require('../../../../assets/images/SENDlogo.png')}
              style={styles.imgBackground}
              resizeMode="cover"
            />
            <IPFSAwareImage
              source={getValidImageSource(tokenImage)}
              style={styles.img}
              resizeMode="cover"
              defaultSource={require('../../../../assets/images/SENDlogo.png')}
              key={Platform.OS === 'android' ? `buycard-${Date.now()}` : 'buycard'}
            />
          </View>
        );
      } else {
        return (
          <IPFSAwareImage
            source={tokenImage}
            style={styles.img}
            resizeMode="cover"
            defaultSource={require('../../../../assets/images/SENDlogo.png')}
          />
        );
      }
    } else {
      return null; // Don't show any image if no tokenImage is provided
    }
  };

  return (
    <View style={[
      styles.container,
      isPinYourCoin ? styles.pinYourCoinContainer : null,
      containerStyle
    ]}>
      {/* Left section with image + name/desc */}
      <View style={styles.contentContainer}>
        {renderBuyCardImage() && (
          <TouchableOpacity
            style={styles.imgContainer}
            activeOpacity={0.8}
            onPress={!isPinYourCoin ? handleTokenDetailsPress : undefined}
            disabled={isPinYourCoin}
          >
            {renderBuyCardImage()}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={!isPinYourCoin ? handleTokenDetailsPress : undefined}
          disabled={isPinYourCoin}
        >
          {/* Display Name/Symbol - remove "Buy $" prefix */}
          <Text
            style={isPinYourCoin ? styles.pinYourCoinText : styles.tokenNameText}>
            {isPinYourCoin
              ? tokenName
              : tokenName.length > 20
                ? `${tokenName.substring(0, 17)}...`
                : tokenName
            }
          </Text>
          {/* Display Description */}
          {tokenDesc ? (
            <Text style={styles.tokenDescText}>
              {tokenDesc.length > 25 ? `${tokenDesc.substring(0, 22)}...` : tokenDesc}
            </Text>
          ) : (
            <Text
              style={styles.tokenDescriptionText}>
              {isPinYourCoin
                ? description // Show original description in pin state
                : description && description.length > 25
                  ? `${description.substring(0, 22)}...`
                  : isToken
                    ? 'Token' // Default for tokens
                    : isCollection
                      ? 'Collection' // Default for collections
                      : 'NFT' // Default for NFTs
              }
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Right section: Action buttons + optional arrow */}
      <View style={styles.buyButtonContainer}>
        {!isPinYourCoin && (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleActionPress} // Use the unified action handler
          >
            <Text style={styles.buyButtonText}>{actionButtonText}</Text>
          </TouchableOpacity>
        )}

        {/* Only show arrow if showDownArrow is true */}
        {showDownArrow && (
          <TouchableOpacity
            style={[styles.arrowButton, isPinYourCoin ? styles.pinArrowButton : null]}
            onPress={handleArrowPress}
          >
            {isPinYourCoin ? (
              <Text style={styles.pinButtonText}>Add Asset</Text>
            ) : (
              <Icons.Arrow />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* IMPORTANT: Always render these components, but control visibility with their props
          This ensures consistent hook calls regardless of state changes during logout */}

      {/* Trade Modal (Always render but control visibility with visible prop) */}
      <TradeModal
        visible={showTradeModal && isToken}
        onClose={() => setShowTradeModal(false)}
        currentUser={currentUser}
        disableTabs={true}
        initialInputToken={tradeModalData.initialInputToken}
        initialOutputToken={tradeModalData.initialOutputToken}
        initialActiveTab="TRADE_AND_SHARE"
      />

      {/* Portfolio Modal */}
      <Modal
        visible={showPortfolioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>
                {onSelectAsset ? "Select a Token to Pin" : "Your Portfolio"}
              </Text>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setShowPortfolioModal(false)}
              >
                <Text style={modalStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Actions section at the top when a token is already attached */}
            {showRemoveButton && tokenMint && onSelectAsset && (
              <View style={modalStyles.actionsContainer}>
                <Text style={modalStyles.actionsText}>
                  Currently pinned: {tokenName}
                </Text>
                <TouchableOpacity
                  style={modalStyles.removeButton}
                  onPress={() => {
                    // Prevent multiple actions from happening at once
                    if (isAssetSelectionInProgress) {
                      console.log('Selection already in progress, ignoring remove request');
                      return;
                    }

                    console.log('Remove token requested, beginning closing sequence');
                    setIsAssetSelectionInProgress(true);

                    // Close the modal first
                    setShowPortfolioModal(false);

                    // Wait for the modal to fully close before proceeding
                    setTimeout(() => {
                      console.log('Portfolio modal should be closed, proceeding with remove');

                      if (onRemoveToken) {
                        console.log('Calling onRemoveToken');
                        onRemoveToken();
                      }

                      // Reset the selection flag after a delay
                      setTimeout(() => {
                        setIsAssetSelectionInProgress(false);
                      }, 500);
                    }, 500);
                  }}
                >
                  <Text style={modalStyles.removeButtonText}>Remove Pin</Text>
                </TouchableOpacity>
                <View style={modalStyles.divider} />
              </View>
            )}

            {loading ? (
              <View style={modalStyles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.brandPrimary} />
                <Text style={modalStyles.loadingText}>Loading your assets...</Text>
              </View>
            ) : error ? (
              <View style={modalStyles.errorContainer}>
                <Text style={modalStyles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={modalStyles.retryButton}
                  onPress={() => {
                    // Close and reopen the modal to retry
                    setShowPortfolioModal(false);
                    setTimeout(() => setShowPortfolioModal(true), 500);
                  }}
                >
                  <Text style={modalStyles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : portfolio.items?.length === 0 ? (
              <View style={modalStyles.emptyContainer}>
                <Text style={modalStyles.emptyText}>No assets found in this wallet.</Text>
              </View>
            ) : (
              <ScrollView style={modalStyles.assetsContainer}>
                {/* SOL Balance */}
                {portfolio.nativeBalance && (
                  <View style={modalStyles.solBalanceContainer}>
                    <Text style={modalStyles.solBalanceLabel}>SOL Balance</Text>
                    <Text style={modalStyles.solBalanceValue}>
                      {solBalance} SOL
                    </Text>
                  </View>
                )}

                {/* Token selection instructions for profile modal */}
                {onSelectAsset && (
                  <View style={modalStyles.instructionsContainer}>
                    <Text style={modalStyles.instructionsText}>
                      Select a token or NFT to pin to your profile
                    </Text>
                  </View>
                )}

                {/* Tokens Section */}
                {tokens.length > 0 && (
                  <View style={modalStyles.sectionContainer}>
                    <Text style={modalStyles.sectionTitle}>Tokens</Text>
                    <View style={modalStyles.tokenListContainer}>
                      {tokens.map((asset, index) => (
                        <React.Fragment key={asset.id || asset.mint}>
                          <PortfolioAssetItem
                            asset={asset}
                            onSelect={handleSelectAsset}
                          />
                          {index < tokens.length - 1 && <View style={modalStyles.divider} />}
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                )}

                {/* NFT Collections Section with Search */}
                <View style={modalStyles.sectionContainer}>
                  <Text style={modalStyles.sectionTitle}>NFTs</Text>

                  {/* Search Input */}
                  <View style={modalStyles.searchContainer}>
                    <TextInput
                      style={modalStyles.searchInput}
                      placeholder="Search collections..."
                      placeholderTextColor={COLORS.textLight}
                      value={collectionName}
                      onChangeText={setCollectionName}
                      onSubmitEditing={handleSearchCollections}
                    />
                    <TouchableOpacity
                      style={modalStyles.searchButton}
                      onPress={handleSearchCollections}>
                      <Text style={modalStyles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Search Results or Loading State */}
                  {loadingSearch ? (
                    <View style={modalStyles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.brandPrimary} />
                      <Text style={modalStyles.loadingText}>Searching collections...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    <View style={modalStyles.collectionGrid}>
                      {searchResults.map(collection => (
                        <TouchableOpacity
                          key={collection.collId}
                          style={modalStyles.collectionItem}
                          onPress={() => handleSelectCollection(collection)}>
                          <Image
                            source={{ uri: collection.imageUri ? fixImageUrl(collection.imageUri) : '' }}
                            style={modalStyles.collectionImage}
                            resizeMode="cover"
                          />
                          <Text style={modalStyles.collectionName} numberOfLines={1}>
                            {collection.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={modalStyles.emptyContainer}>
                      <Text style={modalStyles.emptyText}>
                        {collectionName.trim()
                          ? 'No collections found. Try a different search term.'
                          : 'Search for NFT collections to pin to your profile.'}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Token Details Drawer - Always render with controlled visibility */}
      <TokenDetailsDrawer
        visible={showTokenDetailsDrawer && !!tokenMint && !isPinYourCoin}
        onClose={() => setShowTokenDetailsDrawer(false)}
        tokenMint={tokenMint || ''}
        initialData={tokenDetailsData}
        loading={drawerLoading}
      />

      {/* NFT Collection Drawer - Always render with controlled visibility */}
      <NFTCollectionDrawer
        visible={showNftCollectionDrawer && isNftOrCollection}
        onClose={() => setShowNftCollectionDrawer(false)}
        collection={nftCollectionData}
      />
    </View>
  );
};

export default BuyCard;

// Replace the modalStyles object with these fixed styles
const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
    minHeight: '70%',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.semiBold as any,
    color: COLORS.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lighterBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.white,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    marginTop: 16,
  },
  actionsText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    marginBottom: 12,
  },
  removeButton: {
    backgroundColor: COLORS.lighterBackground,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.errorRed,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.medium as any,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textLight,
    marginTop: 16,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.errorRed,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.darkerBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.brandPrimary,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.medium as any,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  assetsContainer: {
    flex: 1,
  },
  solBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
  },
  solBalanceLabel: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.medium as any,
  },
  solBalanceValue: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.bold as any,
  },
  instructionsContainer: {
    padding: 12,
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.semiBold as any,
    color: COLORS.white,
    marginBottom: 12,
  },
  tokenListContainer: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderDarkColor,
    marginVertical: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.brandPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.black,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.semiBold as any,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  collectionItem: {
    width: '48%',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.lighterBackground,
    overflow: 'hidden',
  } as ImageStyle,
  collectionName: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.medium as any,
    padding: 8,
  }
});

// Add asset styles at the end of the file, after the modalStyles
const assetStyles = StyleSheet.create({
  // Token Item Styles
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.lighterBackground,
  },
  tokenLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  } as ImageStyle,
  tokenLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenLogoPlaceholderText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.bold as any,
    color: COLORS.white,
  },
  tokenDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  tokenName: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.medium as any,
    color: COLORS.white,
    marginBottom: 2,
  },
  tokenSymbol: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textLight,
  },
  tokenBalanceContainer: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.semiBold as any,
    color: COLORS.white,
    marginBottom: 2,
  },
  tokenValue: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textLight,
  },

  // NFT Asset Item Styles
  assetItem: {
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  assetImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.darkerBackground,
  },
  assetImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    overflow: 'hidden',
  } as ImageStyle,
  fallbackImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  } as ImageStyle,
  assetPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetPlaceholderText: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.bold as any,
    color: COLORS.white,
  },
  compressedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.brandPrimary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compressedText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.bold as any,
    color: COLORS.black,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priceText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.white,
  },
  assetDetails: {
    padding: 10,
  },
  assetName: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.medium as any,
    color: COLORS.white,
    marginBottom: 2,
  },
  assetCollection: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textLight,
  },
});
