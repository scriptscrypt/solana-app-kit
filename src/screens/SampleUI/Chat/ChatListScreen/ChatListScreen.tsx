import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/shared/navigation/RootNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_IMAGES } from '@/config/constants';
import Icons from '@/assets/svgs';
import COLORS from '@/assets/colors';
import { styles } from './ChatListScreen.styles';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/useReduxHooks';
import { fetchAllPosts } from '@/shared/state/thread/reducer';
import { fetchUserChats, ChatRoom } from '@/shared/state/chat/slice';
import socketService from '@/services/socketService';

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatListScreen'>;

// Function to format relative time
const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// AI Agent chat hardcoded image and initial message
const AI_AGENT = {
  id: 'ai-agent',
  name: 'AI Assistant',
  avatar: DEFAULT_IMAGES.user, // Use default user image instead of SVG
  initialMessage: "Hey! I'm your AI assistant. I can help you with various tasks like buying/selling tokens, swapping tokens, or providing information about your wallet. How can I assist you today?"
};

/**
 * ChatListScreen component - Entry point for the chat feature
 * Shows available chats and allows searching for users
 */
const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListNavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  // Get user data, posts, and chats from redux
  const auth = useAppSelector(state => state.auth);
  const userId = auth.address || '';
  const allPosts = useAppSelector(state => state.thread.allPosts);
  const { chats, loadingChats, error } = useAppSelector(state => state.chat);
  const { usersForChat } = useAppSelector(state => state.chat);

  // Local loading state while fetching initial data
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Socket connection
  useEffect(() => {
    if (userId) {
      // Initialize the socket connection
      socketService.initSocket(userId).catch(err => {
        console.error('Failed to initialize socket:', err);
      });

      // Set to persistent mode to keep the connection active between screens
      socketService.setPersistentMode(true);

      // Clean up on unmount - don't fully disconnect, just leave specific rooms if needed
      return () => {
        // We don't disconnect the socket when leaving this screen
        // to keep receiving notifications for all chats
        console.log('Leaving ChatListScreen, but keeping socket connected');
      };
    }
  }, [userId]);

  // Fetch both posts (for global chat) and user's chats
  useEffect(() => {
    setIsLoading(true);

    const loadData = async () => {
      try {
        // Fetch all posts for global chat
        await dispatch(fetchAllPosts()).unwrap();

        // Fetch user's chats if user is authenticated
        if (userId) {
          const chatResponse = await dispatch(fetchUserChats(userId)).unwrap();

          // Join all chat rooms after fetching them
          if (chatResponse && Array.isArray(chatResponse)) {
            // Extract chat IDs
            const chatIds = chatResponse.map(chat => chat.id).filter(Boolean);

            // Join all chat rooms
            if (chatIds.length > 0) {
              console.log('Joining all user chats:', chatIds);
              socketService.joinChats(chatIds);
            }
          }
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
        Alert.alert('Error', 'Failed to load chats. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, userId]);

  // Format most recent post for Global chat preview
  const getGlobalChatLastMessage = useCallback(() => {
    if (allPosts.length === 0) return "Join the community conversation";

    const latestPost = [...allPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return latestPost.user.username + ": " +
      (latestPost.text ?
        (latestPost.text.length > 30 ?
          latestPost.text.substring(0, 30) + '...' :
          latestPost.text) :
        "Shared a post");
  }, [allPosts]);

  const getGlobalChatTime = useCallback(() => {
    if (allPosts.length === 0) return "Now";

    const latestPost = [...allPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return formatRelativeTime(latestPost.createdAt);
  }, [allPosts]);

  // Get total user count - in a real app this would come from the API
  const getTotalUserCount = useCallback(() => {
    // For now we'll use a hard-coded value plus the length of usersForChat
    // In a real app, you'd get this from the API
    return usersForChat.length > 0 ? usersForChat.length : 128;
  }, [usersForChat]);

  // Handle AI agent chat
  const handleAIAgentChat = useCallback(() => {
    navigation.navigate('ChatScreen', {
      chatId: AI_AGENT.id,
      chatName: AI_AGENT.name,
      isGroup: false
    });
  }, [navigation]);

  // Prepare all chats - both API chats and the special global chat
  const prepareChats = useCallback(() => {
    // Create AI Agent chat
    const aiAgentChat = {
      id: AI_AGENT.id,
      name: AI_AGENT.name,
      lastMessage: {
        content: "How can I assist you today?",
        sender: { username: 'AI' },
        created_at: new Date().toISOString(),
      },
      time: 'now',
      type: 'ai' as const,
      is_active: true,
      participants: [],
      created_at: '',
      updated_at: '',
      unreadCount: 0,
      avatar: AI_AGENT.avatar,
    };

    // Create global chat item - commented out as requested
    /*
    const globalChat = {
      id: 'global',
      name: 'Global Community',
      lastMessage: {
        content: getGlobalChatLastMessage(),
        sender: { username: '' },
        created_at: new Date().toISOString(),
      },
      time: getGlobalChatTime(),
      type: 'global' as const,
      is_active: true,
      participants: [],
      created_at: '',
      updated_at: '',
      unreadCount: Math.min(allPosts.length, 5),
      avatar: DEFAULT_IMAGES.groupChat,
      memberCount: getTotalUserCount(), // Add the total user count
    };
    */

    // Filter and format API chats
    const apiChats = chats.map(chat => {
      // Get other participant for direct chats (for name and avatar)
      let chatName = chat.name || '';
      let avatar = DEFAULT_IMAGES.groupChat;

      if (chat.type === 'direct' && chat.participants) {
        const otherParticipant = chat.participants.find(p => p.id !== userId);
        if (otherParticipant) {
          chatName = otherParticipant.username;
          avatar = otherParticipant.profile_picture_url
            ? { uri: otherParticipant.profile_picture_url }
            : DEFAULT_IMAGES.user;
        }
      }

      // Format the last message time
      const time = chat.lastMessage ? formatRelativeTime(chat.lastMessage.created_at) : '';

      // Format last message content
      let lastMessageContent = 'No messages yet';
      if (chat.lastMessage) {
        const sender = chat.lastMessage.sender ? chat.lastMessage.sender.username + ': ' : '';
        lastMessageContent = sender + chat.lastMessage.content;

        // Truncate if too long
        if (lastMessageContent.length > 30) {
          lastMessageContent = lastMessageContent.substring(0, 30) + '...';
        }
      }

      return {
        ...chat,
        name: chatName,
        avatar,
        time,
        lastMessage: {
          ...chat.lastMessage,
          content: lastMessageContent,
        },
      };
    });

    // Return AI Agent first, then other chats (global chat is commented out)
    return [aiAgentChat, ...apiChats];
  }, [chats, userId, allPosts.length, getGlobalChatLastMessage, getGlobalChatTime, getTotalUserCount]);

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? prepareChats().filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : prepareChats();

  // Handle chat item press - navigate to ChatScreen
  const handleChatPress = useCallback((chat: any) => {
    if (chat.id === AI_AGENT.id) {
      handleAIAgentChat();
      return;
    }

    navigation.navigate('ChatScreen', {
      chatId: chat.id,
      chatName: chat.name,
      isGroup: chat.type !== 'direct'
    });
  }, [navigation, handleAIAgentChat]);

  // Handle new chat button press
  const handleNewChat = useCallback(() => {
    if (!userId) {
      Alert.alert('Error', 'You need to connect your wallet to create a chat');
      return;
    }

    navigation.navigate('UserSelectionScreen');
  }, [navigation, userId]);

  // Render chat list item
  const renderChatItem = ({ item }: { item: any }) => {
    // Detect if this is a direct chat
    const isDirect = item.type === 'direct';
    const isAI = item.id === AI_AGENT.id;

    // For direct chats, get online status from the user's is_active property
    let isOnline = false;
    
    // Check if the user is actually online based on is_active property
    if (isDirect && item.participants) {
      const otherParticipant = item.participants.find((p: any) => p.id !== userId);
      if (otherParticipant) {
        isOnline = otherParticipant.is_active === true;
      }
    }

    // Always show AI as online
    if (isAI) {
      isOnline = true;
    }

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.7}
        onPress={() => handleChatPress(item)}
      >
        {/* Avatar with online/group indicator */}
        <View style={styles.avatarContainer}>
          <Image
            source={item.avatar}
            style={styles.avatar}
            resizeMode="cover"
          />
          {!isDirect && !isAI ? (
            <View style={styles.groupIndicator}>
              <Icons.ProfilePlusIcon width={12} height={12} color={COLORS.white} />
            </View>
          ) : isOnline ? (
            <View style={styles.onlineIndicator} />
          ) : null}
        </View>

        {/* Chat info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatNameRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.chatName}>{item.name}</Text>
              {item.id === 'global' ? (
                <Text style={styles.memberCount}>
                  {item.memberCount} members
                </Text>
              ) : item.type !== 'direct' && item.id !== AI_AGENT.id && (
                <Text style={styles.memberCount}>
                  {item.participants ? `${item.participants.length} members` : 'Group chat'}
                </Text>
              )}
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>
          <View style={styles.lastMessageRow}>
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.lastMessage?.content || 'No messages yet'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 65) } // Account for bottom tab bar
      ]}>
        <StatusBar style="light" />

        {/* Header with Gradient Border */}
        <View style={styles.headerContainer}>
          {/* Left: Placeholder (empty) */}
          <View style={styles.leftPlaceholder} />

          {/* Center: Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Messages</Text>
          </View>

          {/* Right: Icons */}
          <View style={styles.iconsContainer}>
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

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icons.searchIcon width={16} height={16} color={COLORS.lightGrey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users or messages"
              placeholderTextColor={COLORS.lightGrey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Icons.cross width={14} height={14} color={COLORS.lightGrey} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Chat list */}
        {isLoading || loadingChats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brandBlue} />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => dispatch(fetchUserChats(userId))}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatListContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start chatting with other users by tapping the button below'}
                </Text>
              </View>
            }
          />
        )}

        {/* Floating action button to start new chat - adjusted for bottom bar */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(24, insets.bottom + 16) }]}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <Icons.MessageIcon width={24} height={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChatListScreen; 