import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDevMode } from '../../context/DevModeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../hooks/useAppNavigation';
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

// Screen nodes for the visual tree map
const SCREEN_NODES = [
    // Main nav - this is the root node
    {
        id: 'bottomNav',
        label: 'Bottom Navigation',
        type: 'root',
        route: null,
        params: {},
        children: ['modules', 'feed', 'search', 'profile', 'otherScreens']
    },

    // Other Screens
    {
        id: 'otherScreens',
        label: 'Other Screens',
        type: 'category',
        route: null,
        params: {},
        children: ['thread', 'otherProfile']
    },

    // Main level nodes
    {
        id: 'modules',
        label: 'Modules',
        type: 'category',
        route: null,
        params: {},
        children: ['pumpFun', 'pumpSwap', 'tokenMill', 'nft']
    },
    {
        id: 'feed',
        label: 'Feed',
        type: 'screen',
        route: 'MainTabs',
        params: { screen: 'Feed' },
        children: ['chat']
    },
    {
        id: 'search',
        label: 'Search',
        type: 'screen',
        route: 'MainTabs',
        params: { screen: 'Search' },
        children: []
    },
    {
        id: 'profile',
        label: 'Profile',
        type: 'screen',
        route: 'ProfileScreen',
        params: {},
        children: []
    },

    // Feed children
    {
        id: 'chat',
        label: 'Chat Screen',
        type: 'screen',
        route: 'ChatScreen',
        params: {},
        children: []
    },

    // Other screens children
    {
        id: 'thread',
        label: 'Thread Screen',
        type: 'screen',
        route: 'MainTabs',
        params: {},
        children: []
    },
    {
        id: 'otherProfile',
        label: 'Other Profile Screen',
        type: 'screen',
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
        },
        children: []
    },

    // Modules' children
    {
        id: 'pumpFun',
        label: 'Pump Fun',
        type: 'screen',
        route: 'Pumpfun',
        params: {},
        children: []
    },
    {
        id: 'pumpSwap',
        label: 'Pump Swap',
        type: 'screen',
        route: 'PumpSwap',
        params: {},
        children: []
    },
    {
        id: 'tokenMill',
        label: 'Token Mill',
        type: 'screen',
        route: 'TokenMill',
        params: {},
        children: []
    },
    {
        id: 'nft',
        label: 'NFT Screen',
        type: 'screen',
        route: 'NftScreen',
        params: {},
        children: []
    }
];

type RouteNames = string;

// Navigation Map Component
const AppNavigationMap = ({ onScreenSelect }: { onScreenSelect: (route: RouteNames, params: Record<string, unknown>) => void }) => {
    // Track which sections are expanded
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        bottomNav: true,
        modules: false,
        feed: false,
        otherScreens: false
    });

    // Toggle a section's expanded state
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Node component for the navigation map
    const NavNode = ({
        id,
        indentLevel = 0,
        isChild = false
    }: {
        id: string,
        indentLevel?: number,
        isChild?: boolean
    }) => {
        const node = SCREEN_NODES.find(n => n.id === id);
        if (!node) return null;

        const nodeType = node.type;
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedSections[id];

        // Determine background color based on node type
        const bgColor =
            nodeType === 'root' ? '#5d85c3' :  // Blue for bottom nav
                nodeType === 'category' ? '#ff7a7a' : // Red for categories
                    '#4ECDC4'; // Teal for screens

        // Determine text color based on background
        const textColor = (nodeType === 'root' || nodeType === 'category') ? '#fff' : '#333';

        return (
            <View style={{ marginBottom: isChild ? 0 : 10 }}>
                <TouchableOpacity
                    style={[
                        styles.navMapNode,
                        { marginLeft: indentLevel * 20 },
                        { backgroundColor: bgColor }
                    ]}
                    onPress={() => {
                        if (hasChildren) {
                            toggleSection(id);
                        } else if (node.route) {
                            onScreenSelect(node.route, node.params);
                        }
                    }}
                >
                    <View style={styles.nodeContent}>
                        {/* Show arrow only for nodes that have children */}
                        {hasChildren && (
                            <Text style={[styles.nodeArrow, { color: textColor }]}>
                                {isExpanded ? '▼' : '▶'}
                            </Text>
                        )}

                        {/* Node Label */}
                        <Text style={[styles.nodeLabel, { color: textColor }]}>
                            {node.label}
                        </Text>
                    </View>

                    {/* Show nav indicator for screens that can be navigated to */}
                    {node.route && (
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => onScreenSelect(node.route, node.params)}
                        >
                            <Text style={styles.navButtonText}>Navigate</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {/* Render children when section is expanded */}
                {hasChildren && isExpanded && (
                    <View style={styles.childrenContainer}>
                        {node.children.map(childId => (
                            <NavNode
                                key={childId}
                                id={childId}
                                indentLevel={indentLevel + 1}
                                isChild={true}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.navigationMapContainer}>
            <Text style={styles.mapTitle}>App Navigation Structure</Text>
            <Text style={styles.mapDescription}>
                Tap on dropdown arrows to expand sections. Tap "Navigate" to go to screens.
            </Text>

            <View style={styles.treeContainer}>
                <NavNode id="bottomNav" />
            </View>
        </View>
    );
};

// Legend component for explaining node colors
const NavigationLegend = () => {
    return (
        <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendRow}>
                <View style={[styles.legendIcon, { backgroundColor: '#5d85c3' }]} />
                <Text style={styles.legendText}>Bottom Navigation</Text>
            </View>
            <View style={styles.legendRow}>
                <View style={[styles.legendIcon, { backgroundColor: '#ff7a7a' }]} />
                <Text style={styles.legendText}>Navigation Categories</Text>
            </View>
            <View style={styles.legendRow}>
                <View style={[styles.legendIcon, { backgroundColor: '#4ECDC4' }]} />
                <Text style={styles.legendText}>App Screens</Text>
            </View>
        </View>
    );
};

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
            if (!route) return; // Skip navigation for category nodes

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
                                            nav.navigate(route as any, params as any);
                                            console.log(`Navigating to: ${route}`, params);
                                        }
                                    }, 300);
                                } else {
                                    // Normal navigation when already logged in
                                    nav.navigate(route as any, params as any);
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
                    <Text style={styles.title}>App Navigation Map</Text>
                    <TouchableOpacity onPress={toggleDevDrawer}>
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingVertical: 15 }}
                    showsVerticalScrollIndicator
                >
                    {/* Navigation Map Component */}
                    <AppNavigationMap onScreenSelect={navigateToScreen} />

                    {/* Legend */}
                    <NavigationLegend />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Development Options</Text>

                    <View style={styles.optionItem}>
                        <Text style={styles.optionText}>Environment: Development</Text>
                    </View>

                    <View style={styles.optionItem}>
                        <Text style={styles.optionText}>
                            App Version: {(process.env as any).npm_package_version || '0.1.0'}
                        </Text>
                    </View>

                    <View style={styles.optionItem}>
                        <Text style={styles.optionText}>
                            Login Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
                        </Text>
                    </View>

                    {!isLoggedIn && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={bypassAuth}
                        >
                            <Text style={styles.actionButtonText}>Force Login (For Testing)</Text>
                        </TouchableOpacity>
                    )}

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
        maxHeight: Dimensions.get('window').height * 0.9,
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
    navigationMapContainer: {
        marginBottom: 20,
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
        color: '#000',
    },
    mapDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    treeContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 12,
    },
    navMapNode: {
        marginVertical: 4,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    nodeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    nodeArrow: {
        fontSize: 10,
        marginRight: 8,
    },
    nodeLabel: {
        fontWeight: '600',
        fontSize: 14,
    },
    navButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    navButtonText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    childrenContainer: {
        marginTop: 2,
        marginBottom: 4,
    },
    legendContainer: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    legendIcon: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
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
