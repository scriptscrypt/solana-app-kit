// src/components/thread/PostBody.tsx

import React from 'react';
import {View, Text, Image} from 'react-native';
import {ThreadPost} from '../../state/thread/reducer';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import TradeCard from '../TradeCard/TradeCard';

interface PostBodyProps {
  post: ThreadPost;
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
}

export default function PostBody({
  post,
  themeOverrides,
  styleOverrides,
}: PostBodyProps) {
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(mergedTheme, styleOverrides);

  return (
    <View style={{marginTop: 8}}>
      {post.sections.map(section => (
        <View key={section.id} style={styles.extraContentContainer}>
          {renderSection(section, styles)}
        </View>
      ))}
    </View>
  );
}

function renderSection(
  section: ThreadPost['sections'][number],
  styles: ReturnType<typeof createThreadStyles>,
) {
  switch (section.type) {
    case 'TEXT_ONLY':
      return <Text style={styles.threadItemText}>{section.text}</Text>;

    case 'TEXT_IMAGE':
      return (
        <>
          {!!section.text && (
            <Text style={styles.threadItemText}>{section.text}</Text>
          )}
          {section.imageUrl && (
            <Image source={section.imageUrl} style={styles.threadItemImage} />
          )}
        </>
      );

    case 'TEXT_VIDEO':
      return (
        <>
          {!!section.text && (
            <Text style={styles.threadItemText}>{section.text}</Text>
          )}
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>
              [Video Player Placeholder]
            </Text>
          </View>
        </>
      );

    case 'TEXT_TRADE':
      return (
        <>
          {!!section.text && (
            <Text style={styles.threadItemText}>{section.text}</Text>
          )}
          {section.tradeData && (
            <TradeCard
              tokenAvatar={section.tradeData.tokenAvatar}
              tokenName={section.tradeData.tokenName}
              tokenPriceUsdLeft={section.tradeData.tokenPriceUsdLeft}
              tokenPriceSolRight={section.tradeData.tokenPriceSolRight}
              tokenPriceUsdRight={section.tradeData.tokenPriceUsdRight}
            />
          )}
        </>
      );

    case 'POLL':
      if (!section.pollData) {
        return <Text style={styles.threadItemText}>[Missing poll data]</Text>;
      }
      return (
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{section.pollData.question}</Text>
          {section.pollData.options.map((option, index) => (
            <View key={index} style={styles.pollOption}>
              <Text style={styles.pollOptionText}>
                {option} • {section.pollData?.votes[index]} votes
              </Text>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
}
