import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import {
  ThreadUser,
  TradeData,
  ThreadSection,
  ThreadSectionType,
  ThreadPost
} from '../thread.types';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import {
  addPostLocally,
  createRootPostAsync,
} from '@/shared/state/thread/reducer';
import styles from './ShareTradeModal.style';
import PastSwapItem from './PastSwapItem';
import { SwapTransaction, TokenMetadata } from '@/modules/dataModule/services/swapTransactions';
import { FontAwesome5 } from '@expo/vector-icons';
import { TransactionService } from '@/modules/walletProviders/services/transaction/transactionService';
import { TokenInfo } from '@/modules/dataModule/types/tokenTypes';
import {
  DEFAULT_SOL_TOKEN,
  DEFAULT_USDC_TOKEN,
  estimateTokenUsdValue,
  ensureCompleteTokenInfo
} from '../../../../modules/dataModule';
import { useAppDispatch } from '@/shared/hooks/useReduxHooks';
import COLORS from '../../../../assets/colors';
// Import Birdeye API key
import { BIRDEYE_API_KEY } from '@env';

// Get screen dimensions
const { height } = Dimensions.get('window');

/**
 * Available tab options in the TradeModal
 * @type {'PAST_SWAPS'}
 */
type TabOption = 'PAST_SWAPS';

// Birdeye API response types
interface BirdeyeSwapToken {
  symbol: string;
  address: string;
  decimals: number;
  price: number;
  amount: string;
  ui_amount: number;
  ui_change_amount: number;
  type_swap: 'from' | 'to';
}

interface BirdeyeSwapTransaction {
  base: BirdeyeSwapToken;
  quote: BirdeyeSwapToken;
  tx_type: string;
  tx_hash: string;
  ins_index: number;
  inner_ins_index: number;
  block_unix_time: number;
  block_number: number;
  volume_usd: number;
  volume: number;
  pool_id: string;
  owner: string;
  source: string;
  interacted_program_id: string;
}

interface BirdeyeSwapResponse {
  data: {
    items: BirdeyeSwapTransaction[];
  };
}

// Extended SwapTransaction with Birdeye data
interface ExtendedSwapTransaction extends SwapTransaction {
  volumeUsd?: number;
}

interface UpdatedTradeModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback fired when the modal is closed */
  onClose: () => void;
  /** Current user information */
  currentUser: ThreadUser;
  /** Generic callback fired when a trade is ready to be shared */
  onShare: (data: TradeData) => void;
  /** Initial input token for the trade */
  initialInputToken?: Partial<TokenInfo>;
  /** Initial output token for the trade */
  initialOutputToken?: Partial<TokenInfo>;
  /** Whether to disable tab switching */
  disableTabs?: boolean;
  /** Initial active tab to show */
  initialActiveTab?: TabOption;
}

/**
 * A modal component for sharing trade history on the feed.
 *
 * It handles two main flows:
 * 1. Pick an existing Tx signature & share it
 * 2. Select from past swaps & share them
 */
export default function TradeModal({
  visible,
  onClose,
  currentUser,
  onShare,
  initialInputToken,
  initialOutputToken,
  disableTabs,
  initialActiveTab,
}: UpdatedTradeModalProps) {
  const dispatch = useAppDispatch();
  // Use our wallet hook
  const { publicKey: userPublicKey, connected } = useWallet();
  const [selectedTab, setSelectedTab] = useState<TabOption>(() =>
    initialActiveTab ?? 'PAST_SWAPS'
  );

  // Initialize tokens with pending flag until we have complete data
  const [inputToken, setInputToken] = useState<TokenInfo>(DEFAULT_SOL_TOKEN);
  const [outputToken, setOutputToken] = useState<TokenInfo>(DEFAULT_USDC_TOKEN);

  // Track token initialization status
  const [tokensInitialized, setTokensInitialized] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [solscanTxSig, setSolscanTxSig] = useState('');

  // State for selected past swap
  const [selectedPastSwap, setSelectedPastSwap] = useState<SwapTransaction | null>(null);

  // State for past swaps
  const [swaps, setSwaps] = useState<SwapTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Ref to prevent multiple refreshes
  const isRefreshingRef = useRef(false);
  const hasLoadedInitialDataRef = useRef(false);

  // Keep track of whether the component is mounted
  const isMounted = useRef(true);

  // Track pending token operations
  const pendingTokenOps = useRef<{ input: boolean, output: boolean }>({ input: false, output: false });

  // Create a memo-ized user wallet address string for dependencies
  const walletAddress = useMemo(() =>
    userPublicKey ? userPublicKey.toString() : null,
    [userPublicKey]
  );

  // Create animated value for slide-up animation
  const slideAnimation = useRef(new Animated.Value(0)).current;

  // Handle animation when visibility changes
  useEffect(() => {
    if (visible) {
      // Animate the drawer sliding up
      Animated.spring(slideAnimation, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate the drawer sliding down
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  // Calculate the transform based on the animated value
  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
    extrapolate: 'clamp'
  });

  /**
   * Setup cleanup and initialization
   */
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Return cleanup function
    return () => {
      console.log('[TradeModal] Component unmounting, cleaning up');
      isMounted.current = false;

      // Clear any pending timeouts
      pendingTokenOps.current = { input: false, output: false };
    };
  }, []);

  /**
   * Complete token initialization by fetching complete metadata
   */
  const initializeTokens = useCallback(async () => {
    // Don't initialize if already initializing or completed
    if (!isMounted.current || (pendingTokenOps.current.input && pendingTokenOps.current.output)) {
      return;
    }

    try {
      // Initialize input token
      let completeInputToken: TokenInfo;
      let completeOutputToken: TokenInfo;

      // Mark operations as pending
      pendingTokenOps.current = { input: true, output: true };

      console.log('[TradeModal] Initializing tokens...');

      // If initialInputToken is provided, ensure it's a complete TokenInfo
      if (initialInputToken?.address) {
        completeInputToken = await ensureCompleteTokenInfo(initialInputToken);
        console.log('[TradeModal] Initialized input token:', completeInputToken.symbol);
      } else {
        // Default to SOL
        completeInputToken = DEFAULT_SOL_TOKEN;
      }

      // Initialize output token
      if (initialOutputToken?.address) {
        completeOutputToken = await ensureCompleteTokenInfo(initialOutputToken);
        console.log('[TradeModal] Initialized output token:', completeOutputToken.symbol);
      } else {
        // Default to USDC
        completeOutputToken = DEFAULT_USDC_TOKEN;
      }

      if (isMounted.current) {
        // Batch state updates to reduce rerenders
        setInputToken(completeInputToken);
        setOutputToken(completeOutputToken);
        pendingTokenOps.current = { input: false, output: false };
        setTokensInitialized(true);
      }
    } catch (error) {
      console.error('[TradeModal] Error initializing tokens:', error);
      pendingTokenOps.current = { input: false, output: false };
    }
  }, [
    initialInputToken,
    initialOutputToken,
  ]);

  /**
   * Handle visibility changes to reset states
   */
  useEffect(() => {
    if (visible) {
      // Reset states when modal opens
      if (isMounted.current) {
        setResultMsg('');
        setErrorMsg('');
        setSolscanTxSig('');
      }

      // Initialize tokens when modal becomes visible
      if (!tokensInitialized) {
        initializeTokens();
      }
    }
  }, [visible, tokensInitialized, initializeTokens]);

  /**
   * Resets states and closes the entire modal
   */
  const handleClose = useCallback(() => {
    setSelectedTab(initialActiveTab ?? 'PAST_SWAPS');
    setResultMsg('');
    setErrorMsg('');
    setSolscanTxSig('');
    setSelectedPastSwap(null);
    setSwaps([]);
    setInitialLoading(true);
    hasLoadedInitialDataRef.current = false;
    onClose();
  }, [onClose, initialActiveTab]);

  /**
   * Convert a Birdeye swap transaction to our app's SwapTransaction format
   */
  const convertBirdeyeToSwapTransaction = useCallback((birdeyeSwap: BirdeyeSwapTransaction): ExtendedSwapTransaction => {
    // Determine which token is input and which is output
    const inputToken = birdeyeSwap.base.type_swap === 'from' ? birdeyeSwap.base : birdeyeSwap.quote;
    const outputToken = birdeyeSwap.base.type_swap === 'to' ? birdeyeSwap.base : birdeyeSwap.quote;

    // Create SwapTransaction in our app's format
    return {
      signature: birdeyeSwap.tx_hash,
      timestamp: birdeyeSwap.block_unix_time,
      inputToken: {
        mint: inputToken.address,
        symbol: inputToken.symbol,
        name: inputToken.symbol, // Use symbol as name if not available
        decimals: inputToken.decimals,
        amount: parseInt(inputToken.amount, 10),
      },
      outputToken: {
        mint: outputToken.address,
        symbol: outputToken.symbol,
        name: outputToken.symbol, // Use symbol as name if not available
        decimals: outputToken.decimals,
        amount: parseInt(outputToken.amount, 10),
      },
      success: true, // Birdeye only returns successful transactions
      volumeUsd: birdeyeSwap.volume_usd,
    };
  }, []);

  /**
   * Fetch swap transactions using Birdeye API
   */
  const fetchSwapsWithBirdeye = useCallback(async (ownerAddress: string): Promise<ExtendedSwapTransaction[]> => {
    if (!ownerAddress) {
      throw new Error('Wallet address is required');
    }

    try {
      // Calculate time range (last 30 days)
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

      // Construct the Birdeye API URL
      const url = `https://public-api.birdeye.so/defi/v3/txs?offset=0&limit=50&sort_by=block_unix_time&sort_type=desc&tx_type=swap&owner=${ownerAddress}&after_time=${thirtyDaysAgo}`;

      // Make the API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-chain': 'solana',
          'x-api-key': BIRDEYE_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status} ${response.statusText}`);
      }

      const result: BirdeyeSwapResponse = await response.json();

      if (!result.data || !result.data.items) {
        console.log('[TradeModal] No swap data returned from Birdeye API');
        return [];
      }

      // Convert Birdeye format to our app's format
      const convertedSwaps = result.data.items.map(convertBirdeyeToSwapTransaction);

      return convertedSwaps;
    } catch (error) {
      console.error('[TradeModal] Error fetching swaps from Birdeye:', error);
      throw error;
    }
  }, [convertBirdeyeToSwapTransaction]);

  /**
   * Create trade data object from a past swap transaction
   */
  const createTradeDataFromSwap = useCallback(async (swap: ExtendedSwapTransaction): Promise<TradeData> => {
    const inputQty = swap.inputToken.amount / Math.pow(10, swap.inputToken.decimals);
    const outputQty = swap.outputToken.amount / Math.pow(10, swap.outputToken.decimals);
    const timestampMs = swap.timestamp < 10000000000 ? swap.timestamp * 1000 : swap.timestamp;

    // Use volume USD directly from Birdeye if available, otherwise estimate
    let inputUsdValue: string;
    let outputUsdValue: string;

    // Check if volumeUsd exists and is a number
    if ('volumeUsd' in swap &&
      swap.volumeUsd !== undefined &&
      typeof swap.volumeUsd === 'number') {
      // If the swap has volumeUsd from Birdeye, use that to calculate token values
      inputUsdValue = `$${swap.volumeUsd.toFixed(2)}`;
      outputUsdValue = `$${swap.volumeUsd.toFixed(2)}`;
    } else {
      // Fall back to the old estimation if volumeUsd is not available
      inputUsdValue = await estimateTokenUsdValue(
        swap.inputToken.amount,
        swap.inputToken.decimals,
        swap.inputToken.mint,
        swap.inputToken.symbol
      );
      outputUsdValue = await estimateTokenUsdValue(
        swap.outputToken.amount,
        swap.outputToken.decimals,
        swap.outputToken.mint,
        swap.outputToken.symbol
      );
    }

    return {
      inputMint: swap.inputToken.mint,
      outputMint: swap.outputToken.mint,
      aggregator: 'Jupiter', // Or derive from swap data if possible
      inputSymbol: swap.inputToken.symbol || 'Unknown',
      inputQuantity: inputQty.toFixed(4),
      inputUsdValue,
      outputSymbol: swap.outputToken.symbol || 'Unknown',
      inputAmountLamports: String(swap.inputToken.amount),
      outputAmountLamports: String(swap.outputToken.amount),
      outputQuantity: outputQty.toFixed(4),
      outputUsdValue,
      executionTimestamp: timestampMs,
    };
  }, []);

  /**
   * Handle selection of a past swap from the PastSwapsTab
   */
  const handlePastSwapSelected = useCallback((swap: SwapTransaction) => {
    setSelectedPastSwap(swap);
  }, []);

  /**
   * Handle refresh for past swaps using Birdeye API
   */
  const handleRefresh = useCallback(async () => {
    // Prevent concurrent refreshes
    if (!walletAddress || isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    if (!initialLoading && isMounted.current) {
      setRefreshing(true);
    }

    try {
      // Use the new Birdeye API function
      const birdeyeSwaps = await fetchSwapsWithBirdeye(walletAddress);

      if (isMounted.current) {
        setSwaps(birdeyeSwaps);

        // If no swap is selected yet and we have swaps, select the first one
        if (!selectedPastSwap && birdeyeSwaps.length > 0) {
          setSelectedPastSwap(birdeyeSwaps[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching past swaps:', err);
    } finally {
      if (isMounted.current) {
        setRefreshing(false);
        setInitialLoading(false);
      }
      isRefreshingRef.current = false;
      hasLoadedInitialDataRef.current = true;
    }
  }, [walletAddress, selectedPastSwap, fetchSwapsWithBirdeye]);

  /**
   * Handle refresh explicitly with a forced update
   */
  const forceRefresh = useCallback(async () => {
    console.log('[TradeModal] Force refreshing swaps...');

    if (!walletAddress) {
      console.log('[TradeModal] No wallet address, cannot refresh');
      return;
    }

    // Reset refresh state to ensure we're starting fresh
    isRefreshingRef.current = false;

    // Call the refresh function
    await handleRefresh();
  }, [walletAddress, handleRefresh]);

  // Fetch past swaps when modal becomes visible - only once
  useEffect(() => {
    if (visible && walletAddress && !hasLoadedInitialDataRef.current) {
      if (isMounted.current) {
        setInitialLoading(true);
      }
      handleRefresh();
    }
  }, [visible, walletAddress, handleRefresh]);

  /**
   * Share the selected past swap using the onShare callback
   */
  const handleSharePastSwap = useCallback(async () => {
    if (!selectedPastSwap) {
      Alert.alert('No swap selected', 'Please select a swap to share.');
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setResultMsg('Preparing share...');
    }

    try {
      // Create the trade data object manually to avoid type conflicts
      const inputQty = selectedPastSwap.inputToken.amount / Math.pow(10, selectedPastSwap.inputToken.decimals);
      const outputQty = selectedPastSwap.outputToken.amount / Math.pow(10, selectedPastSwap.outputToken.decimals);
      const timestampMs = selectedPastSwap.timestamp < 10000000000 ? selectedPastSwap.timestamp * 1000 : selectedPastSwap.timestamp;

      // Use volume USD directly from Birdeye if available, otherwise estimate
      let inputUsdValue: string;
      let outputUsdValue: string;

      // Check if volumeUsd exists and is a number
      if ('volumeUsd' in selectedPastSwap &&
        selectedPastSwap.volumeUsd !== undefined &&
        typeof selectedPastSwap.volumeUsd === 'number') {
        // If the swap has volumeUsd from Birdeye, use that to calculate token values
        inputUsdValue = `$${selectedPastSwap.volumeUsd.toFixed(2)}`;
        outputUsdValue = `$${selectedPastSwap.volumeUsd.toFixed(2)}`;
      } else {
        // Fall back to the old estimation if volumeUsd is not available
        inputUsdValue = await estimateTokenUsdValue(
          selectedPastSwap.inputToken.amount,
          selectedPastSwap.inputToken.decimals,
          selectedPastSwap.inputToken.mint,
          selectedPastSwap.inputToken.symbol
        );
        outputUsdValue = await estimateTokenUsdValue(
          selectedPastSwap.outputToken.amount,
          selectedPastSwap.outputToken.decimals,
          selectedPastSwap.outputToken.mint,
          selectedPastSwap.outputToken.symbol
        );
      }

      // Create a trade data object directly
      const tradeData: TradeData = {
        inputMint: selectedPastSwap.inputToken.mint,
        outputMint: selectedPastSwap.outputToken.mint,
        aggregator: 'Jupiter',
        inputSymbol: selectedPastSwap.inputToken.symbol || 'Unknown',
        inputQuantity: inputQty.toFixed(4),
        inputUsdValue,
        outputSymbol: selectedPastSwap.outputToken.symbol || 'Unknown',
        inputAmountLamports: String(selectedPastSwap.inputToken.amount),
        outputAmountLamports: String(selectedPastSwap.outputToken.amount),
        outputQuantity: outputQty.toFixed(4),
        outputUsdValue,
        executionTimestamp: timestampMs,
      };

      // Call the parent's onShare handler with our manually created tradeData
      await onShare(tradeData);

      if (isMounted.current) {
        setResultMsg('Trade shared!');
      }

      // Close the modal after successful share
      setTimeout(() => handleClose(), 1000);

    } catch (err: any) {
      console.error('[handleSharePastSwap] Error =>', err);
      if (isMounted.current) {
        setErrorMsg('Failed to share past swap');
      }
      TransactionService.showError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [selectedPastSwap, onShare, handleClose, estimateTokenUsdValue]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      {/* Container for the entire screen */}
      <View style={styles.flexFill}>
        {/* Dark overlay that closes the modal when tapped */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.darkOverlay} />
        </TouchableWithoutFeedback>

        {/* Bottom drawer wrapper */}
        <View style={styles.centeredWrapper}>
          <Animated.View
            style={[
              styles.modalContentContainer,
              { transform: [{ translateY }] },
            ]}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  {/* Drag handle for bottom drawer UI */}
                  <View style={styles.dragHandle} />

                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>Trade History</Text>
                    <TouchableOpacity
                      style={styles.headerClose}
                      onPress={handleClose}>
                      <Text style={styles.headerCloseText}>✕</Text>
                    </TouchableOpacity>
                    {walletAddress && (
                      <TouchableOpacity
                        style={styles.refreshIcon}
                        onPress={forceRefresh}
                        disabled={refreshing || initialLoading}>
                        <FontAwesome5
                          name="sync"
                          size={14}
                          color={COLORS.accessoryDarkColor}
                          style={[
                            (refreshing || initialLoading) && {
                              transform: [{ rotate: '45deg' }]
                            },
                            refreshing && { opacity: 0.7 }
                          ]}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Past Swaps Tab Content */}
                  <View style={[styles.pastSwapsContainer, { flex: 1 }]}>
                    {walletAddress ? (
                      <>
                        <View style={styles.pastSwapsContent}>
                          {initialLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="large" color={COLORS.brandBlue} />
                              <Text style={styles.loadingText}>
                                Loading your transaction history...
                              </Text>
                            </View>
                          ) : refreshing ? (
                            <View style={styles.refreshingOverlay}>
                              <ActivityIndicator size="large" color={COLORS.brandBlue} />
                              <Text style={styles.loadingText}>Refreshing...</Text>
                            </View>
                          ) : swaps.length === 0 ? (
                            <View style={styles.emptySwapsList}>
                              <View style={styles.emptySwapsIcon}>
                                <FontAwesome5 name="exchange-alt" size={24} color={COLORS.white} />
                              </View>
                              <Text style={styles.emptySwapsText}>No Swap History</Text>
                              <Text style={styles.emptySwapsSubtext}>
                                Complete a token swap to see it here
                              </Text>
                              <TouchableOpacity
                                style={styles.emptyStateRefreshButton}
                                onPress={forceRefresh}
                                disabled={refreshing}>
                                <FontAwesome5 name="sync-alt" size={12} color={COLORS.white} />
                                <Text style={styles.emptyStateRefreshText}>Refresh</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <FlatList
                              data={swaps}
                              renderItem={({ item }) => {
                                // Helper function to get token logo URL with fallbacks
                                const getTokenLogoUrl = (token: any) => {
                                  // Try the properties we know about
                                  if (token.logoURI) return token.logoURI;
                                  if (token.image) return token.image;

                                  // Fallbacks for common tokens
                                  if (token.symbol === 'SOL' || token.mint === 'So11111111111111111111111111111111111111112') {
                                    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
                                  }

                                  if (token.symbol === 'USDC' || token.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
                                    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png';
                                  }

                                  // No logo found
                                  return null;
                                };

                                return (
                                  <TouchableOpacity
                                    style={styles.swapItemContainer}
                                    onPress={() => handlePastSwapSelected(item)}
                                    activeOpacity={0.7}
                                  >
                                    <PastSwapItem
                                      swap={item}
                                      onSelect={handlePastSwapSelected}
                                      selected={selectedPastSwap?.signature === item.signature}
                                      inputTokenLogoURI={getTokenLogoUrl(item.inputToken)}
                                      outputTokenLogoURI={getTokenLogoUrl(item.outputToken)}
                                    />
                                  </TouchableOpacity>
                                );
                              }}
                              keyExtractor={(item, index) => `${item.signature}-${index}`}
                              contentContainerStyle={styles.swapsList}
                              showsVerticalScrollIndicator={true}
                              initialNumToRender={5}
                              onRefresh={handleRefresh}
                              refreshing={refreshing}
                              ListHeaderComponent={
                                <View style={styles.listHeaderContainer}>
                                  <Text style={styles.swapsCountText}>
                                    {swaps.length} {swaps.length === 1 ? 'swap' : 'swaps'} found
                                  </Text>
                                  <View style={styles.swapsListDivider} />
                                </View>
                              }
                            />
                          )}
                        </View>

                        {selectedPastSwap && !loading && !initialLoading && (
                          <TouchableOpacity
                            style={styles.swapButton}
                            onPress={handleSharePastSwap}>
                            <Text style={styles.swapButtonText}>
                              Share Selected Swap
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <View style={styles.walletNotConnected}>
                        <View style={styles.connectWalletIcon}>
                          <FontAwesome5 name="wallet" size={20} color={COLORS.accessoryDarkColor} />
                        </View>
                        <Text style={styles.walletNotConnectedText}>
                          Please connect your wallet to view your past swaps
                        </Text>
                      </View>
                    )}

                    {loading && selectedPastSwap && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.brandBlue} />
                        <Text style={styles.loadingText}>Sharing selected swap...</Text>
                      </View>
                    )}
                  </View>

                  {!!resultMsg && (
                    <Text style={styles.resultText}>{resultMsg}</Text>
                  )}
                  {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
