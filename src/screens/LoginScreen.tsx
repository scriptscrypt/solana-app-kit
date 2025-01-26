import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BasicButton from '../components/BasicButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <BasicButton
        title="Login"
        onPress={() => navigation.navigate('MainTabs')}
      />
      <BasicButton
        title="Go to Signup"
        onPress={() => navigation.navigate('Signup')}
      />
    </View>
  );
};

export default LoginScreen;

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
