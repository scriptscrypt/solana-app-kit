import React, { useEffect, useState, useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
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
  Easing,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  ThreadUser,
  TradeData,
  ThreadSection,
  ThreadSectionType,
  ThreadPost
} from '../thread.types';
import { useWallet } from '@/modules/wallet-providers/hooks/useWallet';
import {
  addPostLocally,
  createRootPostAsync,
} from '@/shared/state/thread/reducer';
import styles from './ShareTradeModal.style';
import PastSwapItem from './PastSwapItem';
import { SwapTransaction, TokenMetadata } from '@/modules/data-module/services/swapTransactions';
import { FontAwesome5 } from '@expo/vector-icons';
import { TransactionService } from '@/modules/wallet-providers/services/transaction/transactionService';
import { TokenInfo } from '@/modules/data-module/types/tokenTypes';
import {
  DEFAULT_SOL_TOKEN,
  DEFAULT_USDC_TOKEN,
  estimateTokenUsdValue,
  ensureCompleteTokenInfo
} from '../../../../modules/data-module';
import { useAppDispatch } from '@/shared/hooks/useReduxHooks';
import COLORS from '../../../../assets/colors';
// Import Birdeye API key
import { BIRDEYE_API_KEY } from '@env';

// Get screen dimensions
const { height } = Dimensions.get('window');

/**
 * Ref handle for the ShareTradeModal component
 * @interface ShareTradeModalRef
 */
export interface ShareTradeModalRef {
  forceRefresh: () => void;
}

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

// Extend the SwapTransaction type to include uniqueId
interface EnhancedSwapTransaction extends SwapTransaction {
  uniqueId?: string;
  volumeUsd?: number;
  isMultiHop?: boolean;
  hopCount?: number;
  childTransactions?: EnhancedSwapTransaction[];
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

// Simple skeleton component with shimmer effect for loading states
const SkeletonSwapItem = ({ index = 0 }) => {
  // Create animated value for shimmer effect
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  // Start the shimmer animation when component mounts
  useEffect(() => {
    const startShimmerAnimation = () => {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ).start();
    };

    startShimmerAnimation();
    return () => shimmerAnim.stopAnimation();
  }, [shimmerAnim]);

  // Interpolate the animated value for the shimmer gradient
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSwapItem}>
        {/* Token swap info row with shimmer effect */}
        <View style={styles.skeletonRow}>
          {/* From token */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.skeletonTokenBox} />
            <View style={styles.skeletonMiddleContent}>
              <View style={styles.skeletonTextLong} />
              <View style={styles.skeletonTextShort} />
            </View>
          </View>

          {/* Arrow with inner circle for better appearance */}
          <View style={styles.skeletonArrow}>
            <View style={styles.skeletonArrowInner} />
          </View>

          {/* To token */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.skeletonTokenBox} />
            <View style={styles.skeletonMiddleContent}>
              <View style={styles.skeletonTextLong} />
              <View style={styles.skeletonTextShort} />
            </View>
          </View>
        </View>

        {/* Date/timestamp line */}
        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <View style={styles.skeletonDateText} />
        </View>

        {/* Shimmer overlay - contained within this skeleton item */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              backgroundColor: 'white',
              // Create a gradient effect using linear gradient
              // Since we can't use LinearGradient directly, simulate with a skewed view
              width: 120,
              left: -60,
              opacity: 0.15,
              transform: [
                { translateX: shimmerTranslate },
                { skewX: '-30deg' }
              ],
            }
          ]}
        />
      </View>
    </View>
  );
};

// Create a list of skeleton items
const SkeletonSwapList = ({ count = 5 }) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Skeleton header that mimics the real list header */}
      <View style={styles.listHeaderContainer}>
        <View style={[styles.skeletonTextShort, { width: 120, marginBottom: 8 }]} />
        <View style={styles.swapsListDivider} />
      </View>

      {/* Skeleton items */}
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonSwapItem key={`skeleton-${index}`} index={index} />
      ))}
    </View>
  );
};

/**
 * A modal component for sharing trade history on the feed.
 *
 * It handles two main flows:
 * 1. Pick an existing Tx signature & share it
 * 2. Select from past swaps & share them
 */
export const ShareTradeModal = forwardRef<ShareTradeModalRef, UpdatedTradeModalProps>(({
  visible,
  onClose,
  currentUser,
  onShare,
  initialInputToken,
  initialOutputToken,
  disableTabs,
  initialActiveTab,
}, ref) => {
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

  // Add state for message text input
  const [messageText, setMessageText] = useState('');

  // State for selected past swap
  const [selectedPastSwap, setSelectedPastSwap] = useState<EnhancedSwapTransaction | null>(null);

  // State for past swaps
  const [swaps, setSwaps] = useState<EnhancedSwapTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Check if API key is available
  const hasBirdeyeApiKey = useMemo(() => {
    if (!BIRDEYE_API_KEY) {
      console.error('[TradeModal] Birdeye API key is missing - please check .env file');
      return false;
    }
    return true;
  }, []);

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
    setMessageText(''); // Reset message text when closing
    hasLoadedInitialDataRef.current = false;
    onClose();
  }, [onClose, initialActiveTab]);

  /**
   * Convert a Birdeye swap transaction to our app's SwapTransaction format
   */
  const convertBirdeyeToSwapTransaction = useCallback((birdeyeSwap: BirdeyeSwapTransaction, index: number): EnhancedSwapTransaction => {
    // Determine which token is input and which is output
    const inputToken = birdeyeSwap.base.type_swap === 'from' ? birdeyeSwap.base : birdeyeSwap.quote;
    const outputToken = birdeyeSwap.base.type_swap === 'to' ? birdeyeSwap.base : birdeyeSwap.quote;

    // Create SwapTransaction in our app's format with a unique ID
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
      uniqueId: `${birdeyeSwap.tx_hash}-${birdeyeSwap.ins_index}-${birdeyeSwap.inner_ins_index}-${index}` // Create unique ID
    };
  }, []);

  /**
   * Fetch swap transactions using Birdeye API
   */
  const fetchSwapsWithBirdeye = useCallback(async (ownerAddress: string): Promise<EnhancedSwapTransaction[]> => {
    if (!ownerAddress) {
      throw new Error('Wallet address is required');
    }

    if (!BIRDEYE_API_KEY) {
      console.error('[TradeModal] Birdeye API key is missing');
      throw new Error('Birdeye API key is missing. Please check your environment variables.');
    }

    try {
      // Calculate time range - use 28 days to ensure we're safely within the API's "last 30 days" requirement
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const daysToFetch = 28; // Use 28 days instead of 30 to be safe
      const startTime = now - (daysToFetch * 24 * 60 * 60);

      // Log the API request details for debugging
      console.log(`[TradeModal] Fetching swaps for address: ${ownerAddress} from ${startTime} to ${now}`);

      // Construct the Birdeye API URL - be explicit with parameters
      const url = `https://public-api.birdeye.so/defi/v3/txs?offset=0&limit=50&sort_by=block_unix_time&sort_type=desc&tx_type=swap&owner=${ownerAddress}&after_time=${startTime}`;

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
        console.error(`[TradeModal] Birdeye API error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error(`[TradeModal] Birdeye API error body: ${errorBody}`);
        throw new Error(`Birdeye API error: ${response.status} ${response.statusText}`);
      }

      const result: BirdeyeSwapResponse = await response.json();

      if (!result.data || !result.data.items) {
        console.log('[TradeModal] No swap data returned from Birdeye API');
        return [];
      }

      // Convert Birdeye format to our app's format with index to create unique IDs
      const convertedSwaps = result.data.items.map((item, index) =>
        convertBirdeyeToSwapTransaction(item, index)
      );

      return convertedSwaps;
    } catch (error) {
      console.error('[TradeModal] Error fetching swaps from Birdeye:', error);
      throw error;
    }
  }, [convertBirdeyeToSwapTransaction]);

  /**
   * Group related swaps by timestamp (within 5 seconds)
   * For routes that go through multiple hops (USDC->MEW->WSOL->SEND)
   */
  const groupRelatedSwaps = useCallback((swaps: EnhancedSwapTransaction[]): EnhancedSwapTransaction[] => {
    if (!swaps.length) return [];

    // Sort by timestamp ascending
    const sortedSwaps = [...swaps].sort((a, b) => a.timestamp - b.timestamp);
    const groupedSwaps: EnhancedSwapTransaction[] = [];
    let currentGroup: EnhancedSwapTransaction[] = [];

    // Time window in seconds to consider swaps related (5 seconds)
    const TIME_WINDOW = 5;

    sortedSwaps.forEach((swap, index) => {
      if (index === 0) {
        currentGroup = [swap];
      } else {
        const prevSwap = sortedSwaps[index - 1];
        const timeDiff = Math.abs(swap.timestamp - prevSwap.timestamp);

        // If within time window, add to current group
        if (timeDiff <= TIME_WINDOW) {
          currentGroup.push(swap);
        } else {
          // Process the completed group
          if (currentGroup.length > 0) {
            if (currentGroup.length === 1) {
              // Single swap, add as is
              groupedSwaps.push(currentGroup[0]);
            } else {
              // Multi-hop swap, combine first input and last output
              const firstSwap = currentGroup[0];
              const lastSwap = currentGroup[currentGroup.length - 1];

              // Create a new transaction representing the full route
              const combinedSwap: EnhancedSwapTransaction = {
                ...firstSwap,
                outputToken: lastSwap.outputToken,
                uniqueId: `${firstSwap.uniqueId}-combined`,
                isMultiHop: true,
                hopCount: currentGroup.length,
                childTransactions: currentGroup
              };

              groupedSwaps.push(combinedSwap);
            }
          }

          // Start a new group
          currentGroup = [swap];
        }
      }
    });

    // Handle the last group
    if (currentGroup.length > 0) {
      if (currentGroup.length === 1) {
        groupedSwaps.push(currentGroup[0]);
      } else {
        const firstSwap = currentGroup[0];
        const lastSwap = currentGroup[currentGroup.length - 1];

        const combinedSwap: EnhancedSwapTransaction = {
          ...firstSwap,
          outputToken: lastSwap.outputToken,
          uniqueId: `${firstSwap.uniqueId}-combined`,
          isMultiHop: true,
          hopCount: currentGroup.length,
          childTransactions: currentGroup
        };

        groupedSwaps.push(combinedSwap);
      }
    }

    // Sort final result by timestamp descending (newest first)
    return groupedSwaps.sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  /**
   * Create trade data object from a past swap transaction
   */
  const createTradeDataFromSwap = useCallback(async (swap: EnhancedSwapTransaction): Promise<TradeData> => {
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
  const handlePastSwapSelected = useCallback((swap: EnhancedSwapTransaction) => {
    setSelectedPastSwap(swap);
  }, []);

  /**
   * Handle refresh for past swaps using Birdeye API
   */
  const handleRefresh = useCallback(async () => {
    // Clear any previous API errors
    if (isMounted.current) {
      setApiError(null);
    }

    // Check if wallet is connected
    if (!walletAddress) {
      if (isMounted.current) {
        setInitialLoading(false);
        setRefreshing(false);
        setApiError("Please connect your wallet to view your swap history");
      }
      return;
    }

    // Check if API key is available
    if (!hasBirdeyeApiKey) {
      if (isMounted.current) {
        setInitialLoading(false);
        setRefreshing(false);
        setApiError("API configuration error. Please contact support.");
      }
      return;
    }

    // Prevent concurrent refreshes
    if (isRefreshingRef.current) {
      console.log('[TradeModal] Refresh already in progress, skipping');
      return;
    }

    isRefreshingRef.current = true;

    if (!initialLoading && isMounted.current) {
      setRefreshing(true);
    }

    try {
      // Use the new Birdeye API function
      const birdeyeSwaps = await fetchSwapsWithBirdeye(walletAddress);

      // Group related swaps before setting state
      const groupedSwaps = groupRelatedSwaps(birdeyeSwaps);

      if (isMounted.current) {
        setSwaps(groupedSwaps);

        // If no swap is selected yet and we have swaps, select the first one
        if (!selectedPastSwap && groupedSwaps.length > 0) {
          setSelectedPastSwap(groupedSwaps[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching past swaps:', err);

      if (isMounted.current) {
        // Set a user-friendly error message
        setApiError(err.message || "Failed to fetch swap history");

        // Keep any existing swaps in the UI rather than clearing them
        if (swaps.length === 0) {
          // Only show error alert if we have no data to display
          Alert.alert(
            "Error Loading Swaps",
            "There was a problem loading your swap history. Please try again later."
          );
        }
      }
    } finally {
      if (isMounted.current) {
        setRefreshing(false);
        setInitialLoading(false);
      }
      isRefreshingRef.current = false;
      hasLoadedInitialDataRef.current = true;
    }
  }, [walletAddress, selectedPastSwap, fetchSwapsWithBirdeye, groupRelatedSwaps, hasBirdeyeApiKey, swaps.length]);

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

    // Set loading states for animation
    if (isMounted.current) {
      setRefreshing(true);
    }

    // Call the refresh function
    await handleRefresh();
  }, [walletAddress, handleRefresh]);

  // Expose the forceRefresh method via ref
  useImperativeHandle(ref, () => ({
    forceRefresh,
  }));

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
      setErrorMsg(''); // Clear any previous errors
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
        message: messageText.trim() || undefined, // Include message if provided
      };

      console.log('[ShareTradeModal] Sharing trade with data:', JSON.stringify(tradeData, null, 2));

      // CRITICAL FIX: Actually call the parent's onShare handler and await its completion
      // Do not close modal until the parent component has processed the data
      if (onShare) {
        // Pass the trade data with the message included
        await onShare(tradeData);
      } else {
        console.error('[ShareTradeModal] No onShare handler provided');
        throw new Error('No onShare handler provided');
      }

      if (isMounted.current) {
        setResultMsg('Trade shared successfully!');

        // Wait a brief moment so user can see success message before closing
        setTimeout(() => {
          // Show a success alert to confirm the action to the user
          Alert.alert(
            'Success',
            'Your trade has been shared to the feed.',
            [
              { text: 'OK', onPress: handleClose }
            ]
          );
        }, 500);
      }
    } catch (err: any) {
      console.error('[handleSharePastSwap] Error =>', err);

      // Determine a user-friendly error message
      const errorMessage = err?.message || 'Failed to share past swap. Please try again.';

      if (isMounted.current) {
        setErrorMsg(errorMessage);

        // Show error alert to make the error visible to the user
        Alert.alert(
          'Error Sharing Trade',
          errorMessage,
          [{ text: 'OK' }]
        );
      }

      TransactionService.showError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [selectedPastSwap, onShare, handleClose, estimateTokenUsdValue, messageText]);

  // Render content based on loading state
  const renderSwapsList = () => {
    if (initialLoading) {
      return <SkeletonSwapList count={7} />;
    }

    if (refreshing) {
      return <SkeletonSwapList count={7} />;
    }

    // Show API error state
    if (apiError && swaps.length === 0) {
      return (
        <View style={styles.emptySwapsList}>
          <View style={[styles.emptySwapsIcon, { backgroundColor: COLORS.errorRed }]}>
            <FontAwesome5 name="exclamation-triangle" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.emptySwapsText}>Error Loading Swaps</Text>
          <Text style={styles.emptySwapsSubtext}>
            {apiError}
          </Text>
          <TouchableOpacity
            style={styles.emptyStateRefreshButton}
            onPress={forceRefresh}
            disabled={refreshing}>
            <FontAwesome5 name="sync-alt" size={12} color={COLORS.white} />
            <Text style={styles.emptyStateRefreshText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (swaps.length === 0) {
      return (
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
      );
    }

    return (
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

            // Add SEND token logo
            if (token.symbol === 'SEND') {
              return 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SEDDd5UrYYCpvi9ajsuhbahTFbmQGCwinRcxpHtZoAd/logo.png';
            }

            // No logo found
            return null;
          };

          // Create a prop object without isMultiHop and hopCount
          const pastSwapProps = {
            swap: item,
            onSelect: handlePastSwapSelected,
            selected: selectedPastSwap?.uniqueId === item.uniqueId,
            inputTokenLogoURI: getTokenLogoUrl(item.inputToken),
            outputTokenLogoURI: getTokenLogoUrl(item.outputToken)
          };

          return (
            <TouchableOpacity
              style={styles.swapItemContainer}
              onPress={() => handlePastSwapSelected(item)}
              activeOpacity={0.7}
            >
              <PastSwapItem
                {...pastSwapProps}
              />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.uniqueId || `${item.signature}-${Math.random()}`}
        contentContainerStyle={styles.swapsList}
        showsVerticalScrollIndicator={true}
        initialNumToRender={5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            <Text style={styles.swapsCountText}>
              {swaps.length} {swaps.length === 1 ? 'swap' : 'swaps'} found
              {apiError ? ' (Error loading more)' : ''}
            </Text>
            <View style={styles.swapsListDivider} />
          </View>
        }
      />
    );
  };

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
                          {renderSwapsList()}
                        </View>

                        {selectedPastSwap && !loading && !initialLoading && !refreshing && (
                          <>
                            {/* Message input field */}
                            <View style={styles.messageInputContainer}>
                              <TextInput
                                style={styles.messageInput}
                                placeholder="Add a message to your trade (optional)"
                                placeholderTextColor={COLORS.accessoryDarkColor}
                                value={messageText}
                                onChangeText={setMessageText}
                                multiline
                                maxLength={280}
                                returnKeyType="done"
                              />
                              {messageText.length > 0 && (
                                <Text style={styles.characterCount}>
                                  {messageText.length}/280
                                </Text>
                              )}
                            </View>

                            <TouchableOpacity
                              style={styles.swapButton}
                              onPress={handleSharePastSwap}>
                              <Text style={styles.swapButtonText}>
                                Share Selected Swap
                              </Text>
                            </TouchableOpacity>
                          </>
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
});

// Also export as default for backward compatibility
export default ShareTradeModal;
