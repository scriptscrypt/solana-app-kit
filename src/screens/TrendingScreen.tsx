import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const TrendingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Global Trending Tokens</Text>
    </View>
  );
};

export default TrendingScreen;

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
