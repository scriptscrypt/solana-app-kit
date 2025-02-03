import React from 'react';
import { Image, View } from 'react-native';
import { styles } from './collectibles.style';

const Collectibles = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/Collectibles.png')} style={styles.image} />
      <Image source={require('../../assets/images/Collectibles2.png')} style={styles.image} />
      <Image source={require('../../assets/images/Collectibles1.png')} style={styles.image} />
      <Image source={require('../../assets/images/Collectibles3.png')} style={styles.image} />
    </View>
  );
};

export default Collectibles;
