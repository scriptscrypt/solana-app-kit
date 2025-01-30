import React, {useEffect, useRef} from 'react';
import {View, TouchableOpacity, Animated, Easing} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/RootNavigator';
import Icons from '../../assets/svgs/index';
import styles from './IntroScreen.styles';

type IntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Intro'
>;

interface IntroScreenProps {
  navigation: IntroScreenNavigationProp;
}

export default function IntroScreen({navigation}: IntroScreenProps) {
  const solanaDotOpacity = useRef(new Animated.Value(0)).current;
  const splashTextOpacity = useRef(new Animated.Value(0)).current;
  const smileScale = useRef(new Animated.Value(0.5)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [buttonScale]);

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Animated.View style={{opacity: solanaDotOpacity}}>
          <Icons.SolanaDot />
        </Animated.View>

        <Animated.View
          style={[
            styles.splashTextContainer,
            {
              opacity: splashTextOpacity,
            },
          ]}>
          <Icons.SplashText />
        </Animated.View>

        <Animated.View
          style={[
            styles.smileFaceContainer,
            {
              transform: [{scale: smileScale}],
            },
          ]}>
          <Icons.SmileFace />
        </Animated.View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.bottomRectContainer}
        onPress={() => {
          navigation.navigate('LoginOptions');
        }}>
        <Animated.View style={{transform: [{scale: buttonScale}]}}>
          <Icons.GettingStartedButton />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
