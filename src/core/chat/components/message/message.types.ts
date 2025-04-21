import { ImageSourcePropType, TextStyle, ViewStyle } from 'react-native';
import { ThreadPost, ThreadUser } from '@/core/thread/components/thread.types';
import { TradeData } from '@/core/sharedUI/TradeCard/TradeCard';

export interface MessageUser {
  id: string;
  username: string;
  handle?: string;
  avatar?: ImageSourcePropType;
  verified?: boolean;
}

export interface NFTData {
  id: string;
  name: string;
  description?: string;
  image: string;
  collectionName?: string;
  mintAddress?: string;
}

export interface MessageData {
  id: string;
  text?: string;
  user: MessageUser;
  createdAt: string;
  media?: string[];
  isCurrentUser?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  
  // Message content types
  contentType?: 'text' | 'media' | 'trade' | 'nft' | 'mixed';
  tradeData?: TradeData;
  nftData?: NFTData;
}

export interface MessageBubbleProps {
  message: MessageData | ThreadPost;
  isCurrentUser?: boolean;
  themeOverrides?: Record<string, string>;
  styleOverrides?: Record<string, ViewStyle | TextStyle>;
}

export interface MessageHeaderProps {
  message: MessageData | ThreadPost;
  showAvatar?: boolean;
  onPressUser?: (user: MessageUser | ThreadUser) => void;
}

export interface MessageFooterProps {
  message: MessageData | ThreadPost;
  isCurrentUser?: boolean;
}

export interface ChatMessageProps {
  message: MessageData | ThreadPost;
  currentUser: MessageUser | ThreadUser;
  onPressMessage?: (message: MessageData | ThreadPost) => void;
  themeOverrides?: Record<string, string>;
  styleOverrides?: Record<string, ViewStyle | TextStyle>;
  showHeader?: boolean;
  showFooter?: boolean;
} 