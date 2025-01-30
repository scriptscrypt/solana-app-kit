import React from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {createTweetStyles} from './tweet.style';

interface SingleTweet {
  username: string;
  handle: string;
  time: string;
  tweetContent: string;
  quoteCount: number;
  retweetCount: number;
  reactionCount: number;
  avatar: any;
}

interface TweetProps {
  data: SingleTweet[];
  onPress?: () => void;
}

// Example local helper for formatting counts (could also go in a utility file)
const formatCount = (count: number): string => {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1) + 'm';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
};

const reactionIcons = [
  require('../../assets/images/React idle.png'),
  require('../../assets/images/Recast idle.png'),
  require('../../assets/images/Comment idle.png'),
  require('../../assets/images/share idle.png'),
  require('../../assets/images/Bookmark idle.png'),
];

const Tweet: React.FC<TweetProps> = ({data, onPress}) => {
  const {width} = useWindowDimensions();
  const isSmallScreen = width < 400;
  const styles = createTweetStyles(isSmallScreen);

  const handleBuyButtonClick = () => {
    console.log('Buy button clicked!');
    if (onPress) {
      onPress();
    }
  };

  return (
    <>
      {data.map((tweet, index) => (
        <View key={index} style={styles.container}>
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <Image source={tweet.avatar} style={styles.avatar} />
          </View>

          {/* Tweet Content */}
          <View style={styles.infoContainer}>
            {/* Header (Username, Tag, Timestamp) */}
            <View style={styles.header}>
              <Text style={styles.username}>{tweet.username}</Text>
              <Image source={require('../../assets/images/Vector.png')} />
              <Text style={styles.handle}>
                {tweet.handle} • {tweet.time}
              </Text>
              <Image
                source={require('../../assets/images/ph_dots-three-bold.png')}
                style={styles.menuIcon}
              />
            </View>

            {/* Tweet Text */}
            <Text style={styles.tweetText}>
              {/** Everything before "$SEND" in normal text */}
              {tweet.tweetContent.split('$SEND')[0]}
              {tweet.tweetContent.includes('$SEND') && (
                <Text style={styles.sendText}>$SEND</Text>
              )}
            </Text>

            {/* Reaction & Buy Button */}
            <View style={styles.reactionContainer}>
              <View style={styles.reactionIcons}>
                {reactionIcons.map((icon, iconIndex) => (
                  <Image key={iconIndex} source={icon} />
                ))}
              </View>
              <TouchableOpacity
                style={styles.buyButton}
                accessible={true}
                accessibilityLabel="Buy Button"
                onPress={handleBuyButtonClick}>
                <Text style={styles.buyButtonText}>buy</Text>
              </TouchableOpacity>
            </View>

            {/* Metrics */}
            <View style={styles.metricsContainer}>
              <View style={styles.threadAvatars}>
                {/* Top-most avatar */}
                <Image source={tweet.avatar} style={styles.threadAvatar1} />
                {/* Middle avatar */}
                <Image
                  source={require('../../assets/images/Thread Avatars (1).png')}
                  style={styles.threadAvatar2}
                />
                {/* Bottom avatar */}
                <Image
                  source={require('../../assets/images/Thread Avatars.png')}
                  style={styles.threadAvatar3}
                />
              </View>

              <View style={styles.metricsInfo}>
                <Text style={styles.reactionsText}>
                  +{formatCount(tweet.reactionCount)}
                </Text>
                <Text style={styles.metricsText}>
                  •{' '}
                  <Text style={styles.metricsCount}>
                    {formatCount(tweet.retweetCount)}
                  </Text>{' '}
                  Retweet
                </Text>
                <Text style={styles.metricsText}>
                  •{' '}
                  <Text style={styles.metricsCount}>
                    {formatCount(tweet.quoteCount)}
                  </Text>{' '}
                  Quote
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </>
  );
};

export default Tweet;
