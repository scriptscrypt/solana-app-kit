import React from 'react';
import {View, Text} from 'react-native';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import {gatherAncestorChain} from './thread.utils';
import { ThreadPost } from './thread.types';

interface ThreadAncestorsProps {
  post: ThreadPost;
  rootPosts: ThreadPost[];
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
  userStyleSheet?: {[key: string]: object};
}

export default function ThreadAncestors({
  post,
  rootPosts,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
}: ThreadAncestorsProps) {
  if (!post.parentId) return null;

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides,
    userStyleSheet,
  );

  const chain = gatherAncestorChain(post.id, rootPosts);

  if (chain.length === 0) return null;

  const uniqueHandles = chain.map(p => p.user.handle).filter(Boolean);

  return (
    <View style={styles.replyingContainer}>
      <Text style={styles.replyingText}>
        Replying to{' '}
        <Text style={styles.replyingHandle}>{uniqueHandles.join(', ')}</Text>
      </Text>
    </View>
  );
}
