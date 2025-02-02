import {StyleSheet} from 'react-native';
import {THREAD_DEFAULT_THEME} from './thread.theme';

export function getMergedTheme(
  userTheme?: Partial<typeof THREAD_DEFAULT_THEME>,
) {
  return {
    ...THREAD_DEFAULT_THEME,
    ...(userTheme || {}),
  };
}

/**
 * Complete set of thread-related styles, merged from:
 *   1) the default theme
 *   2) optional user-provided theme
 *   3) the base styles below
 *   4) optional userStyleSheet
 *   5) optional override styles
 */
export function createThreadStyles(
  theme: ReturnType<typeof getMergedTheme>,
  overrideStyles?: {[key: string]: object},
  userStyleSheet?: {[key: string]: object},
): {[key: string]: any} {
  const baseStyles: {[key: string]: any} = StyleSheet.create({
    threadRootContainer: {
      backgroundColor: theme['--thread-bg-primary'],
      flex: 1,
    },

    header: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 8,
    },

    divider: {
      height: 1,
      backgroundColor: theme['--thread-border-color'],
      marginVertical: 4,
      width: '90%',
      alignSelf: 'center',
    },

    /* Composer */
    composerContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
      backgroundColor: theme['--thread-composer-bg'],
    },
    composerAvatarContainer: {
      position: 'relative',
      width: theme['--thread-avatar-size'],
      height: theme['--thread-avatar-size'],
      marginRight: 8,
    },
    composerAvatar: {
      width: '100%',
      height: '100%',
      borderRadius: theme['--thread-avatar-size'] / 2,
    },
    plusIconContainer: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      borderRadius: 25,
    },
    composerMiddle: {
      flex: 1,
    },
    composerUsername: {
      fontWeight: '600',
      fontSize: theme['--thread-font-size'],
      marginBottom: 4,
      color: theme['--thread-text-primary'],
    },
    composerInput: {
      borderWidth: 0,
      borderRadius: 8,
      height: 40,
      paddingHorizontal: 1,
      marginBottom: 4,
      fontSize: theme['--thread-font-size'],
      color: theme['--thread-text-primary'],
    },
    iconsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    leftIcons: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },

    /* Thread List Container */
    threadListContainer: {
      paddingBottom: 20,
    },

    /* Single Post Item */
    threadItemContainer: {
      flex: 1,
      paddingHorizontal: theme['--thread-post-padding-horizontal'],
      paddingVertical: theme['--thread-post-padding-vertical'],
      borderBottomWidth: 1,
      borderBottomColor: theme['--thread-post-border-color'],
    },

    // a visual thread line for replies
    threadItemReplyLine: {
      borderLeftWidth: 1,
      borderLeftColor: theme['--thread-reply-line-color'],
      marginLeft: 12,
      paddingLeft: 12,
    },

    threadItemAvatar: {
      width: theme['--thread-avatar-size'],
      height: theme['--thread-avatar-size'],
      borderRadius: theme['--thread-avatar-size'] / 2,
      marginRight: 8,
    },

    replyingContainer: {
      backgroundColor: theme['--thread-replying-bg'],
      padding: theme['--thread-replying-padding'],
      marginVertical: theme['--thread-replying-margin-vertical'],
      borderRadius: theme['--thread-replying-border-radius'],
    },
    replyingText: {
      fontSize: 13,
      color: '#666',
    },
    replyingHandle: {
      color: theme['--thread-link-color'],
      fontWeight: '600',
    },

    /* Post header (username, handle) */
    threadItemHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    threadItemHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
    },
    threadItemUsername: {
      fontWeight: '600',
      fontSize: theme['--thread-font-size'],
      color: theme['--thread-text-primary'],
    },
    threadItemHandleTime: {
      fontSize: 12,
      color: '#999',
    },
    verifiedIcon: {
      marginLeft: 4,
    },

    /* Body / content area */
    extraContentContainer: {
      marginVertical: theme['--thread-section-spacing'],
    },
    threadItemText: {
      fontSize: theme['--thread-font-size'],
      color: theme['--thread-text-primary'],
      marginBottom: 6,
    },
    threadItemImage: {
      width: '70%',
      height: 120,
      borderRadius: 8,
      resizeMode: 'cover',
      marginTop: 4,
    },
    videoPlaceholder: {
      padding: 10,
      backgroundColor: '#EEE',
      borderRadius: 8,
      marginTop: 4,
    },
    videoPlaceholderText: {
      color: '#666',
      textAlign: 'center',
    },

    /* Poll styles */
    pollContainer: {
      backgroundColor: theme['--thread-poll-bg'],
      borderRadius: 8,
      padding: 8,
      marginTop: 4,
    },
    pollQuestion: {
      fontSize: theme['--thread-font-size'],
      fontWeight: '600',
      marginBottom: 6,
      color: theme['--thread-text-primary'],
    },
    pollOption: {
      backgroundColor: theme['--thread-poll-option-bg'],
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 4,
      marginBottom: 4,
    },
    pollOptionText: {
      fontSize: theme['--thread-font-size'],
      color: theme['--thread-text-primary'],
    },

    /* Footer (icon row + reply button) */
    footerContainer: {
      marginTop: 6,
    },
    itemIconsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 8,
      gap: 16,
    },
    itemLeftIcons: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    iconText: {
      fontSize: 12,
      color: theme['--thread-text-secondary'],
      marginLeft: -2,
    },
  });

  // 1. Merge userStyleSheet if provided
  if (userStyleSheet) {
    Object.keys(userStyleSheet).forEach(key => {
      if (baseStyles[key]) {
        baseStyles[key] = StyleSheet.flatten([
          baseStyles[key],
          userStyleSheet[key],
        ]);
      }
    });
  }

  // 2. Merge explicit overrideStyles last
  if (overrideStyles) {
    Object.keys(overrideStyles).forEach(key => {
      if (baseStyles[key]) {
        baseStyles[key] = StyleSheet.flatten([
          baseStyles[key],
          overrideStyles[key],
        ]);
      }
    });
  }

  return baseStyles;
}
