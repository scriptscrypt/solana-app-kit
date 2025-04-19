import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    Image,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useReduxHooks';
import {
    updateProfilePic,
    updateUsername,
    updateDescription,
    fetchUserProfile,
} from '@/shared/state/auth/reducer';
import { uploadProfileAvatar } from '@/core/profile/services/profileService';
import { styles } from './ProfileEditDrawer.styles';
import Icons from '@/assets/svgs';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import COLORS from '@/assets/colors';

interface ProfileEditDrawerProps {
    visible: boolean;
    onClose: () => void;
    profileData: {
        userId: string;
        profilePicUrl: string;
        username: string;
        description: string;
    };
    onProfileUpdated?: (field: 'image' | 'username' | 'description') => void;
}

export default function ProfileEditDrawer({
    visible,
    onClose,
    profileData,
    onProfileUpdated,
}: ProfileEditDrawerProps) {
    const dispatch = useAppDispatch();

    // Local state for form fields
    const [tempUsername, setTempUsername] = useState(profileData.username);
    const [tempDescription, setTempDescription] = useState(profileData.description);
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Reset form when drawer opens
    React.useEffect(() => {
        if (visible) {
            setTempUsername(profileData.username);
            setTempDescription(profileData.description);
            setLocalImageUri(null);
        }
    }, [visible, profileData]);

    // Handle image selection
    const handleSelectImage = useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLocalImageUri(result.assets[0].uri);
            }
        } catch (error: any) {
            Alert.alert('Error picking image', error.message);
        }
    }, []);

    // Update profile function
    const handleUpdate = useCallback(async () => {
        if (!profileData.userId) {
            Alert.alert('Error', 'User ID is required');
            return;
        }

        setIsUploading(true);

        try {
            let updatedImage = false;
            let updatedUsername = false;
            let updatedDescription = false;

            // Handle image upload if selected
            if (localImageUri) {
                try {
                    const newUrl = await uploadProfileAvatar(profileData.userId, localImageUri);
                    dispatch(updateProfilePic(newUrl));
                    updatedImage = true;
                } catch (err: any) {
                    Alert.alert('Image Upload Error', err.message || 'Failed to upload image');
                }
            }

            // Update username if changed
            if (tempUsername.trim() !== profileData.username && tempUsername.trim()) {
                try {
                    dispatch(
                        updateUsername({ userId: profileData.userId, newUsername: tempUsername.trim() })
                    );
                    updatedUsername = true;
                } catch (err: any) {
                    Alert.alert('Username Update Error', err.message || 'Failed to update username');
                }
            }

            // Update description if changed
            if (tempDescription.trim() !== profileData.description) {
                try {
                    dispatch(
                        updateDescription({ userId: profileData.userId, newDescription: tempDescription.trim() })
                    );
                    updatedDescription = true;
                } catch (err: any) {
                    Alert.alert('Bio Update Error', err.message || 'Failed to update bio');
                }
            }

            // Show success message if any updates were made
            if (updatedImage || updatedUsername || updatedDescription) {
                // Fetch the updated profile from the server to ensure Redux state is current
                try {
                    await dispatch(fetchUserProfile(profileData.userId)).unwrap();
                } catch (err) {
                    console.error('Error refreshing profile after update:', err);
                }

                // Notify parent components about the update
                if (updatedImage && onProfileUpdated) onProfileUpdated('image');
                if (updatedUsername && onProfileUpdated) onProfileUpdated('username');
                if (updatedDescription && onProfileUpdated) onProfileUpdated('description');

                Alert.alert('Profile Updated', 'Your profile has been updated successfully');
                onClose();
            } else {
                Alert.alert('No Changes', 'No changes were made to your profile');
            }
        } finally {
            setIsUploading(false);
        }
    }, [
        dispatch,
        localImageUri,
        tempUsername,
        tempDescription,
        profileData.userId,
        profileData.username,
        profileData.description,
        onProfileUpdated,
        onClose,
    ]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <View style={styles.drawerContainer}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Text style={styles.backButtonText}>{'<'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Edit Profile</Text>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleUpdate}
                        disabled={isUploading}>
                        <Text style={styles.saveButtonText}>
                            {isUploading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContent}>
                    {/* Profile Image Section */}
                    <View style={styles.imageSection}>
                        <TouchableOpacity onPress={handleSelectImage} style={styles.imageContainer}>
                            <IPFSAwareImage
                                style={styles.profileImage}
                                source={
                                    localImageUri
                                        ? { uri: localImageUri }
                                        : profileData.profilePicUrl
                                            ? getValidImageSource(profileData.profilePicUrl)
                                            : require('@/assets/images/User.png')
                                }
                                defaultSource={require('@/assets/images/User.png')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSelectImage}>
                            <Text style={styles.editPictureText}>Edit picture</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Name Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Display name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={tempUsername}
                            onChangeText={setTempUsername}
                            placeholder="Enter your display name"
                            placeholderTextColor={COLORS.greyMid}
                            maxLength={50}
                        />
                    </View>

                    {/* Username Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={[styles.textInput, styles.disabledInput]}
                            value={`@${profileData.userId.substring(0, 6)}...${profileData.userId.slice(-4)}`}
                            editable={false}
                        />
                    </View>

                    {/* Bio Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Bio</Text>
                        <TextInput
                            style={[styles.textInput, styles.bioInput]}
                            value={tempDescription}
                            onChangeText={setTempDescription}
                            placeholder="Write a short bio about yourself"
                            placeholderTextColor={COLORS.greyMid}
                            multiline
                            maxLength={160}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
} 