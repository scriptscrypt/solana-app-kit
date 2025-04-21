import { StyleSheet } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { THREAD_DEFAULT_THEME } from '../thread.theme'; // Import theme type if needed

// Function to create base styles for ThreadAncestors
export function getThreadAncestorsBaseStyles(
  theme: typeof THREAD_DEFAULT_THEME // Use a specific theme type
) {
  return StyleSheet.create({
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
  });
}

// Styles previously defined inline in ThreadAncestors.tsx
export const ancestorStyles = StyleSheet.create({
  parentSnippetWrapper: {
    marginTop: 8,
  },
  parentSnippetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  parentSnippetContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    // Optionally add a border or small shadow
    borderWidth: 1,
    borderColor: '#EEE',
  },
}); 