import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity , Button} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Search Screen</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Blink' as never)}
      >
        <Text style={styles.buttonText}>Go to Blink</Text>
      </TouchableOpacity>
      <Button
        title="Go to Wallet Screen"
        onPress={() => navigation.navigate('EmbeddedWallet' as never)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
