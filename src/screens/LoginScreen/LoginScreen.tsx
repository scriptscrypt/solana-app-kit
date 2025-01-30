import React, {useEffect, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  Dimensions,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';

import Icons from '../../assests/svgs/index';
import styles from './LoginScreen.styles';

type LoginOptionsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoginOptions'
>;

interface LoginOptionsScreenProps {
  navigation: LoginOptionsScreenNavigationProp;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export default function LoginScreen({
  navigation,
}: LoginOptionsScreenProps) {
  const solanaDotOpacity = useRef(new Animated.Value(0)).current;
  const splashTextOpacity = useRef(new Animated.Value(0)).current;
  const smileScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(solanaDotOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(splashTextOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale up Smile Face
      Animated.spring(smileScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [solanaDotOpacity, splashTextOpacity, smileScale]);

  return (
    <View style={styles.container}>
      {/* Gradient Background (top: white, bottom: rgba(153,153,153,1)) */}
      <Svg
        height={SCREEN_HEIGHT}
        width={SCREEN_WIDTH}
        style={{position: 'absolute', top: 0, left: 0}}>
        <Defs>
          <LinearGradient
            id="verticalGradient"
            x1="0"
            y1="0"
            x2="0"
            y2={SCREEN_HEIGHT}>
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(153,153,153,1)" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#verticalGradient)"
        />
      </Svg>

      {/* Main SVG/Icons Container */}
      <View style={styles.svgContainer}>
        <Animated.View style={{opacity: solanaDotOpacity}}>
          <Icons.SolanaDot />
        </Animated.View>

        <Animated.View
          style={[styles.splashTextContainer, {opacity: splashTextOpacity}]}>
          <Icons.SplashText />
        </Animated.View>

        <Animated.View
          style={[
            styles.smileFaceContainer,
            {transform: [{scale: smileScale}]},
          ]}>
          <Icons.SmileFace />
        </Animated.View>
      </View>

      {/* Bottom Buttons Container: Google, Apple, and Email */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => console.log('Login with Google')}>
          <Icons.Google width={24} height={24} />
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => console.log('Login with Apple')}>
          <Icons.Apple width={24} height={24} />
          <Text style={styles.buttonText}>Login with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => console.log('Login with Email')}>
          <Icons.Device width={24} height={24} />
          <Text style={styles.buttonText}>Login with Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
