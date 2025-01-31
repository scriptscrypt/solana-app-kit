import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ThreadPost} from './thread.types';
import ThreadItem from './ThreadItem';

interface ThreadProps {
  posts: ThreadPost[];
  onReply: (parentId: string, content: string) => void; // Callback for adding replies
}

const Thread: React.FC<ThreadProps> = ({posts, onReply}) => {
  return (
    <View style={styles.container}>
      {posts.map(post => (
        <ThreadItem key={post.id} post={post} onReply={onReply} />
      ))}
    </View>
  );
};

export default Thread;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
