// src/screens/ThreadExampleScreen.tsx

import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView, Text} from 'react-native';
import {
  Thread,
  ThreadPost,
  buildThreadTree,
  flattenThreadTree,
} from '../components/thread';

const initialFlatPosts: ThreadPost[] = [
  {
    id: '1',
    content: 'Hello world! This is a top-level post.',
    user: {
      id: 'u1',
      username: 'Alice',
      avatarUrl:
        'https://cdn.pixabay.com/photo/2023/01/12/23/10/woman-7715456_1280.jpg',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    parentId: '1',
    content: 'Reply to #1',
    user: {
      id: 'u2',
      username: 'Bob',
      avatarUrl:
        'https://cdn.pixabay.com/photo/2022/11/15/02/20/man-7590886_1280.jpg',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    parentId: '1',
    content: 'Another reply to #1',
    user: {
      id: 'u3',
      username: 'Charlie',
      avatarUrl:
        'https://cdn.pixabay.com/photo/2023/01/08/10/18/handsome-man-7704037_1280.jpg',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    parentId: '2',
    content: 'Nested reply to #2 (which is a reply to #1)',
    user: {
      id: 'u4',
      username: 'Diana',
      avatarUrl:
        'https://cdn.pixabay.com/photo/2023/01/07/23/21/woman-7703742_1280.jpg',
    },
    createdAt: new Date().toISOString(),
  },
];

export default function ProfileScreen() {
  const [posts, setPosts] = useState<ThreadPost[]>(
    buildThreadTree(initialFlatPosts),
  );

  /**
   * onReply callback that the <Thread> component expects:
   * parentId => the post you’re replying to
   * content => text user typed
   */
  const handleReply = (parentId: string, content: string) => {
    // Typically call an API to create the reply on the server,
    // then re-fetch or update locally:
    const newId = Date.now().toString(); // simplistic ID
    const newReply: ThreadPost = {
      id: newId,
      parentId,
      content,
      user: {
        id: 'me',
        username: 'Developer',
        avatarUrl:
          'https://cdn.pixabay.com/photo/2012/04/18/21/53/user-38976_1280.png',
      },
      createdAt: new Date().toISOString(),
      replies: [],
    };

    // Flatten existing tree, add the new reply, rebuild the tree
    const flattened = flattenThreadTree(posts);
    flattened.push(newReply);
    const updatedTree = buildThreadTree(flattened);
    setPosts(updatedTree);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Thread Example</Text>
      <Thread posts={posts} onReply={handleReply} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFF'},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 16,
    textAlign: 'center',
  },
});
