import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {styles} from './otherProfile.style';
import COLORS from '../../assets/colors';
import ProfileIcons from '../../assets/svgs';
import PerksCard from '../perksCard/perksCard';
import BuyCard from '../buyCard/buyCrad';
import SwipeTabs from '../slider/slider';
import AddButton from '../addButton/addButton';
import TopNavigation from '../topNavigation/topNavigation';
const OtherProfile = () => {
  
  const findMentioned = (text: String) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('@')) {
        return (
          <Text key={index} style={styles.atMention}>
            {word}{' '}
          </Text>
        );
      }
      return word + ' ';
    });
  };

  return (
    <>
      <SafeAreaView style={{backgroundColor: 'white', flex: 1 }}>
         {/* navigation */}
      <TopNavigation/>
        {/* profile container  */}
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profcontainer}>
            {/* profile info  */}
            <View style={styles.profileInfo}>
          
              <View style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  {/* profile image  */}
                  <View style={styles.profImgContainer}>
                    <Image
                      style={styles.profImg}
                      source={require('../../assets/images/User2.png')}
                    />
                  </View>
                  <View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '600',
                          lineHeight: 22,
                        }}>
                        Yash
                      </Text>
                      <ProfileIcons.SubscriptionTick />
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 12,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '500',
                          textAlign: 'left',
                          color: '#999999',
                        }}>
                        @yashmm
                      </Text>
                      <Text
                        style={{
                          backgroundColor: '#F6F7F9',
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          paddingVertical: 4,
                          fontSize: 12,
                          fontWeight: '500',
                          textAlign: 'left',
                          color: '#999999',
                        }}>
                        Follows you
                      </Text>
                    </View>
                  </View>
                </View>

                {/* bio section  */}
                <View>
                  <Text style={styles.bioSection}>
                    {findMentioned(
                      'nCMO @solana –– janitor @sendaifun & @thesendcoin eco —founder: solana ai hackathon — helping solana founders –– icall out bs + bullpost what i like. nfa',
                    )}
                  </Text>
                </View>

                {/* follower and following count  */}
                <View style={{display: 'flex', flexDirection: 'row', gap: 12}}>
                  <View style={{display: 'flex', flexDirection: 'row', gap: 2}}>
                    <Text style={{fontSize: 12, fontWeight: 600}}>N/A</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        textAlign: 'left',
                        color: '#B7B7B7',
                      }}>
                      Followers
                    </Text>
                  </View>
                  <View style={{display: 'flex', flexDirection: 'row', gap: 2}}>
                    <Text style={{fontSize: 12, fontWeight: 600}}>N/A</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        textAlign: 'left',
                        color: '#B7B7B7',
                      }}>
                      Following
                    </Text>
                  </View>
                  <View style={{display: 'flex', flexDirection: 'row', gap: 2}}>
                    <ProfileIcons.PinLocation />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '500',
                        textAlign: 'left',
                        color: '#B7B7B7',
                      }}>
                      Location
                    </Text>
                  </View>
                </View>
              </View>
              {/* buy card  */}
              <BuyCard />
              {/* perks card  */}
              <PerksCard />
              {/* following stats */}
              <View style={styles.followingStatsContainer}>
                <View style={styles.imageContainer}>
                  <Image
                    source={require('../../assets/images/reaction-user-1.png')}
                    style={styles.firstimage}
                  />
                  <Image
                    source={require('../../assets/images/reaction-user-2.png')}
                    style={[styles.firstimage, styles.secondImage]}
                  />
                  <Image
                    source={require('../../assets/images/reaction-user-1.png')}
                    style={[styles.firstimage, styles.secondImage]}
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.text}>
                    Followed by @solana, @toly and 100K others you know
                  </Text>
                </View>
              </View>
              {/* follow back and send to wallet button  */}
              {/* <View style={styles.btnGrp}>
                <TouchableOpacity style={styles.followBtn}>
                  <Text style={styles.followBtnText}>Follow Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sendToWalletBtn}>
                  <Text style={styles.sendToWalletBtnText}>Send to Wallet</Text>
                </TouchableOpacity>
              </View> */}

              {/* add button and follow back and send to wallet  */}
              <View>
                <AddButton />
              </View>
            </View>
          </View>

          {/* slider container  */}

          <View style={{height: 900}}>
            <SwipeTabs />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OtherProfile;
