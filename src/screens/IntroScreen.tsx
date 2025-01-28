import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/RootNavigator';

type IntroScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Intro'
>;

interface IntroScreenProps {
  navigation: IntroScreenNavigationProp;
}

export default function IntroScreen({navigation}: IntroScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App!</Text>
      <Button
        title="Get Started"
        onPress={() => {
          navigation.navigate('MainTabs');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});
