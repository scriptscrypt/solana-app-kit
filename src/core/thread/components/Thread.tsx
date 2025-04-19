import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThreadComposer } from './ThreadComposer';
import { createThreadStyles, getMergedTheme } from './thread.styles';
import Icons from '../../../assets/svgs';
import { ThreadProps } from '../types';
import { ThreadItem } from './ThreadItem';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import { DEFAULT_IMAGES } from '@/config/constants';
import { Platform } from 'react-native';
import SearchScreen from '@/screens/SampleUI/Threads/SearchScreen';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

export const Thread: React.FC<ThreadProps> = ({
  rootPosts,
  currentUser,
  showHeader = true,
  onPostCreated,
  hideComposer = false,
  onPressPost,
  ctaButtons,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
  refreshing: externalRefreshing,
  onRefresh: externalOnRefresh,
  onPressUser,
  disableReplies = false,
}) => {
  // Local fallback for refreshing if not provided
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'search'>('feed');
  const navigation = useNavigation();

  // Get the stored profile pic from Redux
  const storedProfilePic = useAppSelector(state => state.auth.profilePicUrl);

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides,
    userStyleSheet,
  );

  // Local onRefresh if external prop is not provided
  const localOnRefresh = () => {
    setLocalRefreshing(true);
    setTimeout(() => {
      setLocalRefreshing(false);
    }, 800);
  };

  const finalRefreshing =
    externalRefreshing !== undefined ? externalRefreshing : localRefreshing;
  const finalOnRefresh =
    externalOnRefresh !== undefined ? externalOnRefresh : localOnRefresh;

  const handleProfilePress = () => {
    navigation.navigate('ProfileScreen' as never);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ThreadItem
      post={item}
      currentUser={currentUser}
      rootPosts={rootPosts}
      themeOverrides={themeOverrides}
      styleOverrides={styleOverrides}
      userStyleSheet={userStyleSheet}
      onPressPost={onPressPost}
      ctaButtons={ctaButtons}
      onPressUser={onPressUser}
      disableReplies={disableReplies}
    />
  );

  return (
    <View style={styles.threadRootContainer}>
      {showHeader && (
        <View style={[styles.header, { padding: 16 }]}>
          <View style={headerStyles.container}>
            {/* Left: User Profile Image */}
            <TouchableOpacity onPress={handleProfilePress} style={headerStyles.profileContainer}>
              <IPFSAwareImage
                source={
                  storedProfilePic
                    ? getValidImageSource(storedProfilePic)
                    : currentUser && 'avatar' in currentUser && currentUser.avatar
                      ? getValidImageSource(currentUser.avatar)
                      : DEFAULT_IMAGES.user
                }
                style={headerStyles.profileImage}
                defaultSource={DEFAULT_IMAGES.user}
                key={Platform.OS === 'android' ? `profile-${Date.now()}` : 'profile'}
              />
            </TouchableOpacity>

            {/* Right: Copy and Wallet Icons */}
            <View style={headerStyles.iconsContainer}>
              <TouchableOpacity style={headerStyles.iconButton}>
                <Icons.copyIcon width={16} height={16} />
              </TouchableOpacity>
              <TouchableOpacity style={headerStyles.iconButton}>
                <Icons.walletIcon width={35} height={35} />
              </TouchableOpacity>
            </View>

            {/* Center: App Logo - Using absolute positioning to keep centered */}
            <View style={headerStyles.absoluteLogoContainer}>
              <Icons.AppLogo width={40} height={40} />
            </View>
          </View>
        </View>
      )}

      {/* Tab Slider */}
      <View style={tabStyles.container}>
        <TouchableOpacity
          style={[tabStyles.tab, activeTab === 'feed' && tabStyles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[tabStyles.tabText, activeTab === 'feed' && tabStyles.activeTabText]}>
            For You
          </Text>
          {activeTab === 'feed' && <View style={tabStyles.indicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[tabStyles.tab, activeTab === 'search' && tabStyles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Icons.searchIcon
            width={24}
            height={24}
            color={activeTab === 'search' ? COLORS.brandBlue : COLORS.greyMid}
          />
          {activeTab === 'search' && <View style={tabStyles.indicator} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'feed' ? (
        <>
          {!hideComposer && (
            <ThreadComposer
              currentUser={currentUser}
              onPostCreated={onPostCreated}
              themeOverrides={themeOverrides}
              styleOverrides={styleOverrides}
            />
          )}

          <FlatList
            data={rootPosts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.threadListContainer}
            refreshing={finalRefreshing}
            onRefresh={finalOnRefresh}
          />
        </>
      ) : (
        <SearchScreen showHeader={false} />
      )}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
  },
  profileContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  absoluteLogoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 4,
  },
});

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
    backgroundColor: COLORS.background,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
    color: COLORS.greyMid,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  activeTabText: {
    color: COLORS.brandBlue,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '80%',
    backgroundColor: COLORS.brandBlue,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    alignSelf: 'center',
  },
});

// Also export as default for backward compatibility
export default Thread;
