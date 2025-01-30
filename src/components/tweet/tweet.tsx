import React from "react";
import {
  Image,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { styles } from "./tweet.style";

interface TweetData {
  username: string;
  handle: string;
  time: string;
  tweetContent: string;
  quoteCount: number;
  retweetCount: number;
  reactionCount: number;
  avatar: any; 
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "m";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  } else {
    return count.toString();
  }
};

const tweetsData: TweetData[] = [
  {
    username: "SEND",
    handle: "@sendcoin",
    time: "3s",
    tweetContent: "SEND is the new meta coin $SEND",
    quoteCount: 297,
    retweetCount: 5600,
    reactionCount: 13600,
    avatar: require("../../assets/pngs/Smiley.png"),
  },
  {
    username: "CryptoFan",
    handle: "@cryptofan",
    time: "10m",
    tweetContent: "Crypto is the future $BTC",
    quoteCount: 120,
    retweetCount: 2000,
    reactionCount: 5000,
    avatar: require("../../assets/pngs/Smiley.png"),
  },
  {
    username: "TechGuru",
    handle: "@techguru",
    time: "1h",
    tweetContent: "AI is revolutionizing the world $AI",
    quoteCount: 450,
    retweetCount: 9000,
    reactionCount: 23000,
    avatar: require("../../assets/pngs/Smiley.png"),
  },
];

const reactionIcons = [
  require("../../assets/pngs/React idle.png"),
  require("../../assets/pngs/Recast idle.png"),
  require("../../assets/pngs/Comment idle.png"),
  require("../../assets/pngs/share idle.png"),
  require("../../assets/pngs/Bookmark idle.png"),
];

const Tweet: React.FC = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const fontSize = isSmallScreen ? 14 : 15;
  const avatarSize = 19.43;

  const handleBuyButtonClick = () => {
    console.log("Buy button clicked!");
  };

  return (
    <>
      {tweetsData.map((tweet, index) => (
        <View
          key={index}
          style={[styles.container, { paddingHorizontal: isSmallScreen ? 8 : 12 }]}
        >
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <Image
              source={tweet.avatar}
              style={styles.avatar}
            />
          </View>

          {/* Tweet Content */}
          <View style={styles.infoContainer}>
            {/* Header (Username, Tag, Timestamp) */}
            <View style={styles.header}>
              <Text
                style={[styles.username, { fontSize: isSmallScreen ? 14 : 15 }]}
              >
                {tweet.username}
              </Text>
              <Image source={require("../../assets/pngs/Vector.png")} />
              <Text style={[styles.handle, { fontSize: isSmallScreen ? 12 : 14 }]}>
                {tweet.handle} • {tweet.time}
              </Text>
              <Image
                source={require("../../assets/pngs/ph_dots-three-bold.png")}
                style={styles.menuIcon}
              />
            </View>

            {/* Tweet Text */}
            <Text style={[styles.tweetText, { fontSize }]}>
              {tweet.tweetContent.split("$SEND")[0]}
              <Text style={{ color: "#32D4DE" }}>$SEND</Text>
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
                onPress={handleBuyButtonClick}
              >
                <Text style={styles.buyButtonText}>buy</Text>
              </TouchableOpacity>
            </View>

            {/* Metrics */}
            <View style={styles.metricsContainer}>
              <View style={{ flexDirection: "row", position: "relative" }}>
                <Image
                  source={tweet.avatar}
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    position: "absolute",
                    zIndex: 3,
                    left: -10,
                  }}
                />
                <Image
                  source={require("../../assets/pngs/Thread Avatars (1).png")}
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    position: "absolute",
                    left: -17,
                    zIndex: 2,
                  }}
                />
                <Image
                  source={require("../../assets/pngs/Thread Avatars.png")}
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    position: "absolute",
                    left: -24,
                    zIndex: 1,
                  }}
                />
              </View>
              <View
                style={{ display: "flex", flexDirection: "row", paddingLeft: 12 }}
              >
                <Text style={{ fontSize: 12, fontWeight: "500" }}>
                  +{formatCount(tweet.reactionCount)}
                </Text>
                <Text style={styles.metricsText}>
                  • <Text style={{ color: "black" }}>{formatCount(tweet.retweetCount)} </Text> Retweet
                </Text>
                <Text style={styles.metricsText}>
                  • <Text style={{ color: "black" }}>{formatCount(tweet.quoteCount)} </Text> Quote
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
