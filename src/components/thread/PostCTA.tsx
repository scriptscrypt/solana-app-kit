import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type {ThreadPost, ThreadCTAButton} from './thread.types';
import {createThreadStyles, getMergedTheme} from './thread.styles';

interface PostCTAProps {
  post: ThreadPost;
  buttons?: ThreadCTAButton[];
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
  themeOverrides,
  styleOverrides,
  userStyleSheet,
}: PostCTAProps) {
  if (!buttons || buttons.length === 0) return null;

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides as { [key: string]: object } | undefined,
    userStyleSheet as { [key: string]: object } | undefined,
  );

  return (
    <View
      style={[
        styles.threadPostCTAContainer,
        styleOverrides?.container,
        userStyleSheet?.container,
      ]}>
      {buttons.map((btn, index) => (
        <TouchableOpacity
          key={`${btn.label}-${index}`}
          style={[
            styles.threadPostCTAButton, // Default button style
            styleOverrides?.button, // Global style override
            userStyleSheet?.button, // User style sheet
            btn.buttonStyle, // Individual button style
          ]}
          onPress={() => btn.onPress(post)}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.threadPostCTAButtonLabel, // Default label style
              styleOverrides?.buttonLabel, // Global label style override
              userStyleSheet?.buttonLabel, // User label style sheet
              btn.buttonLabelStyle, // Individual label style
            ]}>
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}