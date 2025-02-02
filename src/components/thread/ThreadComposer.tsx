import React, {useState} from 'react';
import {View, Image, TextInput, TouchableOpacity, Text} from 'react-native';
import Icons from '../../assets/svgs';
import {useAppDispatch} from '../../hooks/useReduxHooks';
import {
  addRootPost,
  addReply,
} from '../../state/thread/reducer';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import { ThreadSection, ThreadSectionType, ThreadUser } from './thread.types';

interface ThreadComposerProps {
  currentUser: ThreadUser;
  parentId?: string; // if present, it's a reply
  onPostCreated?: () => void;
  themeOverrides?: Partial<Record<string, any>>;
  styleOverrides?: {[key: string]: object};
  userStyleSheet?: {[key: string]: object};
}

export default function ThreadComposer({
  currentUser,
  parentId,
  onPostCreated,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
}: ThreadComposerProps) {
  const [textValue, setTextValue] = useState('');
  const dispatch = useAppDispatch();

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides,
    userStyleSheet,
  );

  const handlePost = () => {
    if (!textValue.trim()) return;
    const sections: ThreadSection[] = [
      {
        id: 'section-' + Math.random().toString(36).substr(2, 9),
        type: 'TEXT_ONLY' as ThreadSectionType,
        text: textValue.trim(),
      },
    ];

    if (parentId) {
      dispatch(addReply({parentId, user: currentUser, sections}));
    } else {
      dispatch(addRootPost({user: currentUser, sections}));
    }

    setTextValue('');
    onPostCreated && onPostCreated();
  };

  return (
    <View style={styles.composerContainer}>
      <View style={styles.composerAvatarContainer}>
        <Image source={currentUser.avatar} style={styles.composerAvatar} />
        <View style={styles.plusIconContainer}>
          <Icons.ProfilePlusIcon width={16} height={16} />
        </View>
      </View>

      <View style={styles.composerMiddle}>
        <Text style={styles.composerUsername}>{currentUser.username}</Text>
        <TextInput
          style={styles.composerInput}
          placeholder={parentId ? 'Reply...' : "What's happening?"}
          placeholderTextColor="#999"
          value={textValue}
          onChangeText={setTextValue}
        />

        <View style={styles.iconsRow}>
          <View style={styles.leftIcons}>
            <Icons.MediaIcon width={18} height={18} />
            <Icons.Target width={18} height={18} />
            <Icons.BlinkEye width={18} height={18} />
          </View>
          <TouchableOpacity onPress={handlePost}>
            <Text style={{color: '#1d9bf0', fontWeight: '600'}}>
              {parentId ? 'Reply' : 'Tweet'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
