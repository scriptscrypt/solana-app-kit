import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Icons from '@/assets/svgs/index';
import styles from './LoginScreen.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import EmbeddedWalletAuth from '@/modules/walletProviders/components/wallet/EmbeddedWallet';
import TurnkeyWalletAuth from '@/modules/walletProviders/components/turnkey/TurnkeyWallet';
import { loginSuccess } from '@/shared/state/auth/reducer';
import { RootState } from '@/shared/state/store';
import { useCustomization } from '@/config/CustomizationProvider';
import axios from 'axios';
import { SERVER_URL } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SERVER_BASE_URL = SERVER_URL || 'http://localhost:3000';

// SVG animation configurations
const SVG_CONFIG = {
  circle: {
    initialPosition: { top: SCREEN_HEIGHT * 0.51, left: SCREEN_WIDTH * 0.06 },
    size: { width: 80, height: 80 },
    animation: { type: 'rotate', duration: 10000 },
  },
  leftStar: {
    initialPosition: { top: SCREEN_HEIGHT * 0.42, left: 80 },
    size: { width: 24, height: 24 },
    animation: { type: 'fadeInOut', duration: 3000 },
  },
  leftEllipse: {
    initialPosition: { top: SCREEN_HEIGHT * 0.23, left: -SCREEN_WIDTH * 0.55 },
    size: { width: 340, height: 340 },
  },
  plus: {
    initialPosition: { top: SCREEN_HEIGHT * 0.3, left: SCREEN_WIDTH * 0.13 },
    size: { width: 80, height: 80 },
    animation: { type: 'jerkyRotate', duration: 3000 },
  },
  rect: {
    initialPosition: { top: SCREEN_HEIGHT * 0.34, left: SCREEN_WIDTH * 0.34 },
    size: { width: 58, height: 58 },
    animation: { type: 'rotate', duration: 6000 },
  },
  yellowBoomerang: {
    initialPosition: { top: SCREEN_HEIGHT * 0.43, left: SCREEN_WIDTH * 0.27 },
    size: { width: 80, height: 80 },
    animation: { type: 'fadeInOut', duration: 5000 },
  },
  setting: {
    initialPosition: { top: SCREEN_HEIGHT * 0.36, left: -63 },
    size: { width: 130, height: 130 },
    animation: { type: 'varyingSpeedRotate', duration: 8000 },
  },
  // Right SVG configurations
  rightRectangle: {
    initialPosition: { top: SCREEN_HEIGHT * 0.53, right: SCREEN_WIDTH * 0.27 },
    size: { width: 60, height: 60 },
    animation: { type: 'rotate', duration: 8000 },
  },
  rightSwap: {
    initialPosition: { top: SCREEN_HEIGHT * 0.5, right: SCREEN_WIDTH * 0.04 },
    size: { width: 100, height: 100 },
    animation: { type: 'jerkyRotate', duration: 4000 },
  },
  rightBoomerang: {
    initialPosition: { top: SCREEN_HEIGHT * 0.4, right: SCREEN_WIDTH * 0.2 },
    size: { width: 80, height: 80 },
    animation: { type: 'fadeInOut', duration: 4500 },
  },
  rightGrid: {
    initialPosition: { top: SCREEN_HEIGHT * 0.25, right: -SCREEN_WIDTH * 0.11 },
    size: { width: 100, height: 100 },
    animation: { type: 'pulseScale', duration: 3000 },
  },
  rightZigzag: {
    initialPosition: { top: SCREEN_HEIGHT * 0.36, right: -SCREEN_WIDTH * 0.25 },
    size: { width: 160, height: 160 },
    animation: { type: 'fadeInOut', duration: 6000 },
  },
  rightEllipse: {
    initialPosition: { top: SCREEN_HEIGHT * 0.23, right: -SCREEN_WIDTH * 0.55 },
    size: { width: 340, height: 340 },
  },
};

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { auth: authConfig } = useCustomization();

  // Animation values for SVG elements
  const circleAnim = useRef(new Animated.Value(0)).current;
  const leftStartAnim = useRef(new Animated.Value(0)).current;
  const plusAnim = useRef(new Animated.Value(0)).current;
  const rectAnim = useRef(new Animated.Value(0)).current;
  const yellowBoomerangAnim = useRef(new Animated.Value(1)).current;

  // Animation values for right SVG elements
  const rightRectangleAnim = useRef(new Animated.Value(0)).current;
  const rightSwapAnim = useRef(new Animated.Value(0)).current;
  const rightBoomerangAnim = useRef(new Animated.Value(1)).current;
  const rightZigzagAnim = useRef(new Animated.Value(1)).current;

  // New animation values for the updated animations
  const settingAnim = useRef(new Animated.Value(0)).current;

  // Single animation value for grid scaling
  const gridScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    startAnimations();

    // If already logged in, navigate to MainTabs
    if (isLoggedIn) {
      navigation.navigate('MainTabs');
    }
  }, [isLoggedIn, navigation]);

  const startAnimations = () => {
    // Circle rotation animation
    Animated.loop(
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: SVG_CONFIG.circle.animation.duration,
        useNativeDriver: true,
      })
    ).start();

    // Left start fade animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftStartAnim, {
          toValue: 1,
          duration: SVG_CONFIG.leftStar.animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(leftStartAnim, {
          toValue: 0.3,
          duration: SVG_CONFIG.leftStar.animation.duration / 2,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Plus jerky rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(plusAnim, {
          toValue: -0.05,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(plusAnim, {
          toValue: 0.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(plusAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000)
      ])
    ).start();

    // Rect rotation animation
    Animated.loop(
      Animated.timing(rectAnim, {
        toValue: 1,
        duration: SVG_CONFIG.rect.animation.duration,
        useNativeDriver: true,
      })
    ).start();

    // Yellow boomerang fade animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(yellowBoomerangAnim, {
          toValue: 0.4,
          duration: SVG_CONFIG.yellowBoomerang.animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(yellowBoomerangAnim, {
          toValue: 1,
          duration: SVG_CONFIG.yellowBoomerang.animation.duration / 2,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Setting varying speed rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(settingAnim, {
          toValue: 0.2,
          duration: 2000, // Slow rotation
          useNativeDriver: true,
        }),
        Animated.timing(settingAnim, {
          toValue: 0.4,
          duration: 1000, // Medium rotation
          useNativeDriver: true,
        }),
        Animated.timing(settingAnim, {
          toValue: 1,
          duration: 800, // Fast rotation
          useNativeDriver: true,
        }),
        Animated.timing(settingAnim, {
          toValue: 1.2,
          duration: 1500, // Slowing down
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Right rectangle rotation animation
    Animated.loop(
      Animated.timing(rightRectangleAnim, {
        toValue: 1,
        duration: SVG_CONFIG.rightRectangle.animation.duration,
        useNativeDriver: true,
      })
    ).start();

    // Right swap jerky rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightSwapAnim, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwapAnim, {
          toValue: 0.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwapAnim, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwapAnim, {
          toValue: 0.3,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwapAnim, {
          toValue: 0.7,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwapAnim, {
          toValue: 0.5,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(rightSwapAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ])
    ).start();

    // Right boomerang fade animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightBoomerangAnim, {
          toValue: 0.4,
          duration: SVG_CONFIG.rightBoomerang.animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(rightBoomerangAnim, {
          toValue: 1,
          duration: SVG_CONFIG.rightBoomerang.animation.duration / 2,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Right zigzag fade animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightZigzagAnim, {
          toValue: 0.5,
          duration: SVG_CONFIG.rightZigzag.animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(rightZigzagAnim, {
          toValue: 1,
          duration: SVG_CONFIG.rightZigzag.animation.duration / 2,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Grid pulse animation (scale only)
    Animated.loop(
      Animated.sequence([
        // Scale animation
        Animated.sequence([
          Animated.timing(gridScaleAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(gridScaleAnim, {
            toValue: 0.9,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(gridScaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1000),
      ])
    ).start();
  };

  const handleWalletConnected = async (info: { provider: string; address: string }) => {
    console.log('Wallet connected:', info);
    try {
      // First create the user entry in the database
      await axios.post(`${SERVER_BASE_URL}/api/profile/createUser`, {
        userId: info.address,
        username: info.address, // Initially set to wallet address
        handle: '@' + info.address.slice(0, 6),
      });

      // Then proceed with login
      dispatch(
        loginSuccess({
          provider: info.provider as 'privy' | 'dynamic' | 'turnkey' | 'mwa',
          address: info.address,
        }),
      );
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      Alert.alert(
        'Connection Error',
        'Successfully connected to wallet but encountered an error proceeding to the app.',
      );
    }
  };

  const renderAuthComponent = () => {
    switch (authConfig.provider) {
      case 'turnkey':
        return <TurnkeyWalletAuth onWalletConnected={handleWalletConnected} />;
      case 'privy':
      case 'dynamic':
      default:
        return <EmbeddedWalletAuth onWalletConnected={handleWalletConnected} />;
    }
  };

  // Background shapes with animations
  const renderBackgroundShapes = () => (
    <View style={styles.shapesBackground}>
      {/* Circle SVG with rotation animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.circle.initialPosition.top,
            left: SVG_CONFIG.circle.initialPosition.left,
            width: SVG_CONFIG.circle.size.width,
            height: SVG_CONFIG.circle.size.height,
            transform: [
              {
                rotate: circleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.LeftCircle width="100%" height="100%" />
      </Animated.View>

      {/* LeftStart SVG with fade animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.leftStar.initialPosition.top,
            left: SVG_CONFIG.leftStar.initialPosition.left,
            width: SVG_CONFIG.leftStar.size.width,
            height: SVG_CONFIG.leftStar.size.height,
            opacity: leftStartAnim,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.LeftStar width="100%" height="100%" />
      </Animated.View>

      {/* LeftEllipse SVG with scale animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.leftEllipse.initialPosition.top,
            left: SVG_CONFIG.leftEllipse.initialPosition.left,
            width: SVG_CONFIG.leftEllipse.size.width,
            height: SVG_CONFIG.leftEllipse.size.height,
          },
        ]}
      >
        <Icons.LeftEllipse width="100%" height="100%" />
      </Animated.View>

      {/* Plus SVG with jerky rotation animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.plus.initialPosition.top,
            left: SVG_CONFIG.plus.initialPosition.left,
            width: SVG_CONFIG.plus.size.width,
            height: SVG_CONFIG.plus.size.height,
            transform: [
              {
                rotate: plusAnim.interpolate({
                  inputRange: [-0.05, 0, 0.05],
                  outputRange: ['-10deg', '0deg', '10deg'],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.LeftPlus width="100%" height="100%" />
      </Animated.View>

      {/* Rect SVG with rotation animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rect.initialPosition.top,
            left: SVG_CONFIG.rect.initialPosition.left,
            width: SVG_CONFIG.rect.size.width,
            height: SVG_CONFIG.rect.size.height,
            transform: [
              {
                rotate: rectAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.LeftRect width="100%" height="100%" />
      </Animated.View>

      {/* YellowBoomerang SVG with fade animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.yellowBoomerang.initialPosition.top,
            left: SVG_CONFIG.yellowBoomerang.initialPosition.left,
            width: SVG_CONFIG.yellowBoomerang.size.width,
            height: SVG_CONFIG.yellowBoomerang.size.height,
            opacity: yellowBoomerangAnim,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.YellowBoomerang width="100%" height="100%" />
      </Animated.View>

      {/* Setting SVG with varying speed rotation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.setting.initialPosition.top,
            left: SVG_CONFIG.setting.initialPosition.left,
            width: SVG_CONFIG.setting.size.width,
            height: SVG_CONFIG.setting.size.height,
            transform: [
              {
                rotate: settingAnim.interpolate({
                  inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2],
                  outputRange: ['0deg', '30deg', '90deg', '180deg', '270deg', '360deg', '420deg'],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.Setting width="100%" height="100%" />
      </Animated.View>

      {/* Right Rectangle SVG with rotation animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rightRectangle.initialPosition.top,
            right: SVG_CONFIG.rightRectangle.initialPosition.right,
            width: SVG_CONFIG.rightRectangle.size.width,
            height: SVG_CONFIG.rightRectangle.size.height,
            transform: [
              {
                rotate: rightRectangleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.RightRectangle width="100%" height="100%" />
      </Animated.View>

      {/* Right Swap SVG with jerky rotation animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rightSwap.initialPosition.top,
            right: SVG_CONFIG.rightSwap.initialPosition.right,
            width: SVG_CONFIG.rightSwap.size.width,
            height: SVG_CONFIG.rightSwap.size.height,
            transform: [
              {
                rotate: rightSwapAnim.interpolate({
                  inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 1],
                  outputRange: ['0deg', '30deg', '10deg', '45deg', '15deg', '90deg', '180deg', '360deg'],
                }),
              },
              {
                scale: rightSwapAnim.interpolate({
                  inputRange: [0, 0.4, 0.7, 1],
                  outputRange: [0.9, 1.05, 0.95, 1],
                }),
              },
            ],
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.RightSwap width="100%" height="100%" />
      </Animated.View>

      {/* Right Boomerang SVG with fade animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rightBoomerang.initialPosition.top,
            right: SVG_CONFIG.rightBoomerang.initialPosition.right,
            width: SVG_CONFIG.rightBoomerang.size.width,
            height: SVG_CONFIG.rightBoomerang.size.height,
            opacity: rightBoomerangAnim,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.RightBoomerang width="100%" height="100%" />
      </Animated.View>

      {/* Right Grid SVG with pulse scale animation (no rotation or glow) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rightGrid.initialPosition.top,
            right: SVG_CONFIG.rightGrid.initialPosition.right,
            width: SVG_CONFIG.rightGrid.size.width,
            height: SVG_CONFIG.rightGrid.size.height,
            transform: [
              { scale: gridScaleAnim }
            ]
          },
        ]}
      >
        <Icons.RightGrid width="100%" height="100%" />
      </Animated.View>

      {/* Right Zigzag SVG with fade animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rightZigzag.initialPosition.top,
            right: SVG_CONFIG.rightZigzag.initialPosition.right,
            width: SVG_CONFIG.rightZigzag.size.width,
            height: SVG_CONFIG.rightZigzag.size.height,
            opacity: rightZigzagAnim,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Icons.RightZigzag width="100%" height="100%" />
      </Animated.View>

      {/* Right Ellipse SVG without animation */}
      <View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.rightEllipse.initialPosition.top,
            right: SVG_CONFIG.rightEllipse.initialPosition.right,
            width: SVG_CONFIG.rightEllipse.size.width,
            height: SVG_CONFIG.rightEllipse.size.height,
          },
        ]}
      >
        <Icons.RightEllipse width="100%" height="100%" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <View style={styles.container}>
        {renderBackgroundShapes()}

        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subtitleText}>Sign in to your account</Text>
        </View>

        {renderAuthComponent()}

        <Text style={styles.agreementText}>
          By continuing you agree to our t&c and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}
