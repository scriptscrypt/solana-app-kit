import { StyleSheet } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

export const getMessageBaseStyles = () => ({
  // Message container
  messageContainer: {
    width: '100%',
    marginBottom: 12,
  },
  currentUserMessageContainer: {
    alignItems: 'flex-end',
  },
  otherUserMessageContainer: {
    alignItems: 'flex-start',
  },
  
  // Message bubble
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  currentUserBubble: {
    backgroundColor: COLORS.brandBlue,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: COLORS.lighterBackground,
    borderBottomLeftRadius: 4,
  },
  
  // Message content
  messageText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.regular),
  },
  otherUserMessageText: {
    color: COLORS.white,
  },
  
  // Message header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  username: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.greyMid,
  },
  
  // Message footer
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.greyMid,
  },
  currentUserTimestamp: {
    color: COLORS.greyLight,
  },
  
  // Media content
  mediaContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  
  // Special content types
  specialContentContainer: {
    maxWidth: '90%',
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 6,
  },
  tradeCardContainer: {
    backgroundColor: COLORS.lighterBackground,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderRadius: 16,
    padding: 10,
  },
  nftContainer: {
    backgroundColor: COLORS.lighterBackground,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Group messages
  messageGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    marginBottom: 8,
  },
  
  // Status indicators
  readStatus: {
    marginLeft: 4,
    opacity: 0.7,
  }
});

// Export individual styles for component reuse
export const messageBubbleStyles = StyleSheet.create({
  container: getMessageBaseStyles().messageBubble,
  currentUser: getMessageBaseStyles().currentUserBubble,
  otherUser: getMessageBaseStyles().otherUserBubble,
  text: getMessageBaseStyles().messageText,
  otherUserText: getMessageBaseStyles().otherUserMessageText,
  mediaContainer: getMessageBaseStyles().mediaContainer,
  mediaImage: getMessageBaseStyles().mediaImage,
  specialContentContainer: getMessageBaseStyles().specialContentContainer,
});

export const messageHeaderStyles = StyleSheet.create({
  container: getMessageBaseStyles().headerContainer,
  left: getMessageBaseStyles().headerLeft,
  avatar: getMessageBaseStyles().avatar,
  username: getMessageBaseStyles().username,
});

export const messageFooterStyles = StyleSheet.create({
  container: getMessageBaseStyles().footerContainer,
  timestamp: getMessageBaseStyles().timestamp,
  currentUserTimestamp: getMessageBaseStyles().currentUserTimestamp,
  readStatus: getMessageBaseStyles().readStatus,
}); 