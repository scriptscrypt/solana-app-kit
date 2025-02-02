import React from 'react';
import {View, Text, Image, TouchableOpacity, Alert} from 'react-native';
import Icons from '../../assets/svgs';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import { ThreadPost } from './thread.types';

interface PostHeaderProps {
  post: ThreadPost;
  onPressMenu?: (p: ThreadPost) => void;
  onDeletePost?: (p: ThreadPost) => void; // NEW
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
}

export default function PostHeader({
  post,
  onPressMenu,
  onDeletePost,
  themeOverrides,
  styleOverrides,
}: PostHeaderProps) {
  const {user, createdAt} = post;
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(mergedTheme, styleOverrides);

  const timeString = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePressMenu = () => {
    if (onPressMenu) {
      onPressMenu(post);
    } else {
      Alert.alert(
        'Menu',
        'Choose an action',
        [
          {
            text: 'Delete',
            onPress: () => {
              if (onDeletePost) {
                onDeletePost(post);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        {cancelable: true},
      );
    }
  };

  return (
    <View style={styles.threadItemHeaderRow}>
      {/* Avatar + username */}
      <View style={styles.threadItemHeaderLeft}>
        <Image source={user.avatar} style={styles.threadItemAvatar} />
        <View style={{marginLeft: 8}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.threadItemUsername}>{user.username}</Text>
            {user.verified && (
              <Icons.BlueCheck
                width={14}
                height={14}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <Text style={styles.threadItemHandleTime}>
            {user.handle} • {timeString}
          </Text>
        </View>
      </View>

      {/* Dots/menu */}
      <TouchableOpacity onPress={handlePressMenu}>
        <Icons.DotsThree width={20} height={20} />
      </TouchableOpacity>
    </View>
  );
}
