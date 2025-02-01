// src/components/thread/Thread.tsx

import React, {useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import ThreadItem from './ThreadItem';
import ThreadComposer from './ThreadComposer';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import Icons from '../../assets/svgs';
import {ThreadPost, ThreadUser} from './thread.types';

interface ThreadProps {
  rootPosts: ThreadPost[];
  currentUser: ThreadUser;
  showHeader?: boolean;
  onPostCreated?: () => void;

  /** If true, hides the composer at the top of the thread. Default: false */
  hideComposer?: boolean;

  /** Called when the user taps on a post or reply. */
  onPressPost?: (post: ThreadPost) => void;

  /** Theming & styling overrides for advanced customization */
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
  userStyleSheet?: {[key: string]: object};
}

export default function Thread({
  rootPosts,
  currentUser,
  showHeader = true,
  onPostCreated,
  hideComposer = false,
  onPressPost,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
}: ThreadProps) {
  const [refreshing, setRefreshing] = useState(false);

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides,
    userStyleSheet,
  );

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh or re-fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const renderItem = ({item}: {item: ThreadPost}) => (
    <ThreadItem
      post={item}
      currentUser={currentUser}
      rootPosts={rootPosts}
      themeOverrides={themeOverrides}
      styleOverrides={styleOverrides}
      userStyleSheet={userStyleSheet}
      onPressPost={onPressPost}
    />
  );

  return (
    <View style={styles.threadRootContainer}>
      {showHeader && (
        <View style={styles.header}>
          <Icons.SplashText width={120} height={120} />
        </View>
      )}

      {!hideComposer && (
        <ThreadComposer
          currentUser={currentUser}
          onPostCreated={onPostCreated}
          themeOverrides={themeOverrides}
          styleOverrides={styleOverrides}
        />
      )}

      <View style={styles.divider} />

      <FlatList
        data={rootPosts}
        keyExtractor={post => post.id}
        renderItem={renderItem}
        contentContainerStyle={styles.threadListContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={{alignItems: 'center', marginTop: 24}}>
            <Text style={{color: '#666'}}>No posts yet.</Text>
          </View>
        }
      />
    </View>
  );
}
