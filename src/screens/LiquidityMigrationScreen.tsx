import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const LiquidityMigrationScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liquidity Migration</Text>
    </View>
  );
};

export default LiquidityMigrationScreen;

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
