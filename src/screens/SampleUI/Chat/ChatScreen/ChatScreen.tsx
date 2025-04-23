import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ImageSourcePropType,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatComposer, ChatMessage } from '@/core/chat/components';
import { MessageNFT } from '@/core/chat/components/message';
import { MessageData, NFTData } from '@/core/chat/components/message/message.types';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/useReduxHooks';
import { ThreadUser } from '@/core/thread/types';
import { ThreadPost, ThreadSection } from '@/core/thread/components/thread.types';
import { DEFAULT_IMAGES } from '@/config/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles as baseStyles, TAB_BAR_HEIGHT } from './ChatScreen.styles';
import Icons from '@/assets/svgs';
import COLORS from '@/assets/colors';
import { fetchAllPosts } from '@/shared/state/thread/reducer';
import TokenDetailsDrawer from '@/core/sharedUI/TokenDetailsDrawer/TokenDetailsDrawer';
import { NftListingData, NftDetailsSection, buyNft, buyCollectionFloor } from '@/modules/nft';
import { TransactionService } from '@/modules/walletProviders/services/transaction/transactionService';
import TYPOGRAPHY from '@/assets/typography';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/shared/navigation/RootNavigator';
import { fetchChatMessages, sendMessage, receiveMessage } from '@/shared/state/chat/slice';
import socketService from '@/services/socketService';

// Add these styles before the component
// Create a complete styles object by extending the base styles
const styles = {
  ...baseStyles,
  // Socket status styles
  socketStatusContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  connectedIndicator: {
    backgroundColor: COLORS.brandGreen,
  },
  errorIndicator: {
    backgroundColor: COLORS.brandBlue,
  },
  socketStatusText: {
    color: COLORS.brandGreen,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  socketErrorText: {
    color: COLORS.brandBlue,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 10,
    opacity: 0.7,
    marginLeft: 2,
  },
  offlineBanner: {
    backgroundColor: COLORS.darkerBackground,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.brandBlue,
    alignItems: 'center' as const,
  },
  offlineBannerText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  refreshButton: {
    backgroundColor: COLORS.darkerBackground,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
};

// Add custom styles for NFT message components
const additionalStyles = {
  messageHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  username: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  nftContainer: {
    width: '90%' as any, // Use any to bypass type checking for width
    marginVertical: 6,
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    alignSelf: 'flex-start' as const,
  },
  currentUserNftContainer: {
    alignSelf: 'flex-end' as const,
    borderBottomRightRadius: 4,
  },
  otherUserNftContainer: {
    alignSelf: 'flex-start' as const,
    borderBottomLeftRadius: 4,
  },
  buyButton: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '90%' as any, // Use any to bypass type checking for width
    alignItems: 'center' as const,
    marginTop: 8,
    marginBottom: 10,
    alignSelf: 'center' as const,
  },
  floorButton: {
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '90%' as any, // Use any to bypass type checking for width
    alignItems: 'center' as const,
    marginTop: 8,
    marginBottom: 10,
    alignSelf: 'center' as const,
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
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatScreen'>;

// AI Agent chat configuration
const AI_AGENT = {
  id: 'ai-agent',
  name: 'AI Assistant',
  avatar: DEFAULT_IMAGES.user, // Use a default user image instead of SVG
  initialMessage: "Hey! I'm your AI assistant. I can help you with various tasks like buying/selling tokens, swapping tokens, or providing information about your wallet. How can I assist you today?"
};

/**
 * ChatScreen component for displaying a chat interface with real post data
 */
const ChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();

  // Extract chat parameters from route
  const { chatId = 'global', chatName = 'Global Community', isGroup = true } = route.params || {};

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // State for NFT drawer
  const [showNftDetailsDrawer, setShowNftDetailsDrawer] = useState(false);
  const [selectedNft, setSelectedNft] = useState<{
    mint: string;
    symbol: string;
    name: string;
    logoURI: string;
    nftData?: any;
  } | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // State for NFT buying
  const [nftLoading, setNftLoading] = useState(false);
  const [nftStatusMsg, setNftStatusMsg] = useState('');
  const [loadingFloor, setLoadingFloor] = useState(false);

  // State for message loading
  const [loading, setLoading] = useState(true);

  // Socket connection status
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Get user info and wallet 
  const { address, publicKey, sendTransaction } = useWallet();
  const auth = useAppSelector(state => state.auth);

  // Get chat messages from Redux
  const chatMessages = useAppSelector(state => state.chat.messages[chatId] || []);
  const isLoadingMessages = useAppSelector(state => state.chat.loadingMessages);
  const chatError = useAppSelector(state => state.chat.error);

  // Get posts from the thread reducer for global chat
  const allPosts = useAppSelector(state => state.thread.allPosts);
  const [globalMessages, setGlobalMessages] = useState<ThreadPost[]>([]);

  // Check if this is the AI Agent chat
  const isAIAgentChat = chatId === AI_AGENT.id;

  // Handle back button press
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Format current user info for ChatComposer
  const currentUser: ThreadUser = {
    id: address || 'unknown-user',
    username: auth.username || 'Anonymous',
    handle: auth.username || 'anonymous',
    avatar: auth.profilePicUrl ? { uri: auth.profilePicUrl } : DEFAULT_IMAGES.user as ImageSourcePropType,
    verified: false,
  };

  // Connect to WebSocket with retry logic
  const connectToSocket = useCallback(async () => {
    // Skip for global chat and AI agent chat
    if (chatId === 'global' || chatId === AI_AGENT.id || !address) {
      return;
    }

    try {
      setIsRetrying(true);
      // Initialize socket for user
      const connected = await socketService.initSocket(address);

      if (connected) {
        // Join the chat room
        socketService.joinChat(chatId);
        console.log(`Successfully connected to chat ${chatId} via WebSocket`);
        setSocketConnected(true);
        setSocketError(null);
      } else {
        // Handle WebSocket connection failure
        console.warn('WebSocket connection failed, falling back to polling');
        setSocketConnected(false);
        setSocketError('Unable to establish real-time connection');
      }
    } catch (error: any) {
      console.error('WebSocket connection error:', error);
      setSocketConnected(false);
      setSocketError(error.message || 'Connection error');
    } finally {
      setIsRetrying(false);
    }
  }, [chatId, address]);

  // Connect to WebSocket
  useEffect(() => {
    // Skip for global chat since it uses posts
    if (chatId !== 'global' && chatId !== AI_AGENT.id && address) {
      // Set a flag to track initial connection
      let isInitialConnection = true;

      const connectAndJoinChat = async () => {
        try {
          // Connect to socket
          await connectToSocket();

          if (socketConnected) {
            // Explicitly leave and rejoin the chat to ensure clean state
            socketService.leaveChat(chatId);
            setTimeout(() => {
              socketService.joinChat(chatId);
              console.log(`Explicitly rejoined chat ${chatId}`);
            }, 300);
          }
        } catch (error) {
          console.error('Error connecting to socket:', error);
        } finally {
          isInitialConnection = false;
        }
      };

      connectAndJoinChat();

      // Set up a periodic check to ensure connection is maintained
      const connectionInterval = setInterval(() => {
        if (!socketConnected && address) {
          console.log('Connection check: attempting reconnect');
          connectAndJoinChat();
        }
      }, 10000); // Check every 10 seconds

      // Clean up when leaving the screen
      return () => {
        clearInterval(connectionInterval);
        if (socketConnected) {
          socketService.leaveChat(chatId);
          console.log(`Left chat ${chatId} when unmounting`);
          // Don't disconnect completely as the socket might be needed elsewhere
        }
      };
    }
  }, [chatId, address, connectToSocket, socketConnected]);

  // Fetch messages when entering the screen
  useEffect(() => {
    setLoading(true);

    if (chatId === 'global') {
      // For Global chat, fetch posts
      dispatch(fetchAllPosts())
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else if (chatId === AI_AGENT.id) {
      // For AI Agent chat, don't fetch messages from DB
      setLoading(false);
    } else if (address) {
      // For real chats, fetch messages
      dispatch(fetchChatMessages({ chatId }))
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [dispatch, chatId, address]);

  // Process posts and convert to chat messages format for global chat
  useEffect(() => {
    if (chatId === 'global' && allPosts.length > 0) {
      // Filter out retweets and keep only original posts and comments
      const filteredPosts = allPosts.filter(post =>
        !post.retweetOf || (post.retweetOf && post.sections && post.sections.length > 0) // Keep quote retweets
      );

      // Sort by creation date for proper chat chronology
      const sortedPosts = [...filteredPosts].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setGlobalMessages(sortedPosts);
    }
  }, [allPosts, chatId]);

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Modify handleMessageSent to handle AI Agent chat
  const handleMessageSent = useCallback((content: string, imageUrl?: string) => {
    if (!address || (!content.trim() && !imageUrl)) return;

    // For AI Agent chat, don't actually send a message
    if (isAIAgentChat) {
      // You could implement AI response logic here in the future
      Alert.alert('AI Assistant', 'This is a demo AI assistant. In a real app, this would connect to an AI service to process your message.');
      return;
    }

    if (chatId === 'global') {
      // For global chat, we'd normally create a post
      // For now, just show a notification since global chat is read-only
      Alert.alert('Global Chat', 'Global chat messages are currently shown as posts. To create a post, use the Post button in the feed.');
      return;
    }

    // Create message object with all required fields
    const messagePayload = {
      chatId: chatId,  // Explicitly include chatId
      chat_room_id: chatId,  // Add this too for API compatibility
      userId: address,
      senderId: address,
      sender_id: address,
      content: content.trim(),
      imageUrl: imageUrl, // Include image URL if provided
      timestamp: new Date().toISOString(),
    };

    // Send message via Redux (which will send to API)
    dispatch(sendMessage({
      chatId,
      userId: address,
      content: content.trim(),
      imageUrl: imageUrl, // Include image URL if provided
    })).then((resultAction) => {
      if (sendMessage.fulfilled.match(resultAction)) {
        // Message sent successfully to the API
        console.log("Message sent successfully via API, payload:", resultAction.payload);

        // If socket connected, send via socket for real-time updates
        if (socketConnected) {
          // Send via WebSocket for real-time display with API response data
          socketService.sendMessage(chatId, {
            ...resultAction.payload,
            senderId: address, // Make sure this matches the ID used in socketService.initSocket()
            chatId: chatId,    // Explicitly include chatId
          });
        } else {
          // If not connected via socket, add the message to the local state immediately
          // so users don't have to wait for a refresh
          dispatch(receiveMessage(resultAction.payload));
        }

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else if (sendMessage.rejected.match(resultAction)) {
        // Handle error
        console.error('Failed to send message:', resultAction.payload);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    });
  }, [chatId, address, dispatch, isAIAgentChat, socketConnected]);

  // Modify the scroll to bottom effect
  useEffect(() => {
    if ((chatId === 'global' && globalMessages.length > 0) ||
      (chatId !== 'global' && chatMessages.length > 0) ||
      isAIAgentChat) {
      // Use a longer timeout to ensure the list has fully rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 500);
    }
  }, [globalMessages, chatMessages, chatId, isAIAgentChat]);

  // Handle retry for socket connection
  const handleRetryConnection = useCallback(() => {
    if (isRetrying) return;
    connectToSocket();
  }, [connectToSocket, isRetrying]);

  // Handle opening NFT details drawer
  const handleOpenNftDetails = useCallback((nftData: NFTData & { isCollection?: boolean, collId?: string }) => {
    setDrawerLoading(true);

    // Check if this is a collection or regular NFT
    const isCollection = (nftData as any).isCollection && (nftData as any).collId;

    setSelectedNft({
      mint: isCollection ? (nftData as any).collId || '' : nftData.mintAddress || '',
      symbol: '',
      name: nftData.name || 'NFT',
      logoURI: nftData.image || '',
      nftData: {
        name: nftData.name,
        imageUri: nftData.image,
        description: nftData.description,
        collName: nftData.collectionName,
        isCollection: isCollection,
        collId: isCollection ? (nftData as any).collId : undefined
      }
    });

    // Short timeout to ensure smoother opening experience
    setTimeout(() => {
      setDrawerLoading(false);
      setShowNftDetailsDrawer(true);
    }, 300);
  }, []);

  // Handle buying an NFT
  const handleBuyNft = useCallback(async (mintAddress: string, owner?: string, priceSol?: number) => {
    if (!mintAddress) {
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

      // Use estimated price if not provided
      const price = priceSol || 0.1;
      const ownerAddress = owner || "";

      const signature = await buyNft(
        address,
        mintAddress,
        price,
        ownerAddress,
        sendTransaction,
        status => setNftStatusMsg(status)
      );

      Alert.alert('Success', 'NFT purchased successfully!');

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
  }, [address, publicKey, sendTransaction]);

  // Handle buying a collection floor NFT
  const handleBuyCollectionFloor = useCallback(async (collId: string, collectionName?: string) => {
    if (!collId) {
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
        collId,
        sendTransaction,
        status => setNftStatusMsg(status)
      );

      Alert.alert(
        'Success',
        `Successfully purchased floor NFT from ${collectionName || 'collection'}!`
      );

      // Show success notification
      TransactionService.showSuccess(signature, 'nft');
    } catch (err: any) {
      console.error('Error during buy floor transaction:', err);
      TransactionService.showError(err);
    } finally {
      setNftLoading(false);
      setLoadingFloor(false);
      setNftStatusMsg('');
    }
  }, [address, publicKey, sendTransaction]);

  // Function to check if a post has NFT listing section
  const hasNftListingSection = (post: ThreadPost) => {
    if (post.sections) {
      return post.sections.some(section => section.type === 'NFT_LISTING' && section.listingData);
    }
    return false;
  };

  // Function to extract NFT data from post sections
  const getNftDataFromSections = (post: ThreadPost) => {
    if (post.sections) {
      const nftSection = post.sections.find(section =>
        section.type === 'NFT_LISTING' && section.listingData
      );

      if (nftSection?.listingData) {
        // Get the raw listing data without type conversion
        const listingData = nftSection.listingData;

        // Use explicit extraction to ensure we get all the fields correctly
        return {
          id: listingData.mint || nftSection.id || 'unknown-nft',
          name: listingData.name || 'NFT',
          description: listingData.collectionDescription || listingData.name || '',
          image: listingData.image || '',
          collectionName: listingData.collectionName || '',
          mintAddress: listingData.mint || '', // This is critical - make sure we get the mint address
          isCollection: listingData.isCollection || false,
          collId: listingData.collId || ''
        };
      }
    }
    return null;
  };

  // Function to convert thread NftListingData to the module's NftListingData type
  const convertToNftListingData = (threadListingData: any): NftListingData => {
    return {
      ...threadListingData,
      owner: threadListingData.owner || undefined,
    };
  };

  // Get messages to display based on chat type
  const getMessagesToDisplay = () => {
    // For AI Agent chat, return a hardcoded message
    if (isAIAgentChat) {
      return [{
        id: 'ai-msg-1',
        user: {
          id: 'ai-agent',
          username: 'AI Assistant',
          avatar: AI_AGENT.avatar
        },
        text: AI_AGENT.initialMessage,
        createdAt: new Date().toISOString(),
      }];
    }

    if (chatId === 'global') {
      return globalMessages;
    } else {
      // Convert chat messages to a format compatible with the message renderer
      return chatMessages.map(msg => ({
        id: msg.id,
        user: {
          id: msg.sender_id,
          username: msg.sender?.username || 'User',
          avatar: msg.sender?.profile_picture_url
            ? { uri: msg.sender.profile_picture_url }
            : DEFAULT_IMAGES.user,
        },
        text: msg.content,
        image_url: msg.image_url, // Pass the image URL to the component
        createdAt: msg.created_at,
      }));
    }
  };

  // Render message with ChatMessage component
  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.user.id === currentUser.id;

    // Show header only for the first message from a user in a sequence
    const messages = getMessagesToDisplay();
    const index = messages.findIndex(msg => msg.id === item.id);
    const previousMessage = index > 0 ? messages[index - 1] : null;

    // Show header if this is the first message or if previous message is from a different user
    const showHeader = !previousMessage || previousMessage.user.id !== item.user.id;

    // Check if this is a reply/comment to another post (only for global chat)
    const isReply = chatId === 'global' && item.parentId != null && item.parentId !== '';

    // Check if this message has NFT data (only for global chat)
    const isNftMessage = chatId === 'global' && hasNftListingSection(item);

    if (isNftMessage && chatId === 'global') {
      // Find the NFT listing section
      const nftSection = item.sections.find((section: ThreadSection) =>
        section.type === 'NFT_LISTING' && section.listingData
      );

      if (nftSection?.listingData) {
        // Convert to the format expected by NftDetailsSection
        const convertedListingData = convertToNftListingData(nftSection.listingData);

        // Check if this is a collection
        const isCollection = convertedListingData.isCollection && convertedListingData.collId;

        // Option 2: Use NftDetailsSection directly like SectionNftListing does
        return (
          <View style={[
            styles.messageWrapper,
            isReply && styles.replyMessageWrapper
          ]}>
            {isReply && <View style={styles.replyIndicator} />}
            {showHeader && (
              <View style={additionalStyles.messageHeader}>
                <View style={additionalStyles.avatarContainer}>
                  <Image
                    source={item.user.avatar || DEFAULT_IMAGES.user}
                    style={additionalStyles.avatar}
                  />
                </View>
                <Text style={additionalStyles.username}>{item.user.username}</Text>
              </View>
            )}

            <View style={[
              additionalStyles.nftContainer,
              isCurrentUser ? additionalStyles.currentUserNftContainer : additionalStyles.otherUserNftContainer
            ]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  // Use the same handler that TokenDetailsDrawer uses
                  if (convertedListingData.mint || (isCollection && convertedListingData.collId)) {
                    const nftDataForDrawer = {
                      id: convertedListingData.mint || convertedListingData.collId || '',
                      name: convertedListingData.name || 'NFT',
                      description: convertedListingData.collectionDescription || '',
                      image: convertedListingData.image || '',
                      collectionName: convertedListingData.collectionName || '',
                      mintAddress: convertedListingData.mint || ''
                    };

                    // Pass additional data for the drawer via custom attributes
                    (nftDataForDrawer as any).isCollection = convertedListingData.isCollection;
                    (nftDataForDrawer as any).collId = convertedListingData.collId;

                    handleOpenNftDetails(nftDataForDrawer);
                  }
                }}
              >
                <NftDetailsSection
                  listingData={convertedListingData}
                  containerStyle={{ borderWidth: 0, backgroundColor: 'transparent' }}
                />
              </TouchableOpacity>

              {/* Add Buy NFT/Collection Floor button */}
              {isCollection ? (
                <TouchableOpacity
                  style={[
                    additionalStyles.floorButton,
                    (nftLoading || loadingFloor) && additionalStyles.disabledButton
                  ]}
                  onPress={() => handleBuyCollectionFloor(
                    convertedListingData.collId || '',
                    convertedListingData.collectionName
                  )}
                  disabled={nftLoading || loadingFloor}
                  activeOpacity={0.8}
                >
                  <Text style={additionalStyles.buyButtonText}>
                    {loadingFloor ? 'Finding Floor...' : 'Buy Floor NFT'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    additionalStyles.buyButton,
                    nftLoading && additionalStyles.disabledButton
                  ]}
                  onPress={() => handleBuyNft(
                    convertedListingData.mint || '',
                    convertedListingData.owner,
                    convertedListingData.priceSol
                  )}
                  disabled={nftLoading}
                  activeOpacity={0.8}
                >
                  <Text style={additionalStyles.buyButtonText}>Buy NFT</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }
    }

    // For regular messages, use ChatMessage component
    return (
      <View style={[
        styles.messageWrapper,
        isReply && styles.replyMessageWrapper
      ]}>
        {isReply && <View style={styles.replyIndicator} />}
        <ChatMessage
          message={item}
          currentUser={currentUser}
          onPressMessage={(message) => {
            // Handle message press - for NFT messages we open the drawer
            if (chatId === 'global' && hasNftListingSection(message as ThreadPost)) {
              const nftData = getNftDataFromSections(message as ThreadPost);
              if (nftData) {
                handleOpenNftDetails(nftData);
              }
            } else if ('nftData' in message && message.nftData) {
              // Handle direct NFT data if present (from MessageData type)
              handleOpenNftDetails(message.nftData);
            } else {
              // In a production app, this would navigate to post details
              console.log('Message pressed:', message.id);
            }
          }}
          showHeader={showHeader}
          showFooter={true}
        />
      </View>
    );
  };

  // Dismiss keyboard when tapping on the message list
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Calculate members count for group chats
  const getMembersCount = () => {
    // This is just a mock for now - in a real app this would come from the server
    if (chatId === 'global') return '128 members';
    if (chatId === 'solana-devs') return '43 members';
    if (chatId === 'defi-group') return '67 members';
    return isGroup ? 'Group chat' : '';
  };

  // Render socket status indicator
  const renderSocketStatus = () => {
    if (chatId === 'global' || chatId === AI_AGENT.id) {
      return null; // No socket needed for these chats
    }

    if (socketConnected) {
      return (
        <View style={styles.socketStatusContainer}>
          <View style={[styles.statusIndicator, styles.connectedIndicator]} />
          <Text style={styles.socketStatusText}>Live</Text>
        </View>
      );
    }

    if (socketError) {
      return (
        <TouchableOpacity
          style={styles.socketStatusContainer}
          onPress={handleRetryConnection}
          disabled={isRetrying}
        >
          <View style={[styles.statusIndicator, styles.errorIndicator]} />
          <Text style={styles.socketErrorText}>
            {isRetrying ? 'Connecting...' : 'Offline'}
          </Text>
          {!isRetrying && (
            <Text style={styles.retryText}>Tap to retry</Text>
          )}
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header with Gradient Border - updated to include back button and chat name */}
      <View style={styles.headerContainer}>
        {/* Left: Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icons.ArrowLeft width={20} height={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Center: Chat Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{chatName}</Text>
          {isGroup && (
            <Text style={styles.subtitleText}>{getMembersCount()}</Text>
          )}
        </View>

        {/* Right: Icons and socket status */}
        <View style={styles.iconsContainer}>
          {/* {renderSocketStatus()} */}
          <TouchableOpacity style={styles.iconButton}>
            <Icons.copyIcon width={16} height={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icons.walletIcon width={35} height={35} />
          </TouchableOpacity>
        </View>

        {/* Bottom gradient border */}
        <LinearGradient
          colors={['transparent', COLORS.lightBackground]}
          style={styles.headerBottomGradient}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardAvoidingContainer}>

        <View style={styles.innerContainer}>
          {loading || isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : chatError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{chatError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => dispatch(fetchChatMessages({ chatId }))}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : getMessagesToDisplay().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={getMessagesToDisplay()}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={[
                styles.messagesContainer,
                { paddingBottom: 10 }
              ]}
              scrollEnabled={true}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
              onLayout={() => {
                // Scroll to end when layout is complete
                flatListRef.current?.scrollToEnd({ animated: false });
              }}
            />
          )}

          {!socketConnected && chatId !== 'global' && chatId !== AI_AGENT.id && socketError && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineBannerText}>
                Offline mode - Messages will send but you won't see new messages until you refresh
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
                  dispatch(fetchChatMessages({ chatId }));
                  handleRetryConnection();
                }}
                disabled={isRetrying}
              >
                <Text style={styles.refreshButtonText}>
                  {isRetrying ? 'Connecting...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Chat composer with bottom padding for tab bar */}
          <View style={styles.composerContainer}>
            <ChatComposer
              currentUser={currentUser}
              onMessageSent={handleMessageSent}
            />
            {!keyboardVisible && (
              <View style={[styles.tabBarSpacer, { height: 20 }]} />
            )}
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* NFT Details Drawer */}
      {selectedNft && (
        <TokenDetailsDrawer
          visible={showNftDetailsDrawer}
          onClose={() => setShowNftDetailsDrawer(false)}
          tokenMint={selectedNft.mint || ''}
          initialData={{
            ...selectedNft,
            isCollection: selectedNft.nftData?.isCollection || false
          }}
          loading={drawerLoading}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;
