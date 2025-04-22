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

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatListScreen'>;

// Interface for chat list items
interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: any;
  unreadCount: number;
  isGroup: boolean;
  isOnline?: boolean;
  members?: number;
}

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

/**
 * ChatListScreen component - Entry point for the chat feature
 * Shows available chats and allows searching for users
 */
const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListNavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user data and posts for "real" data
  const auth = useAppSelector(state => state.auth);
  const allPosts = useAppSelector(state => state.thread.allPosts);
  
  // Fetch posts to use in the Global chat
  useEffect(() => {
    dispatch(fetchAllPosts())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [dispatch]);
  
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
  
  // Mock data for chat list with more sample chats
  const [chats, setChats] = useState<ChatItem[]>([
    {
      id: 'global',
      name: 'Global Community',
      lastMessage: "Loading...",
      time: "Now",
      avatar: DEFAULT_IMAGES.groupChat,
      unreadCount: 5,
      isGroup: true,
      members: 128
    },
    {
      id: 'solana-devs',
      name: 'Solana Developers',
      lastMessage: 'Anyone tried the new update?',
      time: '2h',
      avatar: DEFAULT_IMAGES.user2,
      unreadCount: 2,
      isGroup: true,
      members: 43
    },
    {
      id: 'alice',
      name: 'Alice',
      lastMessage: 'Did you see that new NFT drop?',
      time: '3h',
      avatar: DEFAULT_IMAGES.user3,
      unreadCount: 0,
      isOnline: true,
      isGroup: false
    },
    {
      id: 'bob',
      name: 'Bob',
      lastMessage: 'Looking forward to seeing your collection',
      time: 'Yesterday',
      avatar: DEFAULT_IMAGES.user5,
      unreadCount: 0,
      isOnline: false,
      isGroup: false
    },
    {
      id: 'defi-group',
      name: 'DeFi Enthusiasts',
      lastMessage: 'Market is looking good today',
      time: '2d',
      avatar: DEFAULT_IMAGES.user,
      unreadCount: 0,
      isGroup: true,
      members: 67
    }
  ]);
  
  // Update Global chat with real data when available
  useEffect(() => {
    if (allPosts.length > 0) {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === 'global' 
            ? {
                ...chat,
                lastMessage: getGlobalChatLastMessage(),
                time: getGlobalChatTime(),
                unreadCount: Math.min(allPosts.length, 5)
              } 
            : chat
        )
      );
    }
  }, [allPosts, getGlobalChatLastMessage, getGlobalChatTime]);
  
  // Filter chats based on search query
  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;
    
  // Handle chat item press - navigate to ChatScreen
  const handleChatPress = useCallback((chat: ChatItem) => {
    navigation.navigate('ChatScreen', {
      chatId: chat.id,
      chatName: chat.name,
      isGroup: chat.isGroup
    });
  }, [navigation]);
  
  // Handle new chat button press
  const handleNewChat = useCallback(() => {
    // In a real app, this would open a user selection modal
    // For now, let's just show a message
    console.log('Create new chat clicked');
  }, []);
  
  // Render chat list item
  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => handleChatPress(item)}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <Image 
          source={item.avatar} 
          style={styles.avatar} 
          resizeMode="cover" 
        />
        {item.isGroup ? (
          <View style={styles.groupIndicator}>
            <Icons.ProfilePlusIcon width={12} height={12} color={COLORS.white} />
          </View>
        ) : item.isOnline ? (
          <View style={styles.onlineIndicator} />
        ) : null}
      </View>
      
      {/* Chat info */}
      <View style={styles.chatInfo}>
        <View style={styles.chatNameRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.chatName}>{item.name}</Text>
            {item.isGroup && (
              <Text style={styles.memberCount}>{item.members} members</Text>
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
            {item.lastMessage}
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brandBlue} />
            <Text style={styles.loadingText}>Loading chats...</Text>
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