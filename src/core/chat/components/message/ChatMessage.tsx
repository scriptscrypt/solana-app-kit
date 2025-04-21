import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChatMessageProps } from './message.types';
import { getMessageBaseStyles } from './message.styles';
import { mergeStyles } from '@/core/thread/utils';
import MessageBubble from './MessageBubble';
import MessageHeader from './MessageHeader';
import MessageFooter from './MessageFooter';

function ChatMessage({
  message,
  currentUser,
  onPressMessage,
  themeOverrides,
  styleOverrides,
  showHeader = true,
  showFooter = true,
}: ChatMessageProps) {
  // Determine if this message is from the current user
  const isCurrentUser = useMemo(() => {
    return message.user.id === currentUser.id;
  }, [message.user.id, currentUser.id]);

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
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPressMessage && onPressMessage(message)}
        disabled={!onPressMessage}
        style={{ maxWidth: contentType === 'text' || contentType === 'media' ? '80%' : '100%' }}
      >
        <MessageBubble
          message={message}
          isCurrentUser={isCurrentUser}
          themeOverrides={themeOverrides}
          styleOverrides={styleOverrides}
        />
      </TouchableOpacity>
      
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