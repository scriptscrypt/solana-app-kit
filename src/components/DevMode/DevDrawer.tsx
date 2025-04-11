import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDevMode } from '../../context/DevModeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../../hooks/useAppNavigation';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
// Import specific environment variables needed for the frontend
import {
    PRIVY_APP_ID,
    PRIVY_CLIENT_ID,
    CLUSTER,
    TURNKEY_BASE_URL,
    TURNKEY_RP_ID,
    TURNKEY_RP_NAME,
    TURNKEY_ORGANIZATION_ID,
    DYNAMIC_ENVIRONMENT_ID,
    HELIUS_API_KEY,
    HELIUS_RPC_CLUSTER,
    SERVER_URL,
    TENSOR_API_KEY,
    PARA_API_KEY,
    COINGECKO_API_KEY,
    BIRDEYE_API_KEY,
    HELIUS_STAKED_URL,
    HELIUS_STAKED_API_KEY
} from '@env';

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

// Component to display missing environment variables
const MissingEnvVars = () => {
    const [missingVars, setMissingVars] = useState<string[]>([]);

    useEffect(() => {
        // Manually check only environment variables used in the frontend
        const envVars: Record<string, string | undefined> = {
            PRIVY_APP_ID,
            PRIVY_CLIENT_ID,
            CLUSTER,
            TURNKEY_BASE_URL,
            TURNKEY_RP_ID,
            TURNKEY_RP_NAME,
            TURNKEY_ORGANIZATION_ID,
            DYNAMIC_ENVIRONMENT_ID,
            HELIUS_API_KEY,
            HELIUS_RPC_CLUSTER,
            SERVER_URL,
            TENSOR_API_KEY,
            PARA_API_KEY,
            COINGECKO_API_KEY,
            BIRDEYE_API_KEY,
            HELIUS_STAKED_URL,
            HELIUS_STAKED_API_KEY
        };

        // Find missing variables
        const missing: string[] = [];
        for (const key in envVars) {
            const value = envVars[key];
            if (!value || value.trim() === '') {
                missing.push(key);
            }
        }
        setMissingVars(missing);
    }, []);

    if (missingVars.length === 0) {
        return (
            <View style={styles.envContainer}>
                <Text style={styles.envTitle}>Environment Variables</Text>
                <Text style={styles.envComplete}>All environment variables are set correctly.</Text>
            </View>
        );
    }

    return (
        <View style={styles.envContainer}>
            <Text style={styles.envTitle}>Missing Environment Variables</Text>
            <Text style={styles.envDescription}>
                The following environment variables are missing. The app can continue in dev mode,
                but certain features may not work correctly.
            </Text>
            {missingVars.map((varName) => (
                <View key={varName} style={styles.envVarItem}>
                    <Text style={styles.envVarName}>{varName}</Text>
                </View>
            ))}
            <Text style={styles.envHelper}>
                To fix this, add these variables to your .env.local file or enable environment variable mocking.
            </Text>
        </View>
    );
};

const DevDrawer = () => {
    const { isDevDrawerOpen, toggleDevDrawer } = useDevMode();
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

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
                        try {
                            if (nav) {
                                // Handle nested navigation
                                if (typeof params.screen === 'string') {
                                    nav.navigate(route as any, params as any);
                                } else {
                                    nav.navigate(route as any, params as any);
                                }
                                console.log(`Navigated to ${route} with params`, params);
                            }
                        } catch (navError) {
                            console.error('Inner navigation error:', navError);
                            alert(`Failed to navigate to ${route}`);
                        }
                    }, navigationDelay);
                } else {
                    console.error('Navigation is not ready');
                    alert('Navigation is not ready. Try again in a moment.');
                }
            }, 100);
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
                    <TouchableOpacity
                        style={styles.closeButtonContainer}
                        onPress={toggleDevDrawer}
                    >
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.content}>
                    {/* Show missing environment variables */}
                    <MissingEnvVars />

                    <View style={styles.navigationMapContainer}>
                        <Text style={styles.mapTitle}>App Navigation</Text>
                        <Text style={styles.mapDescription}>
                            Use this map to navigate directly to different screens in the app
                            without having to go through the normal flow.
                        </Text>
                        <AppNavigationMap onScreenSelect={navigateToScreen} />
                    </View>

                    <NavigationLegend />
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: 24,
        maxHeight: Dimensions.get('window').height * 0.9,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 20,
    },
    handle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 2,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000000',
    },
    closeButtonContainer: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: 'rgba(0,122,255,0.1)',
    },
    closeButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    content: {
        paddingHorizontal: 24,
    },
    navigationMapContainer: {
        marginBottom: 24,
    },
    mapTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: '#000',
    },
    mapDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 18,
    },
    treeContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        borderWidth: 0,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    navMapNode: {
        marginVertical: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    nodeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    nodeArrow: {
        fontSize: 10,
        marginRight: 10,
    },
    nodeLabel: {
        fontWeight: '600',
        fontSize: 15,
    },
    navButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    navButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    childrenContainer: {
        marginTop: 4,
        marginBottom: 6,
    },
    legendContainer: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: '#333',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendIcon: {
        width: 16,
        height: 16,
        borderRadius: 6,
        marginRight: 10,
    },
    legendText: {
        fontSize: 14,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.06)',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.04)',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    actionButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
    envContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    envTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: '#000',
    },
    envDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 18,
    },
    envComplete: {
        fontSize: 14,
        color: '#2ecc71',
        fontWeight: '500',
    },
    envVarItem: {
        backgroundColor: 'rgba(255,76,76,0.1)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#ff4c4c',
    },
    envVarName: {
        fontWeight: '600',
        color: '#ff4c4c',
    },
    envHelper: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default DevDrawer;
