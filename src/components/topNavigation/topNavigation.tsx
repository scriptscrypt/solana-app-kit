import React from 'react';
import {View} from 'react-native';
import {styles} from './topNavigation.style';
import Icons from '../../assets/svgs/index';

const TopNavigation = () => {
  return (
    <>
      <View style={styles.container}>
        <View style={{transform: [{rotate: '90deg'}]}}>
          <Icons.Arrow />
        </View>

        <View
          style={styles.rightIconGrp}>
          <Icons.MessageIcon />
          <Icons.BellIcon />
          <Icons.DotsThree />
        </View>
      </View>
    </>
  );
};

export default TopNavigation;
