import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import COLORS from '@/assets/colors';

const { width } = Dimensions.get('window');

// Re-usable SkeletonElement with shimmer effect
const SkeletonElement = ({ style }: { style: any }) => {
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
        outputRange: [-width, width],
    });

    return (
        <View style={[styles.skeletonElement, style]}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    styles.shimmer,
                    { transform: [{ translateX }] },
                ]}
            />
        </View>
    );
};

// Skeleton for a single feed item
const FeedItemSkeleton = () => (
    <View style={styles.feedItemContainer}>
        <View style={styles.feedItemHeader}>
            <SkeletonElement style={styles.avatar} />
            <View style={styles.userInfoContainer}>
                <SkeletonElement style={[styles.textLine, { width: '50%', height: 16 }]} />
                <SkeletonElement style={[styles.textLine, { width: '30%', height: 12, marginTop: 6 }]} />
            </View>
        </View>
        <SkeletonElement style={[styles.textLine, { width: '95%', height: 14, marginTop: 12 }]} />
        <SkeletonElement style={[styles.textLine, { width: '90%', height: 14, marginTop: 6 }]} />
        <SkeletonElement style={[styles.textLine, { width: '70%', height: 14, marginTop: 6 }]} />
        <SkeletonElement style={styles.imagePlaceholder} />
    </View>
);

// Main FeedSkeleton component - renders a few feed item skeletons
const FeedSkeleton = ({ itemCount = 3 }: { itemCount?: number }) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: itemCount }).map((_, index) => (
                <FeedItemSkeleton key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10, // Consistent with feed padding
        backgroundColor: COLORS.background,
    },
    skeletonElement: {
        backgroundColor: COLORS.greyDark, // Using established color
        borderRadius: 4,
        overflow: 'hidden',
    },
    shimmer: {
        backgroundColor: COLORS.greyMid, // Using established color
        opacity: 0.6,
    },
    feedItemContainer: {
        backgroundColor: COLORS.background, // Matching thread item background
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.greyDark, // Subtle border for item separation
    },
    feedItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfoContainer: {
        marginLeft: 10,
    },
    textLine: {
        borderRadius: 3,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 6,
        marginTop: 12,
    },
});

export default FeedSkeleton; 