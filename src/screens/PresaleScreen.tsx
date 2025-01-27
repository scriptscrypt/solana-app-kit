import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const PresaleScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presale</Text>
    </View>
  );
};

export default PresaleScreen;

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
