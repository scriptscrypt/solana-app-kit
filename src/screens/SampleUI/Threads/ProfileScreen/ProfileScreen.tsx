import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Platform, SafeAreaView } from 'react-native';
import Profile from '@/core/profile/components/profile';
import { ThreadPost } from '@/core/thread/components/thread.types';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { flattenPosts } from '@/core/thread/components/thread.utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchFollowers, fetchFollowing } from '@/core/profile/services/profileService';
import { useFetchNFTs } from '@/modules/nft';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import COLORS from '@/assets/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function ProfileScreen() {
  // Get user data from Redux
  const storedProfilePic = useAppSelector(state => state.auth.profilePicUrl);
  const storedUsername = useAppSelector(state => state.auth.username);
  const storedDescription = useAppSelector(state => state.auth.description);
  const attachmentData = useAppSelector(state => state.auth.attachmentData || {});
  
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Use the wallet hook to get the user's address
  const { address: userWallet } = useWallet();
  
  // Ensure we have the wallet address and log for debugging
  useEffect(() => {
    console.log('[ProfileScreen] User wallet address:', userWallet);
    console.log('[ProfileScreen] Stored username:', storedUsername);
  }, [userWallet, storedUsername]);

  // Add state for counts to force refresh
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get all posts from Redux
  const allPosts = useAppSelector(state => state.thread.allPosts);

  // Get the status bar height for Android
  const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  // Filter posts belonging to the current user, including replies
  const myPosts = useMemo(() => {
    if (!userWallet) return [];

    // Flatten all posts to include nested replies
    const flattenedPosts = flattenPosts(allPosts);

    // Filter for posts by this user
    const userPosts = flattenedPosts.filter(
      (p: ThreadPost) => p.user.id.toLowerCase() === userWallet.toLowerCase()
    );

    // Sort by creation date, newest first
    userPosts.sort((a: ThreadPost, b: ThreadPost) =>
      (new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1)
    );

    return userPosts;
  }, [userWallet, allPosts]);

  // Fetch NFT data using our custom hook
  const {
    nfts,
    loading: loadingNfts,
    error: fetchNftsError,
  } = useFetchNFTs(userWallet || undefined);

  // Build the user object with safe fallbacks
  const user = useMemo(() => ({
    address: userWallet || '',
    profilePicUrl: storedProfilePic || '',
    username: storedUsername || (userWallet ? userWallet.substring(0, 6) : 'New User'),
    description: storedDescription || 'Welcome to my profile!',
    attachmentData,
    followersCount,
    followingCount
  }), [userWallet, storedProfilePic, storedUsername, storedDescription, attachmentData, followersCount, followingCount]);

  // Handle go back for the profile
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Refresh follower/following counts when the profile screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (!userWallet) {
        console.log('[ProfileScreen] No wallet address available, skipping follower fetch');
        setIsLoading(false);
        return;
      }

      console.log('[ProfileScreen] Screen focused, refreshing follower/following data');
      setIsLoading(true);

      // Fetch followers count
      fetchFollowers(userWallet).then(list => {
        console.log('[ProfileScreen] Updated followers count:', list.length);
        setFollowersCount(list.length);
      }).catch(err => {
        console.error('[ProfileScreen] Error fetching followers:', err);
      });

      // Fetch following count
      fetchFollowing(userWallet).then(list => {
        console.log('[ProfileScreen] Updated following count:', list.length);
        setFollowingCount(list.length);
      }).catch(err => {
        console.error('[ProfileScreen] Error fetching following:', err);
      }).finally(() => {
        // Set loading to false after all fetches
        setIsLoading(false);
      });

    }, [userWallet])
  );

  return (
    <>
      {Platform.OS === 'android' && <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: COLORS.background }} />}
      <SafeAreaView style={[styles.container, Platform.OS === 'android' && androidStyles.container]}>
        <Profile
          isOwnProfile={true}
          user={user}
          posts={myPosts}
          nfts={nfts}
          loadingNfts={loadingNfts}
          fetchNftsError={fetchNftsError}
          onGoBack={handleGoBack}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

// Android-specific styles to handle camera cutout/notch areas
const androidStyles = StyleSheet.create({
  container: {
    paddingTop: 0, // We're handling this with the extra View above
  },
});
