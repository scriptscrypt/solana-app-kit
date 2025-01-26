import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const WalletScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Embedded Wallet</Text>
    </View>
  );
};

export default WalletScreen;

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
