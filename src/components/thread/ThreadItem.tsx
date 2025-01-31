import React, {useState, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {ThreadPost} from './thread.types';
import PostHeader from './PostHeader';
import PostBody from './PostBody';
import PostFooter from './PostFooter';
import ThreadComposer from './ThreadComposer';
import ThreadItem from './ThreadItem';
import {ThreadAncestors} from './ThreadAncestors';
import {flattenThreadTree, getParentChain} from './thread.utils';

interface ThreadItemProps {
  post: ThreadPost;
  onReply: (parentId: string, content: string) => void;
  level?: number; // indentation level (optional)
  // NEW:
  showParentChain?: boolean;
  // flat array of all posts if we want to show the parent's chain
  allPosts?: ThreadPost[];
}

const ThreadItemComponent: React.FC<ThreadItemProps> = ({
  post,
  onReply,
  level = 0,
  showParentChain = false,
  allPosts,
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const handleReplyPress = () => {
    setShowReplyComposer(!showReplyComposer);
  };

  const handleReplySubmit = (content: string) => {
    onReply(post.id, content);
    setShowReplyComposer(false);
  };

  // If user wants to show parent chain + we have allPosts, compute once
  const ancestorChain = useMemo(() => {
    if (showParentChain && allPosts?.length) {
      // Flatten if needed. If 'allPosts' are already flat, no need to flatten:
      // const flat = flattenThreadTree(allPosts); // depends on your usage
      // For safety, assume 'allPosts' is a tree, so we flatten:
      const flat = flattenThreadTree(allPosts);
      return getParentChain(flat, post.id);
    }
    return [];
  }, [showParentChain, allPosts, post.id]);

  return (
    <View style={[styles.container, {marginLeft: level * 12}]}>
      {/* If we want the full ancestor chain above this post */}
      {ancestorChain.length > 0 && (
        <ThreadAncestors ancestors={ancestorChain} onReply={onReply} />
      )}

      <View style={styles.postContainer}>
        <PostHeader user={post.user} createdAt={post.createdAt} />
        <PostBody content={post.content} />
        <PostFooter onReplyPress={handleReplyPress} />
      </View>

      {showReplyComposer && (
        <ThreadComposer
          onSubmit={handleReplySubmit}
          placeholder={`Reply to ${post.user.username}`}
        />
      )}

      {/* Recursively render replies */}
      {post.replies && post.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {post.replies.map(reply => (
            <ThreadItemComponent
              key={reply.id}
              post={reply}
              onReply={onReply}
              level={level + 1}
              showParentChain={false} // avoid repeating chain for children
              allPosts={allPosts}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ThreadItemComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  postContainer: {
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  repliesContainer: {
    marginTop: 8,
  },
});
