import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const TokenLaunchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Token Launch</Text>
    </View>
  );
};

export default TokenLaunchScreen;

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
