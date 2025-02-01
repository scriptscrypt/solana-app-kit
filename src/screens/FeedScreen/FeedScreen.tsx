
import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {useAppSelector} from '../../hooks/useReduxHooks';
import {Thread} from '../../components/thread';
import COLORS from '../../assets/colors';
import { ThreadPost, ThreadUser } from '../../components/thread/thread.types';

/** Example: Current user is "Alice" */
const currentUser: ThreadUser = {
  id: 'user-1',
  username: 'Alice',
  handle: '@aliceSmith',
  avatar: require('../../assets/images/User.png'),
  verified: true,
};

export default function FeedScreen() {
  const allPosts = useAppSelector(state => state.thread.allPosts);
  const [rootPosts, setRootPosts] = useState<ThreadPost[]>([]);

  useEffect(() => {
    const roots = allPosts.filter(p => !p.parentId);
    // Sort descending by date
    roots.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    setRootPosts(roots);
  }, [allPosts]);

  const handleRootPostCreated = () => {
  };

  return (
    <SafeAreaView style={styles.container}>
      <Thread
        rootPosts={rootPosts}
        currentUser={currentUser}
        onPostCreated={handleRootPostCreated}
        showHeader={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
