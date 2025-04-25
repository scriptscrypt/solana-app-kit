import { StyleSheet, Dimensions } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

const { width, height } = Dimensions.get('window');

// Calculate tab bar height for padding
export const TAB_BAR_HEIGHT = 20;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header styles similar to SwapScreen and Modules
  headerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
    position: 'relative' as const,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  leftPlaceholder: {
    width: 30,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center' as const,
  },
  titleText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
  },
  subtitleText: {
    color: COLORS.greyMid,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: 2,
  },
  iconsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconButton: {
    marginLeft: 10,
  },
  headerBottomGradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: -1,
    height: 1,
  },
  // End of header styles
  
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column' as const,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.greyMid,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
  },
  emptySubtext: {
    color: COLORS.greyMid,
    marginTop: 8,
  },
  composerContainer: {
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDarkColor,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  currentUserBubble: {
    backgroundColor: COLORS.brandBlue,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: COLORS.darkerBackground,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.size.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  tabBarSpacer: {
    width: '100%',
  },
  // Reply styling
  messageWrapper: {
    marginBottom: 8,
    position: 'relative' as const,
  },
  replyMessageWrapper: {
    marginLeft: 16,
  },
  replyIndicator: {
    position: 'absolute' as const,
    left: -10,
    top: 10,
    width: 2,
    height: '80%',
    backgroundColor: COLORS.borderDarkColor,
    borderRadius: 1,
  },
  // Error handling styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: TYPOGRAPHY.size.md,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.brandPrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
  },
  // Decorative elements
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(50, 212, 222, 0.1)',
    top: -50,
    left: -50,
    opacity: 0.5,
  },
  decorCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(181, 145, 255, 0.04)',
    bottom: 100,
    right: -100,
  },
  glow1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: height * 0.3,
    left: -width * 0.2,
  },
});
