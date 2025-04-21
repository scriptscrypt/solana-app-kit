import {StyleSheet, Platform, Dimensions} from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Get screen width for responsive sizing
const screenWidth = Dimensions.get('window').width;

export const chatBodyOverrides = StyleSheet.create({
  extraContentContainer: {
    marginVertical: 2,
    width: '100%',
  },
  threadItemText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    flexWrap: 'wrap',
  },
  // Trade card specific overrides to prevent overflow
  tradeCardContainer: {
    width: '100%',
    padding: 0,
    marginBottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tradeCardCombinedSides: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  // Hide token symbol in price display
  tradeCardSolPrice: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
  },
  // LineGraph container styling
  threadPostCTAContainer: {
    width: '100%',
    marginTop: 2,
  },
  // Ensure any images/media in the chat have proper constraints
  threadItemImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5,
    borderRadius: 12,
    marginTop: 6,
  },
});

// Dark theme color palette for chat
const colors = {
  background: COLORS.background,
  sentBubble: COLORS.brandPurpleBg,
  receivedBubble: COLORS.lighterBackground,
  primaryText: COLORS.white,
  secondaryText: COLORS.greyMid,
  border: COLORS.borderDarkColor,
  accentLight: COLORS.lighterBackground,
  accent: COLORS.brandPrimary,
  chartBackground: COLORS.lightBackground,
};

export const styles = StyleSheet.create({
  chatScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  messageWrapper: {
    marginVertical: 8,
    maxWidth: '90%', // Wider to accommodate TradeCard charts
  },

  receivedWrapper: {
    alignSelf: 'flex-start',
  },
  sentWrapper: {
    alignSelf: 'flex-end',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingLeft: 2,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  usernameContainer: {
    justifyContent: 'center',
  },
  senderLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
  },

  /* BUBBLE */
  bubbleContainer: {
    borderRadius: 18,
    padding: 12,
    paddingBottom: 8, // Less padding at bottom for timestamps
    minWidth: 60,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    overflow: 'hidden', // Ensure content doesn't overflow bubble
  },
  receivedBubble: {
    backgroundColor: colors.receivedBubble,
    borderTopLeftRadius: 4,
    marginLeft: 4,
  },
  sentBubble: {
    backgroundColor: colors.sentBubble,
    borderTopRightRadius: 4,
  },

  timeStampText: {
    fontSize: TYPOGRAPHY.size.xs - 2,
    color: colors.secondaryText,
    marginTop: 6,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },

  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12, 
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, // More padding on iOS for better spacing
    backgroundColor: COLORS.darkerBackground,
  },
  
  quoteReplyButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  quoteReplyText: {
    color: COLORS.brandPrimary,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
    textAlign: 'center',
  },

  // Styles for quoted replies in messages
  quotedContentContainer: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.9,
    maxWidth: '100%',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brandPrimary,
  },
  
  // Custom styles for charts in messages
  chartContainer: {
    backgroundColor: colors.chartBackground,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
    width: '100%',
  },
  
  // Trade button in chat
  tradeButton: {
    backgroundColor: COLORS.brandPrimary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
    marginTop: 8,
  },
  tradeButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
    textAlign: 'center',
  },
});

export const androidStyles = StyleSheet.create({
  safeArea: {
    paddingTop: 50,
    backgroundColor: COLORS.background,
  },
});
