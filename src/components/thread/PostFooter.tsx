// src/components/thread/PostFooter.tsx

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icons from '../../assets/svgs';
import {ThreadPost} from '../../state/thread/reducer';
import {createThreadStyles, getMergedTheme} from './thread.styles';

interface PostFooterProps {
  post: ThreadPost;
  onPressComment?: (post: ThreadPost) => void;
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
}

export default function PostFooter({
  post,
  onPressComment,
  themeOverrides,
  styleOverrides,
}: PostFooterProps) {
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(mergedTheme, styleOverrides);

  return (
    <View style={styles.footerContainer}>
      <View style={styles.itemIconsRow}>
        {/* Comment icon toggles the reply composer */}
        <TouchableOpacity
          style={styles.itemLeftIcons}
          onPress={() => onPressComment && onPressComment(post)}>
          <Icons.CommentIdle width={20} height={20} />
          <Text style={styles.iconText}>{post.quoteCount || 0}</Text>
        </TouchableOpacity>

        {/* Retweet */}
        <View style={styles.itemLeftIcons}>
          <Icons.RetweetIdle width={20} height={20} />
          <Text style={styles.iconText}>{post.retweetCount || 0}</Text>
        </View>

        {/* Reaction */}
        <View style={styles.itemLeftIcons}>
          <Icons.ReactionIdle width={20} height={20} />
          <Text style={styles.iconText}>{post.reactionCount || 0}</Text>
        </View>

        {/* Share */}
        <View style={styles.itemLeftIcons}>
          <Icons.ShareIdle width={20} height={20} />
        </View>

        {/* Bookmark */}
        <View style={styles.itemLeftIcons}>
          <Icons.BookmarkIdle width={20} height={20} />
        </View>
      </View>
    </View>
  );
}
