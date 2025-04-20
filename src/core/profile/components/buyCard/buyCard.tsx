import React, { useState, useMemo } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
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
        style={styles.tokenItem}
        onPress={() => onSelect && onSelect(asset)}
        activeOpacity={0.7}
      >
        {/* Token Logo */}
        <View style={styles.tokenLogoContainer}>
          {imageUrl ? (
            <IPFSAwareImage
              source={getValidImageSource(imageUrl)}
              style={styles.tokenLogo}
              resizeMode="cover"
              defaultSource={DEFAULT_IMAGES.token}
              key={Platform.OS === 'android' ? `token-${asset.mint || asset.id}-${Date.now()}` : `token-${asset.mint || asset.id}`}
            />
          ) : (
            <View style={styles.tokenLogoPlaceholder}>
              <Text style={styles.tokenLogoPlaceholderText}>
                {asset.symbol?.[0] || asset.name?.[0] || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Token Details */}
        <View style={styles.tokenDetails}>
          <Text style={styles.tokenName} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={styles.tokenSymbol} numberOfLines={1}>
            {asset.token_info?.symbol || asset.symbol || ''}
          </Text>
        </View>

        {/* Token Balance & Value */}
        <View style={styles.tokenBalanceContainer}>
          <Text style={styles.tokenBalance}>
            {formattedBalance}
          </Text>
          {tokenValue ? (
            <Text style={styles.tokenValue}>
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
        <View style={styles.assetPlaceholder}>
          <Text style={styles.assetPlaceholderText}>
            {asset.symbol?.[0] || asset.name?.[0] || '?'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.assetImageWrapper}>
        <Image
          source={require('../../../../assets/images/SENDlogo.png')}
          style={styles.fallbackImage}
          resizeMode="cover"
        />
        <IPFSAwareImage
          source={getValidImageSource(imageUrl)}
          style={styles.assetImage}
          resizeMode="cover"
          defaultSource={require('../../../../assets/images/SENDlogo.png')}
          key={Platform.OS === 'android' ? `nft-${asset.mint || asset.id}-${Date.now()}` : `nft-${asset.mint || asset.id}`}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.assetItem, { width: itemWidth }]}
      onPress={() => onSelect && onSelect(asset)}
      activeOpacity={0.7}
    >
      <View style={styles.assetImageContainer}>
        {renderAssetImage()}

        {asset.compression?.compressed && (
          <View style={styles.compressedBadge}>
            <Text style={styles.compressedText}>C</Text>
          </View>
        )}

        {/* Show price if available */}
        {asset.token_info?.price_info?.price_per_token && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>
              ${asset.token_info.price_info.price_per_token.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.assetDetails}>
        <Text style={styles.assetName} numberOfLines={1}>
          {asset.name}
        </Text>

        {asset.collection?.name ? (
          <Text style={styles.assetCollection} numberOfLines={1}>
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

  // State to hold asset selected from portfolio modal, pending modal dismissal
  // Define a union type for the pending action
  type PendingAction = AssetItem | { assetType: 'remove-token' } | null;
  const [pendingAssetSelection, setPendingAssetSelection] = useState<PendingAction>(null);

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
    console.log('Collection selected:', collection);

    // Create the asset item
    const assetItem = {
      mint: collection.collId,
      name: collection.name,
      image: collection.imageUri,
      assetType: 'collection', // Change to 'collection' to properly identify it
      collection: {
        name: collection.name,
      },
      metadata: {
        description: `NFT Collection: ${collection.description || collection.name}`
      }
    } as unknown as AssetItem;

    // Set the pending asset and close the modal
    setPendingAssetSelection(assetItem);
    setShowPortfolioModal(false);
    // onSelectAsset will be called in handlePortfolioModalDismiss
  };

  const handleActionPress = () => {
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

  const handleSelectAsset = (asset: AssetItem) => {
    console.log('Asset selected:', asset);

    // Close the modal first
    setShowPortfolioModal(false);

    // Set the pending asset and close the modal
    setPendingAssetSelection(asset);
    setShowPortfolioModal(false);
    // onSelectAsset will be called in handlePortfolioModalDismiss
  };

  // Handle click on token image or name to view details
  const handleTokenDetailsPress = () => {
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

  // Add the handler function for modal dismissal
  const handlePortfolioModalDismiss = () => {
    console.log('Portfolio modal dismissed/hidden. Pending action:', pendingAssetSelection?.assetType);
    if (pendingAssetSelection) {
      // Check the type explicitly for the marker
      if (pendingAssetSelection.assetType === 'remove-token') {
        if (onRemoveToken) {
          console.log('Calling onRemoveToken after modal dismiss');
          onRemoveToken();
        }
      } else if (onSelectAsset) {
        console.log('Calling onSelectAsset after modal dismiss with:', pendingAssetSelection);
        onSelectAsset(pendingAssetSelection);
      }
      // Clear the pending action once processed
      setPendingAssetSelection(null);
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
        initialActiveTab="PAST_SWAPS"
      />

      {/* Portfolio Modal */}
      <Modal
        visible={showPortfolioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPortfolioModal(false)}
        // Use onDismiss for both platforms - it triggers after the modal is fully hidden
        onDismiss={handlePortfolioModalDismiss}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {onSelectAsset ? "Select a Token to Pin" : "Your Portfolio"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPortfolioModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Actions section at the top when a token is already attached */}
            {showRemoveButton && tokenMint && onSelectAsset && (
              <View style={styles.actionsContainer}>
                <Text style={styles.actionsText}>
                  Currently pinned: {tokenName}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    console.log('Remove token requested');

                    // Close the modal first
                    setShowPortfolioModal(false);
                    // Trigger remove logic after modal closes
                    setPendingAssetSelection({ assetType: 'remove-token' } as any);
                  }}
                >
                  <Text style={styles.removeButtonText}>Remove Pin</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
              </View>
            )}

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.brandPrimary} />
                <Text style={styles.loadingText}>Loading your assets...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    // Close and reopen the modal to retry
                    setShowPortfolioModal(false);
                    setTimeout(() => setShowPortfolioModal(true), 500);
                  }}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : portfolio.items?.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No assets found in this wallet.</Text>
              </View>
            ) : (
              <ScrollView style={styles.assetsContainer}>
                {/* SOL Balance */}
                {portfolio.nativeBalance && (
                  <View style={styles.solBalanceContainer}>
                    <Text style={styles.solBalanceLabel}>SOL Balance</Text>
                    <Text style={styles.solBalanceValue}>
                      {solBalance} SOL
                    </Text>
                  </View>
                )}

                {/* Token selection instructions for profile modal */}
                {onSelectAsset && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>
                      Select a token or NFT to pin to your profile
                    </Text>
                  </View>
                )}

                {/* Tokens Section */}
                {tokens.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Tokens</Text>
                    <View style={styles.tokenListContainer}>
                      {tokens.map((asset, index) => (
                        <React.Fragment key={asset.id || asset.mint}>
                          <PortfolioAssetItem
                            asset={asset}
                            onSelect={handleSelectAsset}
                          />
                          {index < tokens.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                )}

                {/* NFT Collections Section with Search */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>NFTs</Text>

                  {/* Search Input */}
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search collections..."
                      placeholderTextColor={COLORS.textLight}
                      value={collectionName}
                      onChangeText={setCollectionName}
                      onSubmitEditing={handleSearchCollections}
                    />
                    <TouchableOpacity
                      style={styles.searchButton}
                      onPress={handleSearchCollections}>
                      <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Search Results or Loading State */}
                  {loadingSearch ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.brandPrimary} />
                      <Text style={styles.loadingText}>Searching collections...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    <View style={styles.collectionGrid}>
                      {searchResults.map(collection => (
                        <TouchableOpacity
                          key={collection.collId}
                          style={styles.collectionItem}
                          onPress={() => handleSelectCollection(collection)}>
                          <Image
                            source={{ uri: collection.imageUri ? fixImageUrl(collection.imageUri) : '' }}
                            style={styles.collectionImage}
                            resizeMode="cover"
                          />
                          <Text style={styles.collectionName} numberOfLines={1}>
                            {collection.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
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
