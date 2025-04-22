import { StyleSheet } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Tab bar height constant
export const TAB_BAR_HEIGHT = 80;

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative' as const,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
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
    fontWeight: 'bold' as const,
  },
  subtitleText: {
    color: COLORS.lightGrey,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: 2,
  },
  iconsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconButton: {
    marginLeft: 16,
  },
  headerBottomGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
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
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.lightGrey,
    fontSize: TYPOGRAPHY.size.md,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.lg,
    fontFamily: TYPOGRAPHY.fontFamily,
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.lightGrey,
    fontSize: TYPOGRAPHY.size.md,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  composerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
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
    marginBottom: 16,
    position: 'relative' as const,
  },
  replyMessageWrapper: {
    marginLeft: 16,
    paddingLeft: 12,
  },
  replyIndicator: {
    position: 'absolute' as const,
    left: 0,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: COLORS.borderDarkColor,
    borderRadius: 1,
  },
});
