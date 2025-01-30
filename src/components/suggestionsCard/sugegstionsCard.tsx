import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {styles} from './suggestionsCard.style';

const SuggestionsCard = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/suggestionCardBg.png')}
        style={styles.image}
      />
      <View style={styles.imgBox}>
        <Image
          source={require('../../assets/images/image 24.png')}
          style={styles.profImg}
        />
      </View>

      <View style={styles.userInfoContainer}>
        <Text style={styles.usernameText}>0X5</Text>
        <Text style={styles.handleText}>@0X33</Text>
      </View>

      {/* Follow Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuggestionsCard;
