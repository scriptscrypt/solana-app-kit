import React from 'react';
import { View, Text } from 'react-native';
import { MessageFooterProps } from './message.types';
import { messageFooterStyles } from './message.styles';
import Icons from '@/assets/svgs';

// Custom check icons since they don't exist in the Icons object
const CheckIcon = ({ color = "#8F8F8F" }) => (
  <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 8, height: 5, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  </View>
);

const DoubleCheckIcon = ({ color = "#8F8F8F" }) => (
  <View style={{ width: 12, height: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 7, height: 4, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: color, transform: [{ rotate: '-45deg' }, { translateX: 2 }] }} />
    <View style={{ width: 7, height: 4, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: color, transform: [{ rotate: '-45deg' }, { translateX: -2 }] }} />
  </View>
);

function MessageFooter({ message, isCurrentUser }: MessageFooterProps) {
  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Get timestamp from different message types
  const timestamp = 'createdAt' in message ? message.createdAt : '';
  
  // Get read status for current user's messages
  const getReadStatus = () => {
    if (!isCurrentUser || !('status' in message)) return null;
    
    switch (message.status) {
      case 'sent':
        return <CheckIcon color="#8F8F8F" />;
      case 'delivered':
        return <DoubleCheckIcon color="#8F8F8F" />;
      case 'read':
        return <DoubleCheckIcon color="#4D9FEC" />;
      default:
        return null;
    }
  };

  return (
    <View style={messageFooterStyles.container}>
      <Text 
        style={[
          messageFooterStyles.timestamp, 
          isCurrentUser && messageFooterStyles.currentUserTimestamp
        ]}
      >
        {formatTimestamp(timestamp)}
      </Text>
      
      {isCurrentUser && (
        <View style={messageFooterStyles.readStatus}>
          {getReadStatus()}
        </View>
      )}
    </View>
  );
}

export default MessageFooter; 