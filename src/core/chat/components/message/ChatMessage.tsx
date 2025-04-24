import React, { useMemo } from 'react';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import { ChatMessageProps } from './message.types';
import { getMessageBaseStyles } from './message.styles';
import { mergeStyles } from '@/core/thread/utils';
import MessageBubble from './MessageBubble';
import MessageHeader from './MessageHeader';
import MessageFooter from './MessageFooter';

// Update ChatMessageProps to include onLongPress
interface ExtendedChatMessageProps extends ChatMessageProps {
  onLongPress?: (event: GestureResponderEvent) => void; // Optional long press handler
}

function ChatMessage({
  message,
  currentUser,
  onPressMessage,
  onLongPress, // Receive the onLongPress prop
  themeOverrides,
  styleOverrides,
  showHeader = true,
  showFooter = true,
}: ExtendedChatMessageProps) {
  // Determine if this message is from the current user
  const isCurrentUser = useMemo(() => {
    // Check multiple properties for sender ID consistency
    return (
      message.user.id === currentUser.id ||
      ('sender_id' in message && message.sender_id === currentUser.id) ||
      ('senderId' in message && message.senderId === currentUser.id)
    );
  }, [message, currentUser.id]);

  // Get base styles
  const baseStyles = getMessageBaseStyles();

  // Use utility function to merge styles
  const styles = mergeStyles(
    baseStyles,
    styleOverrides,
    undefined
  );

  // Determine container style based on sender
  const containerStyle = [
    styles.messageContainer,
    isCurrentUser
      ? styles.currentUserMessageContainer
      : styles.otherUserMessageContainer
  ];

  // Determine content type
  const getContentType = () => {
    // If message has explicit contentType, use it
    if ('contentType' in message && message.contentType) {
      return message.contentType;
    }

    // Determine from message data
    if ('tradeData' in message && message.tradeData) {
      return 'trade';
    } else if ('nftData' in message && message.nftData) {
      return 'nft';
    } else if ('media' in message && message.media && message.media.length > 0) {
      return 'media';
    } else if ('sections' in message) {
      // Check for images in thread post sections using any to avoid TypeScript errors
      const sections = message.sections as any[];
      const hasMedia = sections.some(section =>
        section.image ||
        (section.media && section.media.length > 0) ||
        section.mediaSrc
      );

      if (hasMedia) return 'media';
    }

    // Default to text
    return 'text';
  };

  const contentType = getContentType();

  // Determine if we should show header and footer based on content type
  const shouldShowHeader = useMemo(() => {
    // Always show header for other users' messages if showHeader is true
    if (!isCurrentUser && showHeader) {
      return true;
    }
    return false;
  }, [isCurrentUser, showHeader]);

  // For special content types like NFTs and trades, we might want to show footer
  const shouldShowFooter = useMemo(() => {
    if (!showFooter) return false;

    // For NFT and trade messages, don't show footer
    if (contentType === 'trade' || contentType === 'nft') {
      return false;
    }

    return true;
  }, [showFooter, contentType]);

  return (
    <View style={containerStyle}>
      {/* Only show header for messages from other users */}
      {shouldShowHeader && (
        <MessageHeader
          message={message}
          showAvatar={true}
          onPressUser={user => console.log('User pressed:', user.id)}
        />
      )}

      {/* Use Pressable for better touch handling */}
      <Pressable
        onPress={() => onPressMessage && onPressMessage(message)}
        onLongPress={onLongPress} // Use the passed onLongPress handler
        delayLongPress={500} // Consistent delay
        disabled={!onPressMessage && !onLongPress} // Disable if no handlers
        style={({ pressed }) => [{
          maxWidth: contentType === 'text' || contentType === 'media' ? '80%' : '100%',
          opacity: pressed ? 0.7 : 1,
        }]}
      >
        <MessageBubble
          message={message}
          isCurrentUser={isCurrentUser}
          themeOverrides={themeOverrides}
          styleOverrides={styleOverrides}
        />
      </Pressable>

      {shouldShowFooter && (
        <MessageFooter
          message={message}
          isCurrentUser={isCurrentUser}
        />
      )}
    </View>
  );
}

export default ChatMessage; 