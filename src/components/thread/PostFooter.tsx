// src/components/thread/PostFooter.tsx

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface PostFooterProps {
  onReplyPress: () => void;
}

const PostFooter: React.FC<PostFooterProps> = ({onReplyPress}) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={onReplyPress}>
        <Text style={styles.reply}>Reply</Text>
      </TouchableOpacity>
      {/* Add your Like, Share, etc. here */}
    </View>
  );
};

export default PostFooter;

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reply: {
    color: '#1d9bf0', // e.g. Twitter-like blue
    fontWeight: '600',
    marginRight: 16,
  },
});
