import {ImageSourcePropType, StyleProp, TextStyle, ViewStyle} from 'react-native';

export type ThreadSectionType =
  | 'TEXT_ONLY'
  | 'TEXT_IMAGE'
  | 'TEXT_VIDEO'
  | 'TEXT_TRADE'
  | 'POLL';

export interface TradeData {
  token1Avatar: any;
  token1Name: string;
  token1PriceUsd: string;
  token2Avatar: any;
  token2Name: string;
  token2PriceUsd: string;
  token2PriceSol: string;
}

export interface PollData {
  question: string;
  options: string[];
  votes: number[];
}

export interface ThreadSection {
  id: string;
  type: ThreadSectionType;
  text?: string;
  imageUrl?: ImageSourcePropType;
  videoUrl?: string;
  tradeData?: TradeData;
  pollData?: PollData;
}

export interface ThreadUser {
  id: string;
  username: string;
  handle: string;
  avatar: ImageSourcePropType;
  verified?: boolean;
}

export interface ThreadPost {
  id: string;
  parentId?: string;
  user: ThreadUser;
  sections: ThreadSection[];
  createdAt: string;
  replies: ThreadPost[];
  reactionCount: number;
  retweetCount: number;
  quoteCount: number;
}

export interface PollData {
  question: string;
  options: string[];
  votes: number[];
}

export interface ThreadCTAButton {
  label: string;
  onPress: (post: ThreadPost) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonLabelStyle?: StyleProp<TextStyle>;
}
