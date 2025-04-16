// File: src/screens/LoginScreen/LoginScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, Dimensions, Alert } from 'react-native';
import Icons from '../../../assets/svgs/index';
import styles from './LoginScreen.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import COLORS from '../../../assets/colors';
import EmbeddedWalletAuth from '../../../modules/walletProviders/components/wallet/EmbeddedWallet';
import TurnkeyWalletAuth from '../../../modules/walletProviders/components/turnkey/TurnkeyWallet';
import { loginSuccess } from '../../../state/auth/reducer';
import { RootState } from '../../../state/store';
import { useCustomization } from '../../../CustomizationProvider';
import axios from 'axios';
import { SERVER_URL } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SERVER_BASE_URL = SERVER_URL || 'http://localhost:3000';

// SVG animation configurations
const SVG_CONFIG = {
  circle: {
    initialPosition: { top: SCREEN_HEIGHT * 0.15, left: SCREEN_WIDTH * 0.05 },
    size: { width: 50, height: 50 },
    animation: { type: 'rotate', duration: 10000 },
  },
  leftStart: {
    initialPosition: { top: SCREEN_HEIGHT * 0.25, left: -20 },
    size: { width: 80, height: 80 },
    animation: { type: 'fadeInOut', duration: 3000 },
  },
  leftEllipse: {
    initialPosition: { top: SCREEN_HEIGHT * 0.25, left: -SCREEN_WIDTH * 0.44 },
    size: { width: 300, height: 300 },
  },
  plus: {
    initialPosition: { top: SCREEN_HEIGHT * 0.5, left: SCREEN_WIDTH * 0.2 },
    size: { width: 30, height: 30 },
    animation: { type: 'translate', duration: 4000, offsetY: 20 },
  },
  rect: {
    initialPosition: { top: SCREEN_HEIGHT * 0.65, left: SCREEN_WIDTH * 0.05 },
    size: { width: 40, height: 40 },
    animation: { type: 'rotate', duration: 6000 },
  },
  yellowBoomerang: {
    initialPosition: { top: SCREEN_HEIGHT * 0.75, left: SCREEN_WIDTH * 0.15 },
    size: { width: 70, height: 70 },
    animation: { type: 'fadeInOut', duration: 5000 },
  },
  leftUnion: {
    initialPosition: { top: SCREEN_HEIGHT * 0.35, left: -10 },
    size: { width: 120, height: 120 },
    animation: { type: 'none' },
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
          duration: SVG_CONFIG.leftStart.animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(leftStartAnim, {
          toValue: 0.3,
          duration: SVG_CONFIG.leftStart.animation.duration / 2,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Plus translation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(plusAnim, {
          toValue: SVG_CONFIG.plus.animation.offsetY,
          duration: SVG_CONFIG.plus.animation.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(plusAnim, {
          toValue: 0,
          duration: SVG_CONFIG.plus.animation.duration / 2,
          useNativeDriver: true,
        })
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
    switch(authConfig.provider) {
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
            top: SVG_CONFIG.leftStart.initialPosition.top,
            left: SVG_CONFIG.leftStart.initialPosition.left,
            width: SVG_CONFIG.leftStart.size.width,
            height: SVG_CONFIG.leftStart.size.height,
            opacity: leftStartAnim,
          },
        ]}
      >
        <Icons.LeftStart width="100%" height="100%" />
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

      {/* Plus SVG with translation animation */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.plus.initialPosition.top,
            left: SVG_CONFIG.plus.initialPosition.left,
            width: SVG_CONFIG.plus.size.width,
            height: SVG_CONFIG.plus.size.height,
            transform: [{ translateY: plusAnim }],
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
          },
        ]}
      >
        <Icons.YellowBoomerang width="100%" height="100%" />
      </Animated.View>

      {/* LeftUnion SVG without animation */}
      <View
        style={[
          {
            position: 'absolute',
            top: SVG_CONFIG.leftUnion.initialPosition.top,
            left: SVG_CONFIG.leftUnion.initialPosition.left,
            width: SVG_CONFIG.leftUnion.size.width,
            height: SVG_CONFIG.leftUnion.size.height,
          },
        ]}
      >
        <Icons.LeftUnion width="100%" height="100%" />
      </View>
    </View>
  );

  return (
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
  );
}
