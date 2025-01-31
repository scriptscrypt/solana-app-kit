// src/components/thread/PostBody.tsx

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface PostBodyProps {
  content: string;
}

const PostBody: React.FC<PostBodyProps> = ({content}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};

export default PostBody;

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
  },
});
