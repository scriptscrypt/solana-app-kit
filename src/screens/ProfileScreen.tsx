import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BasicButton from '../components/BasicButton';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <BasicButton title="Following" onPress={() => {}} />
      <BasicButton title="Edit Profile" onPress={() => {}} />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
});
