/**
 * AutoAvatar Component
 * 
 * A smart avatar component that automatically generates DiceBear avatars for users
 * who don't have profile images. This component can be used as a drop-in replacement
 * for regular Image components in avatar contexts.
 * 
 * Features:
 * - Automatic DiceBear avatar generation for users without profile pictures
 * - Shimmer loading skeleton animation while loading (enabled by default)
 * - Fallback to initials if no image is available
 * - IPFS-aware image loading
 * - Consistent color generation based on user ID
 * - Fully customizable styling and behavior
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ImageStyle, Animated, Easing, Platform } from 'react-native';
import { IPFSAwareImage, getValidImageSource } from '../utils/IPFSImage';
import { useAutoAvatar } from '../hooks/useAutoAvatar';
import { DEFAULT_IMAGES } from '../config/constants';
import COLORS from '@/assets/colors';

interface AutoAvatarProps {
    /** User ID/wallet address */
    userId?: string;
    /** Existing profile picture URL */
    profilePicUrl?: string | null;
    /** Avatar size */
    size?: number;
    /** Custom style for the avatar container */
    style?: ViewStyle;
    /** Custom style for the avatar image */
    imageStyle?: ImageStyle;
    /** Whether to show initials as fallback */
    showInitials?: boolean;
    /** Username for generating initials */
    username?: string;
    /** Whether to show a loading indicator */
    showLoading?: boolean;
    /** Custom loading component */
    loadingComponent?: React.ReactNode;
    /** Whether to automatically generate DiceBear avatar */
    autoGenerate?: boolean;
    /** Callback when avatar loads successfully */
    onLoad?: () => void;
    /** Callback when avatar fails to load */
    onError?: () => void;
    /** Whether to show shimmer loading animation */
    showShimmer?: boolean;
}

/**
 * Shimmer Component for loading state
 */
const ShimmerAvatar: React.FC<{ size: number; style?: ViewStyle }> = ({ size, style }) => {
    const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.timing(shimmerAnimatedValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        );
        shimmerAnimation.start();
        return () => shimmerAnimation.stop();
    }, [shimmerAnimatedValue]);

    const translateX = shimmerAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-size * 2, size * 2],
    });

    const shimmerStyle: ViewStyle = useMemo(() => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.lighterBackground,
        overflow: 'hidden',
        ...style,
    }), [size, style]);

    return (
        <View style={shimmerStyle}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: COLORS.darkerBackground,
                        opacity: 0.6,
                        transform: [{ translateX }],
                    },
                ]}
            />
        </View>
    );
};

/**
 * Generate initials from username
 */
function getInitials(username?: string): string {
    if (!username) return '?';

    // If username appears to be wallet-derived (6 chars), use first 2 chars
    if (username.length === 6 && /^[a-zA-Z0-9]+$/.test(username)) {
        return username.substring(0, 2).toUpperCase();
    }

    // Otherwise get initials from words
    const words = username.split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Generate consistent background color based on user ID
 */
function getAvatarColor(userId?: string): string {
    if (!userId) return COLORS.greyMid;

    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Get a pastel hue
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 80%)`;
}

/**
 * AutoAvatar Component
 */
export const AutoAvatar: React.FC<AutoAvatarProps> = React.memo(({
    userId,
    profilePicUrl,
    size = 40,
    style,
    imageStyle,
    showInitials = true,
    username,
    showLoading = false,
    loadingComponent,
    autoGenerate = true,
    onLoad,
    onError,
    showShimmer = true,
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Memoize hook options to prevent unnecessary re-renders
    const hookOptions = useMemo(() => ({
        autoGenerate,
        preload: true,
        updateRedux: userId ? false : true, // Only update Redux for current user
    }), [autoGenerate, userId]);

    // Use the auto avatar hook
    const { avatarUrl, isLoading, isDiceBearAvatar } = useAutoAvatar(
        userId,
        profilePicUrl,
        hookOptions
    );

    // Determine which avatar URL to use - prioritize the hook's result
    const finalAvatarUrl = avatarUrl || profilePicUrl;

    // Generate initials and background color with memoization
    const initials = useMemo(() => getInitials(username), [username]);
    const backgroundColor = useMemo(() => getAvatarColor(userId), [userId]);

    // Container styles with memoization
    const containerStyle: ViewStyle = useMemo(() => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        ...style,
    }), [size, backgroundColor, style]);

    // Image styles with memoization
    const finalImageStyle: ImageStyle = useMemo(() => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        position: 'absolute',
        ...imageStyle,
    }), [size, imageStyle]);

    // Text styles for initials with memoization
    const textStyle: TextStyle = useMemo(() => ({
        fontSize: size * 0.45,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    }), [size]);

    // Handle image load with useCallback
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);
        onLoad?.();
    }, [onLoad]);

    // Handle image error with useCallback
    const handleImageError = useCallback(() => {
        setImageLoaded(false);
        setImageError(true);
        onError?.();
    }, [onError]);

    // Show shimmer if loading and no avatar URL yet
    const shouldShowShimmer = showShimmer && isLoading && !finalAvatarUrl;

    // Show custom loading component if provided and loading
    const shouldShowCustomLoading = showLoading && isLoading && !finalAvatarUrl && loadingComponent;

    // Show initials if we should and no image is loaded/loading
    const shouldShowInitials = showInitials && (!imageLoaded || imageError) && !shouldShowShimmer && !shouldShowCustomLoading;

    return (
        <View style={containerStyle}>
            {/* Show shimmer loading skeleton */}
            {shouldShowShimmer && (
                <ShimmerAvatar size={size} style={style} />
            )}

            {/* Show custom loading component if provided */}
            {shouldShowCustomLoading && loadingComponent}

            {/* Show default loading indicator if requested and no custom component */}
            {showLoading && isLoading && !finalAvatarUrl && !loadingComponent && !showShimmer && (
                <View style={[containerStyle, { backgroundColor: COLORS.greyLight }]}>
                    <Text style={[textStyle, { color: COLORS.greyDark }]}>...</Text>
                </View>
            )}

            {/* Show initials if no image loaded or as fallback */}
            {shouldShowInitials && (
                <Text style={textStyle}>{initials}</Text>
            )}

            {/* Show avatar image if available - using IPFSAwareImage for proper IPFS and cross-platform handling */}
            {finalAvatarUrl && (
                <IPFSAwareImage
                    source={getValidImageSource(finalAvatarUrl)}
                    defaultSource={DEFAULT_IMAGES.user}
                    style={finalImageStyle}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    // Use stable key for consistent rendering
                    key={`avatar-${userId}-${finalAvatarUrl}`}
                />
            )}
        </View>
    );
});

AutoAvatar.displayName = 'AutoAvatar';

/**
 * Simplified AutoAvatar for common use cases
 */
export const SimpleAutoAvatar: React.FC<{
    userId?: string;
    profilePicUrl?: string | null;
    username?: string;
    size?: number;
    style?: ViewStyle;
    showShimmer?: boolean;
}> = ({ userId, profilePicUrl, username, size = 40, style, showShimmer = true }) => {
    return (
        <AutoAvatar
            userId={userId}
            profilePicUrl={profilePicUrl}
            username={username}
            size={size}
            style={style}
            showInitials={true}
            autoGenerate={true}
            showShimmer={showShimmer}
        />
    );
};

export default AutoAvatar; 