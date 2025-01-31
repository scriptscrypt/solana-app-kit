import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ThreadPost} from './thread.types';
import PostHeader from './PostHeader';
import PostBody from './PostBody';
import PostFooter from './PostFooter';

interface ThreadAncestorsProps {
  ancestors: ThreadPost[];
  onReply?: (parentId: string, content: string) => void;
}

export const ThreadAncestors: React.FC<ThreadAncestorsProps> = ({
  ancestors,
  onReply,
}) => {
  if (!ancestors.length) return null;

  return (
    <View style={styles.container}>
      {ancestors.map(ancestor => (
        <View key={ancestor.id} style={styles.ancestorCard}>
          <PostHeader user={ancestor.user} createdAt={ancestor.createdAt} />
          <PostBody content={ancestor.content} />
          {onReply && (
            <PostFooter onReplyPress={() => onReply(ancestor.id, '...')} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  ancestorCard: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FFFFFF',
  },
});
