import React from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {createTweetStyles} from './tweet.style';
import Icons from '../../assets/svgs';

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
  Icons.ReactionIdle,
  Icons.RetweetIdle,
  Icons.CommentIdle,
  Icons.ShareIdle,
  Icons.BookmarkIdle,
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
          <View style={styles.avatarContainer}>
            <Image source={tweet.avatar} style={styles.avatar} />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.header}>
              <Text style={styles.username}>{tweet.username}</Text>
              <Icons.BlueCheck />
              <Text style={styles.handle}>
                {tweet.handle} • {tweet.time}
              </Text>
              <Icons.DotsThree style={styles.menuIcon} />
            </View>

            <Text style={styles.tweetText}>
              {tweet.tweetContent.split('$SEND')[0]}
              {tweet.tweetContent.includes('$SEND') && (
                <Text style={styles.sendText}>$SEND</Text>
              )}
            </Text>

            <View style={styles.reactionContainer}>
              <View style={styles.reactionIcons}>
                {reactionIcons.map((Icon, iconIndex) => (
                  <Icon key={iconIndex} />
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

            <View style={styles.metricsContainer}>
              <View style={styles.threadAvatars}>
                <Image source={tweet.avatar} style={styles.threadAvatar1} />
                <Image
                  source={require('../../assets/images/thread-avatar-1.png')}
                  style={styles.threadAvatar2}
                />
                <Image
                  source={require('../../assets/images/thread-avatar-2.png')}
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
