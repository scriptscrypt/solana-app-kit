import React, { useState, useCallback, useEffect, useRef } from 'react';
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
    ImageStyle,
    FlatList,
    InteractionManager,
    StyleSheet,
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
import { NftItem } from '@/modules/nft/types';
import { fetchWithRetries } from '@/modules/dataModule/utils/fetch';
import { ENDPOINTS } from '@/config/constants';
import { fixImageUrl } from '@/modules/nft/utils/imageUtils';
import { TENSOR_API_KEY } from '@env';
import TYPOGRAPHY from '@/assets/typography';

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

// Drawer view states
enum DrawerView {
    PROFILE_EDIT,
    NFT_LIST,
    NFT_CONFIRM,
}

const LOG_TAG = "[ProfileEditDrawer]";

export default function ProfileEditDrawer({
    visible,
    onClose,
    profileData,
    onProfileUpdated,
}: ProfileEditDrawerProps) {
    const dispatch = useAppDispatch();
    const isMounted = useRef(true);

    // --- State --- 
    const [tempUsername, setTempUsername] = useState(profileData.username);
    const [tempDescription, setTempDescription] = useState(profileData.description);
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedSource, setSelectedSource] = useState<'library' | 'nft' | null>(null);
    const [cachedNfts, setCachedNfts] = useState<NftItem[]>([]);
    const [nftsLoading, setNftsLoading] = useState(false);
    const [nftsError, setNftsError] = useState<string | null>(null);
    const [isPreparingNfts, setIsPreparingNfts] = useState(false);
    const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentView, setCurrentView] = useState<DrawerView>(DrawerView.PROFILE_EDIT);
    const [showAvatarOptions, setShowAvatarOptions] = useState(false);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // --- Effects --- 
    useEffect(() => {
        isMounted.current = true;
        console.log(`${LOG_TAG} Mounted`);
        return () => {
            isMounted.current = false;
            console.log(`${LOG_TAG} Unmounted`);
        };
    }, []);

    useEffect(() => {
        if (visible) {
            console.log(`${LOG_TAG} Drawer became visible, resetting state.`);
            setTempUsername(profileData.username);
            setTempDescription(profileData.description);
            setLocalImageUri(null);
            setSelectedSource(null);
            setCachedNfts([]);
            setNftsLoading(false);
            setNftsError(null);
            setIsPreparingNfts(false);
            setSelectedNft(null);
            setIsProcessing(false);
            setCurrentView(DrawerView.PROFILE_EDIT);
            setShowAvatarOptions(false);
        } else {
            console.log(`${LOG_TAG} Drawer became hidden.`);
        }
    }, [visible, profileData]);

    // --- Callbacks --- 

    // Fetch NFTs directly
    const fetchNFTs = useCallback(async () => {
        console.log(`${LOG_TAG} fetchNFTs started`);
        if (!isMounted.current) {
            console.log(`${LOG_TAG} fetchNFTs aborted (unmounted)`);
            return [];
        }
        
        setNftsLoading(true);
        setNftsError(null);
        
        try {
            const url = `${ENDPOINTS.tensorFlowBaseUrl}/api/v1/user/portfolio?wallet=${profileData.userId}&includeUnverified=true&includeCompressed=true&includeFavouriteCount=true`;
            console.log(`${LOG_TAG} Fetching from URL: ${url}`);
            
            const resp = await fetchWithRetries(url, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-tensor-api-key': TENSOR_API_KEY,
                }
            });
            
            if (!resp.ok) {
                throw new Error(`Fetch NFTs failed: ${resp.status}`);
            }
            
            const data = await resp.json();
            console.log(`${LOG_TAG} NFT fetch response received (status ${resp.status})`);
            
            if (!isMounted.current) {
                console.log(`${LOG_TAG} fetchNFTs aborted after fetch (unmounted)`);
                return [];
            }
            
            const dataArray = Array.isArray(data) ? data : [];
            const parsed = dataArray
                .map((item: any) => {
                    if (!item.setterMintMe) return null;
                    return {
                        mint: item.setterMintMe,
                        name: item.name || 'Unnamed NFT',
                        image: fixImageUrl(item.imageUri || ''),
                        collection: item.slugDisplay || '',
                        isCompressed: item.isCompressed || false
                    } as NftItem;
                })
                .filter(Boolean) as NftItem[];
            
            console.log(`${LOG_TAG} Parsed ${parsed.length} NFTs`);
            if (!isMounted.current) {
                 console.log(`${LOG_TAG} fetchNFTs aborted after parse (unmounted)`);
                 return [];
            }
            
            setCachedNfts(parsed);
            setNftsError(null);
            console.log(`${LOG_TAG} fetchNFTs success`);
            return parsed; 
        } catch (error: any) {
            console.error(`${LOG_TAG} fetchNFTs failed:`, error);
            if (!isMounted.current) return [];
            setNftsError('Failed to load NFTs. Please try again.');
            setCachedNfts([]);
            return []; 
        } finally {
            if (isMounted.current) {
                setNftsLoading(false);
                console.log(`${LOG_TAG} fetchNFTs finished (loading set to false)`);
            }
        }
    }, [profileData.userId]);

    // Confirm and upload selected image (from Library or NFT Confirm view)
    const handleConfirmImageUpload = useCallback(async (imageUri?: string, source?: 'library' | 'nft') => {
        const useImageUri = imageUri || localImageUri;
        const useSource = source || selectedSource;
        
        console.log(`${LOG_TAG} handleConfirmImageUpload triggered for ${useSource} image: ${useImageUri}`);
        if (isUploading || !useImageUri) {
            console.warn(`${LOG_TAG} Cannot upload image: ${isUploading ? 'Already uploading' : 'No image URI'}`);
            setIsProcessing(false);
            return;
        }

        if (!profileData.userId) {
            console.warn(`${LOG_TAG} Missing user ID for image upload`);
            Alert.alert('Missing Data', 'No valid user to upload to');
            setIsProcessing(false);
            return;
        }

        console.log(`${LOG_TAG} Starting image upload...`);
        setIsUploading(true);
        setIsProcessing(true);
        
        // Show progress bar overlay
        setShowUploadProgress(true);
        setUploadProgress(0);

        // Simulate upload progress (in real implementation you'd get actual progress from the upload)
        const progressInterval = setInterval(() => {
            if (isMounted.current) {
                setUploadProgress(prev => {
                    const newProgress = prev + (10 + Math.random() * 20);
                    return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
                });
            } else {
                clearInterval(progressInterval);
            }
        }, 500);

        try {
            const newUrl = await uploadProfileAvatar(profileData.userId, useImageUri);
            
            // Clear interval and set to 100% when complete
            clearInterval(progressInterval);
            if (isMounted.current) {
                setUploadProgress(100);
                // Wait a moment before hiding progress
                setTimeout(() => {
                    if (isMounted.current) setShowUploadProgress(false);
                }, 500);
            }
            
            if (!isMounted.current) {
                console.log(`${LOG_TAG} Aborted after upload (unmounted)`);
                return;
            }
            
            dispatch(updateProfilePic(newUrl));
            if (onProfileUpdated) onProfileUpdated('image');
            
            Alert.alert(
                'Success',
                'Profile picture updated successfully',
                [{ text: 'OK' }]
            );
            
            setSelectedNft(null);
            setLocalImageUri(null);
            setSelectedSource(null);
            setCurrentView(DrawerView.PROFILE_EDIT);
        } catch (err: any) {
            console.error(`${LOG_TAG} Image upload failed:`, err);
            if (isMounted.current) {
                Alert.alert('Upload Error', err.message || 'Failed to upload image');
                setCurrentView(DrawerView.PROFILE_EDIT);
            }
        } finally {
            if (isMounted.current) {
                console.log(`${LOG_TAG} Finishing image upload process`);
                setIsUploading(false);
                setIsProcessing(false);
            }
        }
    }, [dispatch, profileData.userId, localImageUri, selectedSource, isUploading, onProfileUpdated, setCurrentView]);

    // Toggle Avatar Options visibility
    const handleToggleAvatarOptions = useCallback(() => {
        console.log(`${LOG_TAG} handleToggleAvatarOptions triggered`);
        if (isProcessing || isUploading) {
            console.log(`${LOG_TAG} Ignoring toggle avatar options while processing/uploading`);
            return;
        }
        setShowAvatarOptions(prev => !prev);
    }, [isProcessing, isUploading]);

    // Select Image from Library
    const handleSelectImageFromLibrary = useCallback(async () => {
        console.log(`${LOG_TAG} handleSelectImageFromLibrary triggered`);
        if (isProcessing || isUploading || isPreparingNfts) {
            console.log(`${LOG_TAG} Ignoring image selection while processing`);
            return;
        }
        
        setIsProcessing(true);
        setShowAvatarOptions(false);
        
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!isMounted.current) {
                console.log(`${LOG_TAG} Aborted image selection (unmounted)`);
                setIsProcessing(false);
                return;
            }
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log(`${LOG_TAG} Image selected from library`, result.assets[0].uri);
                setLocalImageUri(result.assets[0].uri);
                setSelectedSource('library');
                
                        handleConfirmImageUpload(result.assets[0].uri, 'library');
            } else {
                console.log(`${LOG_TAG} Image selection cancelled or failed`);
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.error(`${LOG_TAG} Error picking image:`, error);
            if (isMounted.current) {
                Alert.alert('Error picking image', error.message);
                setIsProcessing(false);
            }
        }
    }, [isProcessing, isUploading, isPreparingNfts, handleConfirmImageUpload]);

    // Prepare NFT Selection
    const handlePrepareAndShowNfts = useCallback(async () => {
        console.log(`${LOG_TAG} handlePrepareAndShowNfts triggered`);
        if (isProcessing || isPreparingNfts || isUploading) {
            console.log(`${LOG_TAG} Ignoring NFT preparation while busy`);
            return; 
        }
        
        setIsProcessing(true);
        setIsPreparingNfts(true);
        setShowAvatarOptions(false);
        
        console.log(`${LOG_TAG} Starting NFT fetch...`);
        await fetchNFTs();
        console.log(`${LOG_TAG} NFT fetch complete.`);
        
        if (!isMounted.current) {
            console.log(`${LOG_TAG} handlePrepareAndShowNfts aborted after fetch (unmounted)`);
            setIsPreparingNfts(false);
            setIsProcessing(false);
            return;
        }
        
        console.log(`${LOG_TAG} Setting view to NFT_LIST`);
        setCurrentView(DrawerView.NFT_LIST);
        setIsPreparingNfts(false);
        setIsProcessing(false);
    }, [fetchNFTs, isPreparingNfts, isProcessing, isUploading, setCurrentView]);

    // Handle NFT selection from list
    const handleSelectNft = useCallback((nft: NftItem) => {
        console.log(`${LOG_TAG} handleSelectNft triggered for NFT: ${nft.mint}`);
        if (isProcessing || isUploading) {
            console.log(`${LOG_TAG} Ignoring NFT selection while processing`);
            return;
        }
        
        if (!nft.image) {
            console.warn(`${LOG_TAG} Selected NFT has no image: ${nft.mint}`);
            Alert.alert('Invalid NFT', 'This NFT does not have a valid image.');
            return;
        }
        
        setSelectedNft(nft);
        setLocalImageUri(nft.image);
        setSelectedSource('nft');
        
        console.log(`${LOG_TAG} Switching view to NFT_CONFIRM`);
        setCurrentView(DrawerView.NFT_CONFIRM);
    }, [isProcessing, isUploading, setCurrentView]);

    // Cancel NFT selection (from confirm view back to list)
    const handleCancelNftSelection = useCallback(() => {
        console.log(`${LOG_TAG} handleCancelNftSelection triggered (back to list)`);
        if (isProcessing || isUploading) {
            console.log(`${LOG_TAG} Ignoring cancel while processing`);
            return;
        }
        
        setSelectedNft(null);
        setLocalImageUri(null);
        setSelectedSource(null);
        
        console.log(`${LOG_TAG} Switching view back to NFT_LIST`);
        setCurrentView(DrawerView.NFT_LIST);
    }, [isProcessing, isUploading, setCurrentView]);

    // Cancel NFT flow entirely (from list or confirm back to profile edit)
    const handleCancelNftFlow = useCallback(() => {
        console.log(`${LOG_TAG} handleCancelNftFlow triggered (back to profile edit)`);
        if (isProcessing || isUploading) {
            console.log(`${LOG_TAG} Ignoring cancel while processing`);
            return;
        }
        
        setSelectedNft(null);
        setLocalImageUri(null);
        setSelectedSource(null);
        setCachedNfts([]);
        setNftsError(null);
        setNftsLoading(false);

        console.log(`${LOG_TAG} Switching view back to PROFILE_EDIT`);
        setCurrentView(DrawerView.PROFILE_EDIT);
    }, [isProcessing, isUploading, setCurrentView]);

    // Confirm the selected NFT (Calls handleConfirmImageUpload)
    const handleConfirmNft = useCallback(() => {
        console.log(`${LOG_TAG} handleConfirmNft triggered`);
        if (isProcessing || isUploading || !selectedNft || !selectedNft.image) {
            console.warn(`${LOG_TAG} Cannot confirm NFT: ${isProcessing ? 'Processing' : isUploading ? 'Uploading' : 'No valid NFT selected'}`);
            return;
        }
        handleConfirmImageUpload(selectedNft.image, 'nft');
    }, [selectedNft, isProcessing, isUploading, handleConfirmImageUpload]);

    // Retry loading NFTs
    const handleRetryNftLoad = useCallback(() => {
        console.log(`${LOG_TAG} handleRetryNftLoad triggered`);
        if (nftsLoading || isProcessing || isUploading) {
            console.log(`${LOG_TAG} Retry aborted (already busy)`);
            return;
        }
        fetchNFTs();
    }, [fetchNFTs, nftsLoading, isProcessing, isUploading]);

    // Update profile (username, description)
    const handleUpdateProfileDetails = useCallback(async () => {
        console.log(`${LOG_TAG} handleUpdateProfileDetails triggered (Username/Description)`);
        if (!profileData.userId || isProcessing || isUploading) {
            console.warn(`${LOG_TAG} Update aborted (${!profileData.userId ? 'No user ID' : isProcessing ? 'Processing' : 'Uploading'})`);
            return;
        }

        const newUsername = tempUsername.trim();
        const newDescription = tempDescription.trim();
        const usernameChanged = newUsername !== profileData.username && newUsername.length > 0;
        const descriptionChanged = newDescription !== profileData.description;

        if (!usernameChanged && !descriptionChanged) {
            console.log(`${LOG_TAG} No changes detected for update`);
            Alert.alert('No Changes', 'No changes were made to your profile details.');
            onClose();
            return;
        }

        setIsProcessing(true);
        let changesMade = false;
        
        try {
            if (usernameChanged) {
                console.log(`${LOG_TAG} Updating username to: ${newUsername}`);
                await dispatch(
                    updateUsername({ userId: profileData.userId, newUsername })
                ).unwrap();
                if (onProfileUpdated) onProfileUpdated('username');
                changesMade = true;
            }

            if (descriptionChanged) {
                console.log(`${LOG_TAG} Updating description to: ${newDescription}`);
                await dispatch(
                    updateDescription({ userId: profileData.userId, newDescription })
                ).unwrap();
                if (onProfileUpdated) onProfileUpdated('description');
                changesMade = true;
            }

            if (changesMade) {
                console.log(`${LOG_TAG} Profile update successful`);
                Alert.alert('Profile Updated', 'Your profile has been updated successfully');
                onClose(); 
            }
        } catch (err: any) {
            console.error(`${LOG_TAG} Profile update failed:`, err);
            if (isMounted.current) {
                const message = err?.message || err?.toString() || 'An unknown error occurred during update.';
                Alert.alert('Update Failed', message);
            }
        } finally {
            if (isMounted.current) {
                console.log(`${LOG_TAG} Finishing profile update process`);
                setIsProcessing(false);
            }
        }
    }, [
        dispatch,
        tempUsername,
        tempDescription,
        profileData.userId,
        profileData.username,
        profileData.description,
        onProfileUpdated,
        onClose,
        isProcessing,
        isUploading
    ]);

    // --- Render Helpers --- 
    const EmptyNftList = useCallback(() => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
                You have no NFTs in this wallet.
            </Text>
        </View>
    ), []);

    const keyExtractor = useCallback((item: NftItem) => 
        item.mint || `nft-${Math.random().toString(36).substring(2, 9)}`, 
    []);

    const renderNftItem = useCallback(({ item }: { item: NftItem }) => (
        <TouchableOpacity
            style={styles.nftListItem}
            onPress={() => handleSelectNft(item)}
            disabled={isProcessing || isUploading}
            activeOpacity={0.7}>
            
            <View style={styles.nftListImageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.nftListImage}
                        defaultSource={require('@/assets/images/User.png')}
                        onError={(e) => console.warn(`${LOG_TAG} Failed to load NFT image ${item.mint}: ${e.nativeEvent.error}`)}
                    />
                ) : (
                    <View style={styles.nftListPlaceholder}>
                        <Text style={styles.nftListPlaceholderText}>No Image</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.nftListInfo}>
                <Text style={styles.nftListName} numberOfLines={1}>{item.name || 'Unnamed NFT'}</Text>
                {item.collection ? (
                    <Text style={styles.nftListCollection} numberOfLines={1}>{item.collection}</Text>
                ) : null}
                {item.mint && (
                    <Text style={styles.nftListMint} numberOfLines={1}>
                        {item.mint.slice(0, 6)}...{item.mint.slice(-4)}
                    </Text>
                )}
            </View>
            
            <View style={styles.nftListSelectIconContainer}>
                <Text style={styles.nftListSelectIcon}>⟩</Text>
            </View>
        </TouchableOpacity>
    ), [handleSelectNft, isProcessing, isUploading]);

    // Add isChanged() function to check if any profile data has changed
    const isChanged = useCallback(() => {
        return (
            tempUsername.trim() !== profileData.username ||
            tempDescription.trim() !== profileData.description
        );
    }, [tempUsername, tempDescription, profileData.username, profileData.description]);

    // Render content based on currentView state
    const renderContent = () => {
        switch (currentView) {
            case DrawerView.NFT_LIST:
                return (
                    <View style={styles.nftListContainer}>
                        <View style={styles.viewHeader}>
                            <TouchableOpacity
                                style={styles.viewHeaderButton}
                                onPress={handleCancelNftFlow}
                                disabled={isProcessing || isUploading || nftsLoading}>
                                <Text style={styles.viewHeaderButtonText}>{'←'}</Text>
                            </TouchableOpacity>
                            <Text style={styles.viewHeaderTitle}>Choose an NFT</Text>
                            <View style={styles.viewHeaderButton} />
                        </View>
                        
                        <View style={styles.nftInstructionsContainer}>
                            <Text style={styles.nftInstructionsText}>
                                Select an NFT from your collection to use as your profile picture
                            </Text>
                        </View>

                        {nftsLoading ? (
                            <View style={styles.centeredMessageContainer}>
                                <ActivityIndicator size="large" color={COLORS.brandPrimary} />
                                <Text style={styles.loadingText}>Loading your NFTs...</Text>
                            </View>
                        ) : nftsError ? (
                            <View style={styles.centeredMessageContainer}>
                                <Text style={styles.errorText}>{nftsError}</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={handleRetryNftLoad}
                                    disabled={nftsLoading || isProcessing || isUploading}
                                    activeOpacity={0.7}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {cachedNfts.length > 0 ? (
                                    <FlatList
                                        data={cachedNfts}
                                        keyExtractor={keyExtractor}
                                        renderItem={renderNftItem}
                                        style={styles.flatListStyle}
                                        ListEmptyComponent={EmptyNftList}
                                        contentContainerStyle={styles.flatListContentContainer}
                                        initialNumToRender={10}
                                        maxToRenderPerBatch={10}
                                        windowSize={11}
                                        removeClippedSubviews={true}
                                        showsVerticalScrollIndicator={false}
                                    />
                                ) : (
                                    <EmptyNftList />
                                )}
                            </>
                        )}
                    </View>
                );
                    
            case DrawerView.NFT_CONFIRM:
                return (
                    <View style={styles.nftConfirmContainer}>
                        <View style={styles.viewHeader}>
                            <TouchableOpacity
                                style={styles.viewHeaderButton}
                                onPress={handleCancelNftSelection}
                                disabled={isProcessing || isUploading}>
                                <Text style={styles.viewHeaderButtonText}>{'←'}</Text>
                            </TouchableOpacity>
                            <Text style={styles.viewHeaderTitle}>Confirm Selection</Text>
                            <View style={styles.viewHeaderButton} />
                        </View>

                        {selectedNft && selectedNft.image ? (
                            <View style={styles.nftConfirmContent}>
                                <View style={styles.nftConfirmImageContainer}>
                                    <Image
                                        source={{ uri: selectedNft.image }}
                                        style={styles.nftConfirmImage}
                                        defaultSource={require('@/assets/images/User.png')}
                                        onError={() => {
                                            console.error(`${LOG_TAG} NFT confirm: Failed to load image preview: ${selectedNft.image}`);
                                            Alert.alert('Image Load Error', 'Failed to load the selected NFT image');
                                        }}
                                    />
                                </View>
                                <Text style={styles.nftConfirmName}>{selectedNft.name}</Text>
                                {selectedNft.collection && (
                                    <Text style={styles.nftConfirmCollection}>{selectedNft.collection}</Text>
                                )}
                                
                                <Text style={styles.nftConfirmInstructions}>
                                    This NFT will be used as your profile picture
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.centeredMessageText}>No NFT selected or image missing</Text>
                        )}

                        <View style={styles.nftConfirmActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCancelNftSelection}
                                disabled={isProcessing || isUploading}
                                activeOpacity={0.7}>
                                <Text style={styles.actionButtonText}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.confirmButton]}
                                onPress={handleConfirmNft}
                                disabled={isProcessing || isUploading || !selectedNft?.image}
                                activeOpacity={0.7}>
                                {isUploading ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={styles.actionButtonText}>Use as Profile</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case DrawerView.PROFILE_EDIT:
            default:
                return (
                    <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.imageSection}>
                        <TouchableOpacity
                            onPress={handleToggleAvatarOptions}
                            style={styles.imageContainer}
                            activeOpacity={0.8}
                            disabled={isProcessing || isUploading}>
                            <IPFSAwareImage
                                style={styles.profileImage as ImageStyle}
                                source={
                                    localImageUri
                                        ? { uri: localImageUri }
                                        : profileData.profilePicUrl
                                            ? getValidImageSource(profileData.profilePicUrl)
                                            : require('@/assets/images/User.png')
                                }
                                defaultSource={require('@/assets/images/User.png')}
                            />
                            
                            <View style={styles.profileImageOverlay}>
                                <View style={styles.profileImageEditIconContainer}>
                                    <Text style={styles.profileImageEditIcon}>✏️</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleToggleAvatarOptions}
                            activeOpacity={0.7}
                            disabled={isProcessing || isUploading}
                            style={styles.editPictureButton}>
                            <Text style={styles.editPictureText}>Edit picture</Text>
                        </TouchableOpacity>

                        {showAvatarOptions && (
                            <View style={styles.avatarOptionsContainer}>
                                <TouchableOpacity
                                    style={[styles.avatarOptionButton, styles.avatarOptionButtonWithMargin]}
                                    onPress={handleSelectImageFromLibrary}
                                    disabled={isProcessing || isUploading || isPreparingNfts}
                                    activeOpacity={0.7}>
                                    <Text style={styles.avatarOptionButtonIcon}>🖼️</Text>
                                    <Text style={styles.avatarOptionText}>Library</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.avatarOptionButton}
                                    onPress={handlePrepareAndShowNfts}
                                    disabled={isProcessing || isUploading || isPreparingNfts}
                                    activeOpacity={0.7}>
                                    {isPreparingNfts ? (
                                        <ActivityIndicator size="small" color={COLORS.white} style={styles.activityIndicatorMargin}/>
                                    ) : (
                                        <Text style={styles.avatarOptionButtonIcon}>🎆</Text>
                                    )}
                                    <Text style={styles.avatarOptionText}>My NFTs</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputSection}>
                        <View style={styles.inputLabelContainer}>
                            <Text style={styles.inputLabel}>Display name</Text>
                            <Text style={styles.characterCount}>{tempUsername.length}/50</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.textInput,
                                tempUsername.length >= 50 && styles.textInputAtLimit
                            ]}
                            value={tempUsername}
                            onChangeText={setTempUsername}
                            placeholder="Enter your display name"
                            placeholderTextColor={COLORS.greyMid}
                            maxLength={50}
                            editable={!isProcessing && !isUploading}
                        />
                        <Text style={styles.inputHelperText}>This is the name that will be displayed to others</Text>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Wallet address</Text>
                        <TextInput
                            style={[styles.textInput, styles.disabledInput]}
                            value={`@${profileData.userId.substring(0, 6)}...${profileData.userId.slice(-4)}`}
                            editable={false}
                        />
                        <Text style={styles.inputHelperText}>Your wallet address cannot be changed</Text>
                    </View>

                    <View style={styles.inputSection}>
                        <View style={styles.inputLabelContainer}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <Text style={[
                                styles.characterCount,
                                tempDescription.length > 150 && styles.characterCountWarning
                            ]}>
                                {tempDescription.length}/160
                            </Text>
                        </View>
                        <TextInput
                            style={[
                                styles.textInput, 
                                styles.bioInput,
                                tempDescription.length >= 160 && styles.textInputAtLimit
                            ]}
                            value={tempDescription}
                            onChangeText={setTempDescription}
                            placeholder="Write a short bio about yourself"
                            placeholderTextColor={COLORS.greyMid}
                            multiline
                            maxLength={160}
                            editable={!isProcessing && !isUploading}
                        />
                        <Text style={styles.inputHelperText}>Tell others about yourself in a few words</Text>
                    </View>
                         <View style={styles.bottomSpacerView} />
                </ScrollView>
                );
        }
    };

    // --- Main Render ---
    console.log(`${LOG_TAG} Rendering Drawer (Visible: ${visible}, View: ${DrawerView[currentView]}, Processing: ${isProcessing}, Uploading: ${isUploading})`);

    return (
            <Modal
            visible={visible}
                transparent
            animationType="slide"
                onRequestClose={() => {
                if (isProcessing || isUploading) return;
                if (currentView === DrawerView.NFT_LIST) {
                    handleCancelNftFlow();
                } else if (currentView === DrawerView.NFT_CONFIRM) {
                    handleCancelNftSelection();
                } else {
                    onClose();
                }
            }}>

            <TouchableWithoutFeedback onPress={() => {
                 if (isProcessing || isUploading) return;
                 onClose();
            }}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <View style={styles.drawerContainer}>
                {currentView === DrawerView.PROFILE_EDIT && (
                     <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.backButton}
                            disabled={isProcessing || isUploading}>
                            <Text style={styles.backButtonText}>✕</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (isChanged()) ? styles.saveButtonActive : styles.saveButtonInactive
                            ]}
                            onPress={handleUpdateProfileDetails}
                            disabled={isProcessing || isUploading || !isChanged()}>
                            <Text style={[
                                styles.saveButtonText,
                                (isChanged()) ? styles.saveButtonTextActive : styles.saveButtonTextInactive
                            ]}>
                                {isProcessing ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {renderContent()}

                {showUploadProgress && (
                    <View style={styles.uploadProgressOverlay}>
                        <View style={styles.uploadProgressContainer}>
                            <Text style={styles.uploadProgressTitle}>Uploading Image</Text>
                            <View style={styles.uploadProgressBarContainer}>
                                <View 
                                    style={[
                                        styles.uploadProgressBar,
                                        { width: `${uploadProgress}%` }
                                    ]} 
                                />
                            </View>
                            <Text style={styles.uploadProgressText}>
                                {uploadProgress.toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                )}

                </View>
        </Modal>
    );
} 