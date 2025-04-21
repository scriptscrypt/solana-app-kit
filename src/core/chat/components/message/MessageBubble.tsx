import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageBubbleProps } from './message.types';
import { messageBubbleStyles } from './message.styles';
import { mergeStyles } from '@/core/thread/utils';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import MessageTradeCard from './MessageTradeCard';
import MessageNFT from './MessageNFT';
import COLORS from '@/assets/colors';
import SectionTextImage from '@/core/thread/components/sections/SectionTextImage';
import SectionTextVideo from '@/core/thread/components/sections/SectionTextVideo';
import SectionTrade from '@/core/thread/components/sections/SectionTrade';
import SectionNftListing from '@/core/thread/components/sections/SectionNftListing';
import { DEFAULT_IMAGES } from '@/config/constants';
import Icons from '@/assets/svgs';

function MessageBubble({ message, isCurrentUser, themeOverrides, styleOverrides }: MessageBubbleProps) {
  // Use utility function to merge styles
  const styles = mergeStyles(
    messageBubbleStyles,
    styleOverrides,
    undefined
  );

  // Check if this is a retweet
  const isRetweet = 'retweetOf' in message && message.retweetOf !== undefined && message.retweetOf !== null;
  const isQuoteRetweet = isRetweet && 'sections' in message && message.sections && message.sections.length > 0;

  // For retweets, we'll use the original post for content
  const postToDisplay = isRetweet && message.retweetOf ? message.retweetOf : message;

  // Determine message style based on sender
  const bubbleStyle = [
    styles.container,
    isCurrentUser ? styles.currentUser : styles.otherUser
  ];

  // Determine text style based on sender
  const textStyle = [
    styles.text,
    !isCurrentUser && styles.otherUserText
  ];

  // Get content type - either from contentType property or infer from post data
  const getContentType = (post: any) => {
    // If post has explicit contentType, use it
    if ('contentType' in post && post.contentType) {
      return post.contentType;
    }

    // Check for tradeData
    if ('tradeData' in post && post.tradeData) {
      return 'trade';
    }

    // Check for nftData
    if ('nftData' in post && post.nftData) {
      return 'nft';
    }
    
    // Check for message with media
    if ('media' in post && post.media && post.media.length > 0) {
      return 'media';
    }

    // Check for thread post with sections
    if ('sections' in post && post.sections) {
      const sections = post.sections as any[];
      
      // Check if any section has trade data
      if (sections.some(section => section.type === 'TEXT_TRADE' && section.tradeData)) {
        return 'trade';
      }
      
      // Check if any section has NFT listing data
      if (sections.some(section => section.type === 'NFT_LISTING' && section.listingData)) {
        return 'nft';
      }
      
      // Check if any section has media
      if (sections.some(section => 
        section.type === 'TEXT_IMAGE' || 
        section.type === 'TEXT_VIDEO' || 
        section.imageUrl || 
        section.videoUrl
      )) {
        return 'media';
      }
    }

    // Default to text
    return 'text';
  };

  // Get content based on type for the appropriate post (original for retweets, or the current post)
  const contentType = getContentType(postToDisplay);

  // Handle thread posts vs direct message data
  const getMessageText = (post: any) => {
    return 'sections' in post 
      ? post.sections.map((section: any) => section.text).join('\n') 
      : post.text || '';
  };
  
  const messageText = getMessageText(postToDisplay);
  
  // Get media from different sources
  const getMediaUrls = (post: any) => {
    if ('media' in post && post.media) {
      return post.media;
    } else if ('sections' in post) {
      // Extract media URLs from thread post sections
      return post.sections
        .filter((section: any) => section.type === 'TEXT_IMAGE' || section.imageUrl)
        .map((section: any) => section.imageUrl || '');
    }
    return [];
  };
  
  const mediaUrls = getMediaUrls(postToDisplay);
  const hasMedia = mediaUrls.length > 0;

  // Get trade data from post sections if available
  const getTradeDataFromSections = (post: any) => {
    if ('sections' in post && post.sections) {
      const tradeSection = post.sections.find((section: any) => 
        section.type === 'TEXT_TRADE' && section.tradeData
      );
      return tradeSection?.tradeData;
    }
    return null;
  };

  // Get NFT data from post sections if available
  const getNftDataFromSections = (post: any) => {
    if ('sections' in post && post.sections) {
      const nftSection = post.sections.find((section: any) => 
        section.type === 'NFT_LISTING' && section.listingData
      );
      
      if (nftSection?.listingData) {
        return {
          id: nftSection.listingData.mint || nftSection.id || 'unknown-nft',
          name: nftSection.listingData.name || 'NFT',
          description: nftSection.listingData.name || '', // Use name as description if not available
          image: nftSection.listingData.image || '',
          collectionName: nftSection.listingData.collectionName || '',
          mintAddress: nftSection.listingData.mint || ''
        };
      }
    }
    return null;
  };

  // Get the appropriate trade data
  const tradeData = 'tradeData' in postToDisplay 
    ? postToDisplay.tradeData 
    : getTradeDataFromSections(postToDisplay);
  
  // Get the appropriate NFT data - handle null case safely
  const rawNftData = 'nftData' in postToDisplay 
    ? postToDisplay.nftData 
    : getNftDataFromSections(postToDisplay);
    
  // Only set nftData if it's non-null to avoid TypeScript errors
  const nftData = rawNftData ? {
    id: rawNftData.id || 'unknown-nft',
    name: rawNftData.name || 'NFT',
    description: rawNftData.description || '',
    image: rawNftData.image || '',
    collectionName: rawNftData.collectionName || '',
    mintAddress: rawNftData.mintAddress || ''
  } : null;

  // Render content based on content type
  const renderPostContent = (post: any) => {
    const postContentType = getContentType(post);
    
    switch (postContentType) {
      case 'trade':
        if (tradeData) {
          return (
            <MessageTradeCard 
              tradeData={tradeData} 
              isCurrentUser={isCurrentUser} 
              userAvatar={post.user?.avatar}
            />
          );
        } else if ('sections' in post) {
          // Render trade section directly for more complex trade data
          const tradeSection = post.sections.find((section: any) => section.type === 'TEXT_TRADE');
          if (tradeSection) {
            return (
              <View style={styles.sectionContainer}>
                {tradeSection.text && <Text style={textStyle}>{tradeSection.text}</Text>}
                <SectionTrade 
                  text={tradeSection.text}
                  tradeData={tradeSection.tradeData}
                  user={post.user}
                  createdAt={post.createdAt}
                />
              </View>
            );
          }
        }
        break;

      case 'nft':
        if (nftData) {
          return (
            <MessageNFT 
              nftData={nftData} 
              isCurrentUser={isCurrentUser}
              onPress={() => console.log('NFT pressed:', nftData.id)}
            />
          );
        } else if ('sections' in post) {
          // For thread posts with NFT listing sections
          const nftSections = post.sections.filter((section: any) => 
            section.type === 'NFT_LISTING' && section.listingData
          );
          
          if (nftSections.length > 0) {
            return (
              <View style={styles.sectionContainer}>
                {nftSections.map((section: any, index: number) => (
                  <SectionNftListing 
                    key={`nft-${index}`} 
                    listingData={section.listingData}
                    compact={true}
                  />
                ))}
              </View>
            );
          }
        }
        break;

      case 'media':
        if ('sections' in post) {
          // Render each section appropriately
          return (
            <View>
              {post.sections.map((section: any, index: number) => {
                if (section.type === 'TEXT_IMAGE' || section.imageUrl) {
                  return (
                    <View key={`img-${index}`}>
                      {section.text && <Text style={textStyle}>{section.text}</Text>}
                      <SectionTextImage 
                        text={section.text} 
                        imageUrl={section.imageUrl}
                      />
                    </View>
                  );
                } else if (section.type === 'TEXT_VIDEO' || section.videoUrl) {
                  return (
                    <View key={`vid-${index}`}>
                      {section.text && <Text style={textStyle}>{section.text}</Text>}
                      <SectionTextVideo 
                        text={section.text} 
                        videoUrl={section.videoUrl}
                      />
                    </View>
                  );
                }
                return null;
              })}
            </View>
          );
        } else {
          // Basic media rendering
          return (
            <View>
              {getMessageText(post) && <Text style={textStyle}>{getMessageText(post)}</Text>}
              
              <View style={styles.mediaContainer}>
                {getMediaUrls(post).map((mediaUrl: string, index: number) => (
                  <IPFSAwareImage
                    key={`media-${index}`}
                    source={getValidImageSource(mediaUrl)}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          );
        }

      case 'text':
      default:
        // If there are sections but no specialized content, render all text
        if ('sections' in post && post.sections.length > 0) {
          return (
            <View>
              {post.sections.map((section: any, index: number) => (
                <Text key={`text-${index}`} style={textStyle}>
                  {section.text}
                </Text>
              ))}
            </View>
          );
        }
        return <Text style={textStyle}>{getMessageText(post)}</Text>;
    }
  };

  // If this is a retweet, show it with the retweet header
  if (isRetweet && message.retweetOf) {
    // For quote retweets, show the user's added content first
    const quoteContent = isQuoteRetweet && message.sections && message.sections.length > 0 ? (
      <View style={styles.quoteContent}>
        {message.sections.map((section: any, index: number) => (
          <Text key={`quote-${index}`} style={textStyle}>
            {section.text}
          </Text>
        ))}
      </View>
    ) : null;

    return (
      <View style={styles.retweetContainer}>
        {/* Retweet indicator */}
        <View style={styles.retweetHeader}>
          {/* Attempt to use RetweetIdle icon if available, otherwise use text */}
          {Icons.RetweetIdle ? (
            <Icons.RetweetIdle width={12} height={12} color={COLORS.greyMid} />
          ) : (
            <View style={styles.retweetIcon} />
          )}
          <Text style={styles.retweetHeaderText}>
            {message.user?.username || 'User'} Retweeted
          </Text>
        </View>

        {/* Quote content if this is a quote retweet */}
        {quoteContent}

        {/* Original post content */}
        <View style={styles.originalPostContainer}>
          {/* Original post user */}
          <View style={styles.originalPostHeader}>
            <IPFSAwareImage
              source={
                message.retweetOf.user?.avatar 
                  ? getValidImageSource(message.retweetOf.user.avatar) 
                  : DEFAULT_IMAGES.user
              }
              style={styles.originalPostAvatar}
              defaultSource={DEFAULT_IMAGES.user}
            />
            <View>
              <Text style={styles.originalPostUsername}>
                {message.retweetOf.user?.username || 'User'}
              </Text>
              <Text style={styles.originalPostHandle}>
                {message.retweetOf.user?.handle || '@user'}
              </Text>
            </View>
          </View>

          {/* Original post content */}
          {renderPostContent(message.retweetOf)}
        </View>
      </View>
    );
  }

  // For trade and NFT content, return without the bubble container
  if (contentType === 'trade' || contentType === 'nft') {
    return renderPostContent(message);
  }

  // For text and media content, wrap in a bubble
  return (
    <View style={bubbleStyle}>
      {renderPostContent(message)}
    </View>
  );
}

// Additional styles for the component
const styles = StyleSheet.create({
  mediaContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  sectionContainer: {
    width: '100%',
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Retweet styles
  retweetContainer: {
    width: '100%',
    marginBottom: 12,
  },
  retweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 6,
    paddingTop: 4,
  },
  retweetIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.greyMid,
  },
  retweetHeaderText: {
    fontSize: 13,
    color: COLORS.greyMid,
    marginLeft: 6,
    fontWeight: '500',
  },
  originalPostContainer: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.lighterBackground,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  originalPostUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  originalPostHandle: {
    fontSize: 12,
    color: COLORS.greyMid,
  },
  quoteContent: {
    marginBottom: 8,
    paddingHorizontal: 12,
  },
});

export default MessageBubble; 