import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDevMode } from '../../context/DevModeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../hooks/useAppNavigation';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

// Sample dummy data for profile and posts
const DUMMY_USER = {
    userId: 'demo-user-123',
    username: 'satoshi_nakamoto',
    displayName: 'Satoshi Nakamoto',
    bio: 'Creator of a decentralized digital currency that operates without a central authority.',
    profileImageUrl: 'https://pbs.twimg.com/profile_images/1429234352611897345/HJ-TzEE3_400x400.jpg',
    coverImageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
    followerCount: 1287000,
    followingCount: 42,
    isVerified: true,
    walletAddress: '8ZUdizNr7cjWcEPAfSB7pHfwRfCJ4iR23yMrpuVXaJLD'
};

const DUMMY_POST = {
    postId: 'post-456-abc',
    content: 'Just deployed a new contract on Solana! Check out the blazing fast speeds at just $0.0001 per transaction!',
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55',
    timestamp: new Date().getTime() - 3600000, // 1 hour ago
    likeCount: 2431,
    commentCount: 248,
    user: DUMMY_USER,
    isLiked: false,
    hashtags: ['#solana', '#blockchain', '#crypto'],
    transactionHash: '4vJ6p8onCZeUQBPJqrXXGJRSkLTdYvPTL9zGwDdvwSbEeKJdf6C4MQhTccCrxP8ZbpWJkzhGQhFVmUG3Qgpj8j7y'
};

// Screen mapping for direct navigation
const SCREEN_MAP = [
    { name: 'Feed Screen (Threads)', route: 'MainTabs', params: {} },
    // { name: 'Login', route: 'LoginOptions', params: {} },
    // { name: 'Intro Screen', route: 'IntroScreen', params: {} },
    // { name: 'Blink', route: 'Blink', params: {} },
    // { name: 'Coin Detail', route: 'CoinDetailPage', params: {} },
    { name: 'Chat', route: 'ChatScreen', params: {} },
    { name: 'NFT Screen', route: 'NftScreen', params: {} },
    { name: 'Pumpfun', route: 'Pumpfun', params: {} },
    { name: 'Token Mill', route: 'TokenMill', params: {} },
    { name: 'Pump Swap', route: 'PumpSwap', params: {} },
    { name: 'Profile', route: 'ProfileScreen', params: {} },
    {
        name: 'Profile (Other User)',
        route: 'OtherProfile',
        params: {
            userId: DUMMY_USER.userId,
            username: DUMMY_USER.username,
            displayName: DUMMY_USER.displayName,
            bio: DUMMY_USER.bio,
            profileImage: DUMMY_USER.profileImageUrl,
            followerCount: DUMMY_USER.followerCount,
            followingCount: DUMMY_USER.followingCount,
            isVerified: DUMMY_USER.isVerified
        }
    },
    {
        name: 'Post Thread',
        route: 'PostThread',
        params: {
            postId: DUMMY_POST.postId,
            content: DUMMY_POST.content,
            user: DUMMY_USER,
            imageUrl: DUMMY_POST.imageUrl,
            timestamp: DUMMY_POST.timestamp,
            likeCount: DUMMY_POST.likeCount,
            commentCount: DUMMY_POST.commentCount,
            hashtags: DUMMY_POST.hashtags
        }
    },
    // { name: 'Followers/Following', route: 'FollowersFollowingList', params: {} },
] as const;

// Type for the route names
type RouteNames = typeof SCREEN_MAP[number]['route'];

const DevDrawer = () => {
    const { isDevDrawerOpen, toggleDevDrawer } = useDevMode();
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const exitDevMode = async () => {
        // Remove the dev mode flag from AsyncStorage
        await AsyncStorage.removeItem('devMode');
        // Alert the user that they need to restart
        alert('Dev mode disabled. Please restart the app for changes to take effect.');
        // Close drawer
        toggleDevDrawer();
    };

    // Bypass authentication for dev mode
    const bypassAuth = () => {
        if (!isLoggedIn) {
            // Force login with dummy data
            dispatch({
                type: 'auth/loginSuccess',
                payload: {
                    provider: 'mwa',
                    address: DUMMY_USER.walletAddress,
                    profilePicUrl: DUMMY_USER.profileImageUrl,
                    username: DUMMY_USER.username,
                    description: DUMMY_USER.bio
                }
            });
            console.log('Dev mode: Authentication bypassed');
            return true;
        }
        return false;
    };

    const navigateToScreen = (route: RouteNames, params: Record<string, unknown> = {}) => {
        try {
            // First close the drawer
            toggleDevDrawer();

            // Bypass authentication in dev mode
            const didBypass = bypassAuth();

            // Then navigate to the selected screen
            // We use a small timeout to ensure the drawer closing animation completes
            // and auth state updates if needed
            setTimeout(() => {
                if (navigationRef.isReady()) {
                    const nav = navigationRef.current;

                    // If we bypassed auth, we need more time for the auth state to update
                    // before attempting navigation
                    const navigationDelay = didBypass ? 500 : 100;

                    setTimeout(() => {
                        if (nav) {
                            try {
                                // Try to reset navigation to MainTabs first if we're bypassing auth
                                if (didBypass) {
                                    nav.reset({
                                        index: 0,
                                        routes: [{ name: 'MainTabs' }],
                                    });

                                    // Add another delay before navigating to the target screen
                                    setTimeout(() => {
                                        if (nav) {
                                            nav.navigate(route as keyof RootStackParamList, params as any);
                                            console.log(`Navigating to: ${route}`, params);
                                        }
                                    }, 300);
                                } else {
                                    // Normal navigation when already logged in
                                    nav.navigate(route as keyof RootStackParamList, params as any);
                                    console.log(`Navigating to: ${route}`, params);
                                }
                            } catch (navError) {
                                console.error('Navigation error:', navError);
                                alert(`Navigation failed. Try again or restart the app.`);
                            }
                        }
                    }, navigationDelay);
                } else {
                    console.error('Navigation reference is not ready');
                    alert('Navigation system is not ready. Please try again.');
                }
            }, 300);
        } catch (error: unknown) {
            console.error('Navigation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to navigate to ${route}. Error: ${errorMessage}`);
        }
    };

    if (!isDevDrawerOpen) return null;

    return (
        <View style={styles.overlay}>
            <TouchableOpacity
                style={styles.backdrop}
                onPress={toggleDevDrawer}
                activeOpacity={1}
            />
            <SafeAreaView style={styles.drawerContainer}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <Text style={styles.title}>Developer Tools</Text>
                    <TouchableOpacity onPress={toggleDevDrawer}>
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <Text style={styles.sectionTitle}>Screen Navigator</Text>

                    <View style={styles.screenList}>
                        {SCREEN_MAP.map((screen, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.screenItem}
                                onPress={() => navigateToScreen(screen.route, screen.params)}
                            >
                                <Text style={styles.screenName}>{screen.name}</Text>
                                <Text style={styles.screenRoute}>{screen.route}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Development Options</Text>

                    <View style={styles.optionItem}>
                        <Text style={styles.optionText}>Environment: Development</Text>
                    </View>

                    <View style={styles.optionItem}>
                        <Text style={styles.optionText}>App Version: {(process.env as any).npm_package_version || '0.1.0'}</Text>
                    </View>

                    <View style={styles.optionItem}>
                        <Text style={styles.optionText}>Login Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}</Text>
                    </View>

                    {/* Force login button */}
                    {!isLoggedIn && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={bypassAuth}
                        >
                            <Text style={styles.actionButtonText}>Force Login (For Testing)</Text>
                        </TouchableOpacity>
                    )}

                    {/* Exit dev mode button */}
                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={exitDevMode}
                    >
                        <Text style={styles.exitButtonText}>Exit Dev Mode</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 12,
        paddingBottom: 24,
        maxHeight: Dimensions.get('window').height * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        backgroundColor: '#CCCCCC',
        borderRadius: 2,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    closeButton: {
        fontSize: 16,
        color: '#007AFF',
    },
    content: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 12,
        color: '#333333',
    },
    screenList: {
        marginBottom: 20,
    },
    screenItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    screenName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
    },
    screenRoute: {
        fontSize: 12,
        color: '#666666',
    },
    optionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    optionText: {
        fontSize: 14,
        color: '#333333',
    },
    actionButton: {
        marginTop: 16,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    exitButton: {
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    exitButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default DevDrawer; 