import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icons from '../../assets/svgs';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import {ThreadPost} from './thread.types';

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(mergedTheme, styleOverrides);

  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.itemIconsRow}>
        <View style={{flexDirection: 'row', gap: 16}}>
          {/* Comment icon */}
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
        </View>

        {/* Right side icons */}
        <View style={styles.itemRightIcons}>
          <Icons.GridIcon width={20} height={20} />
          <TouchableOpacity onPress={toggleBookmark}>
            {isBookmarked ? (
              <Icons.BookmarkActive width={20} height={20} />
            ) : (
              <Icons.BookmarkIdle width={20} height={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
