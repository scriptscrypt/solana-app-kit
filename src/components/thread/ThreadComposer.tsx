import React, {useState} from 'react';
import {View, Image, TextInput, TouchableOpacity, Text} from 'react-native';
import Icons from '../../assets/svgs';
import {useAppDispatch} from '../../hooks/useReduxHooks';
import {addRootPost, addReply} from '../../state/thread/reducer';
import {createThreadStyles, getMergedTheme} from './thread.styles';
import {ThreadSection, ThreadSectionType, ThreadUser} from './thread.types';
import {ImageLibraryOptions, launchImageLibrary} from 'react-native-image-picker';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(
    mergedTheme,
    styleOverrides,
    userStyleSheet,
  );

  const handlePost = () => {
    if (!textValue.trim() && !selectedImage) return;

    const sections: ThreadSection[] = [];

    if (textValue.trim()) {
      sections.push({
        id: 'section-' + Math.random().toString(36).substr(2, 9),
        type: 'TEXT_ONLY' as ThreadSectionType,
        text: textValue.trim(),
      });
    }

    if (selectedImage) {
      sections.push({
        id: 'section-' + Math.random().toString(36).substr(2, 9),
        type: 'IMAGE_ONLY' as ThreadSectionType,
        imageUrl: { uri: selectedImage },
      });
    }

    if (parentId) {
      dispatch(addReply({parentId, user: currentUser, sections}));
    } else {
      dispatch(addRootPost({user: currentUser, sections}));
    }

    setTextValue('');
    setSelectedImage(null);
    onPostCreated && onPostCreated();
  };  
  
  const handleMediaPress = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setSelectedImage(uri);
        }
      }
    });
  };

  return (
    <View style={styles.composerContainer}>
      <View style={styles.composerAvatarContainer}>
        <Image source={currentUser.avatar} style={styles.composerAvatar} />
      </View>

      <View style={styles.composerMiddle}>
        <Text style={styles.composerUsername}>{currentUser.username}</Text>
        <TextInput
          style={styles.composerInput}
          placeholder={parentId ? 'Reply...' : "What's happening?"}
          placeholderTextColor="#999"
          value={textValue}
          onChangeText={setTextValue}
          multiline
        />

        {selectedImage && (
          <Image
            source={{uri: selectedImage}}
            style={{width: 100, height: 100, marginTop: 10}}
          />
        )}

        <View style={styles.iconsRow}>
          <View style={styles.leftIcons}>
            <TouchableOpacity onPress={handleMediaPress}>
              <Icons.MediaIcon width={18} height={18} />
            </TouchableOpacity>
            <Icons.Target width={18} height={18} />
            <Icons.BlinkEye width={18} height={18} />
          </View>
          <TouchableOpacity onPress={handlePost}>
            <Text style={{color: '#1d9bf0', fontWeight: '600'}}>
              {parentId ? 'Reply' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
