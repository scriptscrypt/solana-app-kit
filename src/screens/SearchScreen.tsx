import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useAuth} from '../hooks/useAuth';
import {useNavigation} from '@react-navigation/native';

export default function SearchScreen() {
  const {logout} = useAuth(); // no parameter needed now
  const navigation = useNavigation();

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Search Screen</Text>
      <TouchableOpacity
        onPress={logout}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: '#ccc',
          borderRadius: 5,
        }}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Blink' as never)}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: '#007bff',
          borderRadius: 5,
        }}>
        <Text style={{color: '#fff'}}>Go to Blink Screen</Text>
      </TouchableOpacity>
    </View>
  );
}
