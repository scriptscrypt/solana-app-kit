import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MessageHeaderProps } from './message.types';
import { messageHeaderStyles } from './message.styles';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import { DEFAULT_IMAGES } from '@/config/constants';

function MessageHeader({ message, showAvatar = true, onPressUser }: MessageHeaderProps) {
  // Handle ThreadPost or MessageData types
  const user = message.user;
  
  // Skip header if it shouldn't be shown
  if (!showAvatar) return null;
  
  const handleUserPress = () => {
    if (onPressUser && user) {
      onPressUser(user);
    }
  };

  return (
    <View style={messageHeaderStyles.container}>
      <TouchableOpacity 
        style={messageHeaderStyles.left} 
        onPress={handleUserPress}
        disabled={!onPressUser}
      >
        {showAvatar && (
          <IPFSAwareImage
            source={
              user.avatar 
                ? getValidImageSource(user.avatar) 
                : DEFAULT_IMAGES.user
            }
            style={messageHeaderStyles.avatar}
            defaultSource={DEFAULT_IMAGES.user}
          />
        )}
        <Text style={messageHeaderStyles.username}>
          {user.username || 'Anonymous'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default MessageHeader; 