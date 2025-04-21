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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatComposer, ChatMessage } from '@/core/chat/components';
import { MessageData } from '@/core/chat/components/message/message.types';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/useReduxHooks';
import { ThreadUser } from '@/core/thread/types';
import { ThreadPost } from '@/core/thread/components/thread.types';
import { DEFAULT_IMAGES } from '@/config/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, TAB_BAR_HEIGHT } from './ChatScreen.styles';
import Icons from '@/assets/svgs';
import COLORS from '@/assets/colors';
import { fetchAllPosts } from '@/shared/state/thread/reducer';

/**
 * ChatScreen component for displaying a chat interface with real post data
 */
const ChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Get user info
  const { address } = useWallet();
  const auth = useAppSelector(state => state.auth);
  
  // Get posts from the thread reducer to use as messages
  const allPosts = useAppSelector(state => state.thread.allPosts);
  const [messages, setMessages] = useState<ThreadPost[]>([]);

  // Format current user info for ChatComposer
  const currentUser: ThreadUser = {
    id: address || 'unknown-user',
    username: auth.username || 'Anonymous',
    handle: auth.username || 'anonymous',
    avatar: auth.profilePicUrl ? { uri: auth.profilePicUrl } : DEFAULT_IMAGES.user as ImageSourcePropType,
    verified: false,
  };
  
  // Fetch posts on mount to use as messages
  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  // Process posts and convert to chat messages format
  useEffect(() => {
    if (allPosts.length > 0) {
      // Filter out retweets and keep only original posts and comments
      const filteredPosts = allPosts.filter(post => 
        !post.retweetOf || (post.retweetOf && post.sections && post.sections.length > 0) // Keep quote retweets
      );
      
      // Sort by creation date for proper chat chronology
      const sortedPosts = [...filteredPosts].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedPosts);
    }
  }, [allPosts]);
  
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

  // Handle new message sent
  const handleMessageSent = useCallback(() => {
    // In a real app, this would handle the actual message sending
    // For now, we'll just scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Scroll to bottom on initial render and when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [messages]);

  // Render message with ChatMessage component
  const renderMessage = ({ item }: { item: ThreadPost }) => {
    const isCurrentUser = item.user.id === currentUser.id;
    
    // Show header only for the first message from a user in a sequence
    const index = messages.findIndex(msg => msg.id === item.id);
    const previousMessage = index > 0 ? messages[index - 1] : null;
    
    // Show header if this is the first message or if previous message is from a different user
    const showHeader = !previousMessage || previousMessage.user.id !== item.user.id;
    
    // Check if this is a reply/comment to another post
    const isReply = item.parentId != null && item.parentId !== '';
    
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
            // In a production app, this would navigate to post details
            console.log('Message pressed:', message.id);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Gradient Border - similar to SwapScreen and ModulesScreen */}
      <View style={styles.headerContainer}>
        {/* Left: Placeholder (empty) */}
        <View style={styles.leftPlaceholder} />

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Chat</Text>
        </View>

        {/* Right: Copy and Wallet Icons */}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardAvoidingContainer}>
        
        <View style={styles.innerContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messagesContainer,
              { paddingBottom: 20 }
            ]}
            scrollEnabled={true}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          />
          
          {/* Chat composer with bottom padding for tab bar */}
          <View style={styles.composerContainer}>
            <ChatComposer
              currentUser={currentUser}
              onMessageSent={handleMessageSent}
            />
            {!keyboardVisible && (
              <View style={[styles.tabBarSpacer, { height: TAB_BAR_HEIGHT }]} />
            )}
          </View>
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
