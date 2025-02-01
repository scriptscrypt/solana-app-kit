import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import OtherProfile from '../components/otherProfile/otherProfile';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <OtherProfile/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {fontSize: 20},
});
