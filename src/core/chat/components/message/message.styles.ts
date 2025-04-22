import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Define common types to be used
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type FlexJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type Overflow = 'visible' | 'hidden' | 'scroll';

export const getMessageBaseStyles = () => ({
  // Message container
  messageContainer: {
    width: '100%' as const,
    marginBottom: 12,
  },
  currentUserMessageContainer: {
    alignItems: 'flex-end' as FlexAlign,
  },
  otherUserMessageContainer: {
    alignItems: 'flex-start' as FlexAlign,
  },
  
  // Message bubble
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%' as const,
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
    flexDirection: 'row' as FlexDirection,
    alignItems: 'center' as FlexAlign,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row' as FlexDirection,
    alignItems: 'center' as FlexAlign,
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
    flexDirection: 'row' as FlexDirection,
    justifyContent: 'flex-end' as FlexJustify,
    alignItems: 'center' as FlexAlign,
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
    overflow: 'hidden' as Overflow,
  },
  mediaImage: {
    width: '100%' as const,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  
  // Special content types
  specialContentContainer: {
    maxWidth: '90%' as const,
    width: '90%' as const,
    borderRadius: 16,
    overflow: 'hidden' as Overflow,
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
    overflow: 'hidden' as Overflow,
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
export const messageBubbleStyles = StyleSheet.create<{
  container: ViewStyle;
  currentUser: ViewStyle;
  otherUser: ViewStyle;
  text: TextStyle;
  otherUserText: TextStyle;
  mediaContainer: ViewStyle;
  mediaImage: ImageStyle;
  specialContentContainer: ViewStyle;
}>({
  container: getMessageBaseStyles().messageBubble as ViewStyle,
  currentUser: getMessageBaseStyles().currentUserBubble as ViewStyle,
  otherUser: getMessageBaseStyles().otherUserBubble as ViewStyle,
  text: getMessageBaseStyles().messageText as TextStyle,
  otherUserText: getMessageBaseStyles().otherUserMessageText as TextStyle,
  mediaContainer: getMessageBaseStyles().mediaContainer as ViewStyle,
  mediaImage: getMessageBaseStyles().mediaImage as ImageStyle,
  specialContentContainer: getMessageBaseStyles().specialContentContainer as ViewStyle,
});

export const messageHeaderStyles = StyleSheet.create<{
  container: ViewStyle;
  left: ViewStyle;
  avatar: ImageStyle;
  username: TextStyle;
}>({
  container: getMessageBaseStyles().headerContainer as ViewStyle,
  left: getMessageBaseStyles().headerLeft as ViewStyle,
  avatar: getMessageBaseStyles().avatar as ImageStyle,
  username: getMessageBaseStyles().username as TextStyle,
});

export const messageFooterStyles = StyleSheet.create<{
  container: ViewStyle;
  timestamp: TextStyle;
  currentUserTimestamp: TextStyle;
  readStatus: ViewStyle;
}>({
  container: getMessageBaseStyles().footerContainer as ViewStyle,
  timestamp: getMessageBaseStyles().timestamp as TextStyle,
  currentUserTimestamp: getMessageBaseStyles().currentUserTimestamp as TextStyle,
  readStatus: getMessageBaseStyles().readStatus as ViewStyle,
}); 