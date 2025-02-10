// File: src/components/thread/PostCTA.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type { ThreadPost, ThreadCTAButton } from './thread.types';
import { createThreadStyles, getMergedTheme } from './thread.styles';

interface PostCTAProps {
  post: ThreadPost;
  buttons?: ThreadCTAButton[];
  onTradePress?: (post: ThreadPost) => void;
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {
    container?: StyleProp<ViewStyle>;
    button?: StyleProp<ViewStyle>;
    buttonLabel?: StyleProp<TextStyle>;
  };
  userStyleSheet?: {
    container?: StyleProp<ViewStyle>;
    button?: StyleProp<ViewStyle>;
    buttonLabel?: StyleProp<TextStyle>;
  };
}

export default function PostCTA({
  post,
  buttons,
  onTradePress,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
}: PostCTAProps) {
  if (!buttons && !onTradePress) return null;

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides as { [key: string]: object } | undefined,
    userStyleSheet as { [key: string]: object } | undefined,
  );

  return (
    <View style={[styles.threadPostCTAContainer, styleOverrides?.container, userStyleSheet?.container]}>
      {buttons?.map((btn, index) => (
        <TouchableOpacity
          key={`${btn.label}-${index}`}
          style={[
            styles.threadPostCTAButton,
            styleOverrides?.button,
            userStyleSheet?.button,
            btn.buttonStyle,
          ]}
          onPress={() => {
            console.log(`Button pressed: ${btn.label}`);
            if (btn.label === 'Trade' && onTradePress) {
              onTradePress(post);
            }
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.threadPostCTAButtonLabel,
              styleOverrides?.buttonLabel,
              userStyleSheet?.buttonLabel,
              btn.buttonLabelStyle,
            ]}
          >
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
