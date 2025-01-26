import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BasicButton from '../components/BasicButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <BasicButton
        title="Create Account"
        onPress={() => navigation.navigate('MainTabs')}
      />
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});
