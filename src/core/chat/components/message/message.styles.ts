import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Define common types to be used
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type FlexJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type Overflow = 'visible' | 'hidden' | 'scroll';

export function getMessageBaseStyles() {
  return StyleSheet.create({
    messageContainer: {
      marginBottom: 2,
      marginHorizontal: 10,
      maxWidth: '90%',
    },
    currentUserMessageContainer: {
      alignSelf: 'flex-end',
    },
    otherUserMessageContainer: {
      alignSelf: 'flex-start',
    },
    // Header styles
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
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
      fontWeight: '600',
      color: COLORS.greyLight,
    },
    userInfoContainer: {
      flexDirection: 'column',
    },
    headerTimestamp: {
      fontSize: 10,
      color: COLORS.greyMid,
      marginTop: 0,
    },
    // Footer styles
    footerContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 0,
    },
    timestamp: {
      fontSize: 10,
      color: COLORS.greyMid,
    },
    currentUserTimestamp: {
      color: COLORS.greyLight,
    },
    readStatus: {
      marginLeft: 4,
    },
  });
}

export const messageBubbleStyles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 18,
    marginVertical: 0,
    maxWidth: '100%',
  },
  currentUser: {
    backgroundColor: COLORS.brandBlue,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  otherUser: {
    backgroundColor: COLORS.lighterBackground,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    fontFamily: TYPOGRAPHY.fontFamily,
    lineHeight: 18,
  },
  otherUserText: {
    color: COLORS.white,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.greyMid,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  sectionContainer: {
    marginTop: 6,
    width: '100%',
  },
  messageContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginTop: 6,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageImage: {
    width: 240,
    height: 180,
    borderRadius: 12,
  },
  imageCaption: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.white,
  },
  retweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  retweetText: {
    fontSize: 13,
    color: COLORS.greyMid,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export const messageHeaderStyles = StyleSheet.create<{
  container: ViewStyle;
  left: ViewStyle;
  avatar: ImageStyle;
  username: TextStyle;
  userInfoContainer: ViewStyle;
  headerTimestamp: TextStyle;
}>({
  container: getMessageBaseStyles().headerContainer as ViewStyle,
  left: getMessageBaseStyles().headerLeft as ViewStyle,
  avatar: getMessageBaseStyles().avatar as ImageStyle,
  username: getMessageBaseStyles().username as TextStyle,
  userInfoContainer: getMessageBaseStyles().userInfoContainer as ViewStyle,
  headerTimestamp: getMessageBaseStyles().headerTimestamp as TextStyle,
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