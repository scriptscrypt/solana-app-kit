import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import Tweet from '../components/tweet/tweet';
import UserListing from '../components/userListing/userListing';
import SuggestionsCard from '../components/suggestionsCard/sugegstionsCard';
import { tweetsData } from '../mocks/tweets';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
            <SuggestionsCard/>
            <UserListing/>
            {/* <Tweet data={tweetsData}/> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff'},
  text: {fontSize: 20},
});
