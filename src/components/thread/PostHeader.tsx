// src/components/thread/PostHeader.tsx

import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

interface User {
  id: string;
  username: string;
  avatarUrl: string;
}

interface PostHeaderProps {
  user: User;
  createdAt: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({user, createdAt}) => {
  return (
    <View style={styles.header}>
      <Image source={{uri: user.avatarUrl}} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.timestamp}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

export default PostHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  userInfo: {
    flexDirection: 'column',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
});
