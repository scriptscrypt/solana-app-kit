import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const DexScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DEX Trading</Text>
    </View>
  );
};

export default DexScreen;

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
