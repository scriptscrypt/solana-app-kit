import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Icons from '../../assets/svgs';
import TradeCard from '../../components/TradeCard/TradeCard';
import {styles} from './FeedScreen.styles';

type PostType = 'text-only' | 'text-image' | 'text-trade';

interface FeedItem {
  id: string;
  userAvatar: any;
  username: string;
  postType: PostType;
  text: string;
  postImage?: any;
  tradeData?: {
    tokenAvatar: any;
    tokenName: string;
    tokenPriceUsdLeft: string;
    tokenPriceSolRight: string;
    tokenPriceUsdRight: string;
  };
}

const initialFeeds: FeedItem[] = [
  {
    id: '1',
    userAvatar: require('../../assets/images/User2.png'),
    username: 'Yash',
    postType: 'text-only',
    text: 'This is just a text-only post. Hello, Solana!',
  },
  {
    id: '2',
    userAvatar: require('../../assets/images/User3.png'),
    username: 'Aryan',
    postType: 'text-image',
    text: 'Check out this cool image!',
    postImage: require('../../assets/images/User2Post.png'),
  },
  {
    id: '3',
    userAvatar: require('../../assets/images/image 24.png'),
    username: 'Charlie',
    postType: 'text-trade',
    text: 'I just took this interesting trade on Solana!',
    tradeData: {
      tokenAvatar: require('../../assets/images/Smiley.png'),
      tokenName: 'SOL Token',
      tokenPriceUsdLeft: '$19.50',
      tokenPriceSolRight: '1.00 SOL',
      tokenPriceUsdRight: '$19.50',
    },
  },
];

export default function FeedScreen() {
  const [textValue, setTextValue] = useState('');

  const renderItem = ({item}: {item: FeedItem}) => {
    return (
      <View style={styles.feedItemContainer}>
        <View style={styles.feedAvatarContainer}>
          <Image source={item.userAvatar} style={styles.feedAvatar} />
          <View style={styles.plusIconContainer}>
            <Icons.ProfilePlusIcon width={16} height={16} />
          </View>
        </View>

        <View style={styles.feedContent}>
          <Text style={styles.feedUsername}>{item.username}</Text>
          <Text style={styles.feedText}>{item.text}</Text>

          {/* If post has an image */}
          {item.postType === 'text-image' && item.postImage && (
            <Image source={item.postImage} style={styles.feedPostImage} />
          )}

          {/* If post has trade data, render the trade card */}
          {item.postType === 'text-trade' && item.tradeData && (
            <TradeCard
              tokenAvatar={item.tradeData.tokenAvatar}
              tokenName={item.tradeData.tokenName}
              tokenPriceUsdLeft={item.tradeData.tokenPriceUsdLeft}
              tokenPriceSolRight={item.tradeData.tokenPriceSolRight}
              tokenPriceUsdRight={item.tradeData.tokenPriceUsdRight}
            />
          )}

          {/* Add comment, retweet, and reaction icons with numbers */}
          <View style={styles.iconsRow}>
            <View style={styles.leftIcons}>
              <Icons.CommentIdle width={20} height={20} />
              <Text style={styles.iconText}>12</Text>
              <Icons.RetweetIdle width={20} height={20} />
              <Text style={styles.iconText}>12</Text>
              <Icons.ReactionIdle width={20} height={20} />
              <View style={styles.reactionUsersContainer}>
                <Image
                  source={require('../../assets/images/reaction-user-1.png')}
                  style={styles.reactionUserImage}
                />
                <Image
                  source={require('../../assets/images/reaction-user-2.png')}
                  style={[
                    styles.reactionUserImage,
                    styles.reactionUserImageOverlap,
                  ]}
                />
              </View>
              <Text style={styles.iconText}>23</Text>
            </View>

            {/* Add grid and bookmark icons to the right */}
            <View style={styles.rightIcons}>
              <Icons.GridIcon width={18} height={18} />
              <Icons.BookmarkIdle width={18} height={18} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Icons.SplashText width={120} height={120} />
      </View>

      <View style={styles.postSection}>
        <View style={styles.postAvatarContainer}>
          <Image
            source={require('../../assets/images/User.png')}
            style={styles.postAvatar}
          />
          <View style={styles.plusIconContainer}>
            <Icons.ProfilePlusIcon width={16} height={16} />
          </View>
        </View>

        {/* Middle area: username + input + icons row */}
        <View style={styles.postMiddle}>
          <Text style={styles.postUsername}>Semi</Text>
          <TextInput
            style={styles.postInput}
            placeholder="What's happening?"
            placeholderTextColor="#999"
            value={textValue}
            onChangeText={setTextValue}
          />

          <View style={styles.iconsRow}>
            <View style={styles.leftIcons}>
              <Icons.MediaIcon width={18} height={18} />
              <Icons.Target width={18} height={18} />
              <Icons.BlinkEye width={18} height={18} />
            </View>

            <TouchableOpacity
              onPress={() => {
                /* handle the post action here */
              }}>
              <Icons.ShareIdle width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* List of feeds */}
      <FlatList
        data={initialFeeds}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.feedListContainer}
      />
    </SafeAreaView>
  );
}
