import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { ThreadPost, ThreadSection } from './thread.types';
import { useAppDispatch } from '@/shared/hooks/useReduxHooks';
import { updatePostAsync } from '@/shared/state/thread/reducer';
import COLORS from '@/assets/colors'; // Import colors
import Icons from '@/assets/svgs'; // Import icons if needed for section headers

interface EditPostModalProps {
    isVisible: boolean;
    onClose: () => void;
    post: ThreadPost | null; // Allow null for conditional rendering
}

const EditPostModal = ({ isVisible, onClose, post }: EditPostModalProps) => {
    const dispatch = useAppDispatch();
    const [sections, setSections] = useState<ThreadSection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize sections from post when modal opens or post changes
    useEffect(() => {
        if (isVisible && post && post.sections) {
            // Deep copy to avoid mutating the original post
            setSections([...post.sections]);
            setError(null); // Clear previous errors
        } else if (!isVisible) {
            // Reset state when modal closes
            setSections([]);
            setError(null);
        }
    }, [isVisible, post]);

    // Bail out early if no post is provided
    if (!post) {
        return null;
    }

    // Update section text 
    const updateSectionText = (uniqueIndex: number, text: string) => {
        const uniqueEditableSections = getUniqueEditableSections();
        if (uniqueIndex >= uniqueEditableSections.length) return;

        const sectionToUpdateInfo = uniqueEditableSections[uniqueIndex];
        const { type: sectionType, id: sectionId } = sectionToUpdateInfo;

        setSections(prevSections => {
            // Create a new array based on previous state
            return prevSections.map(section => {
                // For TEXT_IMAGE, update all sections of this type (usually just one)
                if (section.type === 'TEXT_IMAGE' && sectionType === 'TEXT_IMAGE') {
                    return { ...section, text };
                }
                // For other special types, update all of the same type (again, usually one)
                else if ((section.type === 'TEXT_VIDEO' || section.type === 'TEXT_TRADE') && section.type === sectionType) {
                    return { ...section, text };
                }
                // For TEXT_ONLY, only update the exact section by ID
                else if (section.type === 'TEXT_ONLY' && section.id === sectionId) {
                    return { ...section, text };
                }
                // Otherwise, return the section unchanged
                return section;
            });
        });
    };


    // Handle save
    const handleSave = async () => {
        if (!post || !post.id) return;

        setIsLoading(true);
        setError(null);

        try {
            // Filter out empty text sections before saving, unless it's the only section
             const sectionsToSave = sections.filter((s, index, arr) => {
                if (s.type === 'TEXT_ONLY') {
                    return s.text?.trim() !== '' || arr.length === 1;
                }
                // Keep non-text sections (like images, videos etc.)
                return true;
            });

             // Prevent saving if all text sections are now empty (and there were multiple originally)
            if (sectionsToSave.length === 0 && sections.length > 0) {
                 Alert.alert("Cannot Save", "Post content cannot be empty.");
                 setIsLoading(false);
                 return;
            }


            await dispatch(updatePostAsync({
                postId: post.id,
                sections: sectionsToSave // Save the potentially filtered sections
            })).unwrap();
            onClose(); // Close modal on success
        } catch (err: any) {
            setError(err.message || 'Failed to update post');
            console.error("Update post error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique sections for display in the UI, removing any duplicates
    const getUniqueEditableSections = (): ThreadSection[] => {
        if (!sections || sections.length === 0) return [];

        // Create a map to identify unique sections based on type or ID
        const uniqueSectionsMap = new Map<string, ThreadSection>();

        sections.forEach(section => {
            const sectionId = section.id || `temp-${Math.random()}`; // Ensure ID

            switch (section.type) {
                // Types where we only show/edit the *first* instance encountered
                case 'TEXT_IMAGE':
                case 'TEXT_VIDEO':
                case 'TEXT_TRADE':
                case 'NFT_LISTING':
                case 'POLL':
                    if (!uniqueSectionsMap.has(section.type)) {
                        uniqueSectionsMap.set(section.type, section);
                    }
                    break;
                 // Types where each instance is unique (by ID)
                case 'TEXT_ONLY':
                    if (!uniqueSectionsMap.has(sectionId)) {
                        uniqueSectionsMap.set(sectionId, section);
                    }
                    break;
                default:
                    // Handle potential unknown types gracefully
                     if (!uniqueSectionsMap.has(sectionId)) {
                        uniqueSectionsMap.set(sectionId, section);
                    }
                    break;
            }
        });

        return Array.from(uniqueSectionsMap.values());
    };

    // Renders appropriate editor based on section type
    const renderSectionEditor = (section: ThreadSection, index: number) => {
        // Common text input for all sections that have text
        const renderTextEditor = (placeholder: string) => (
            <TextInput
                value={section.text || ''}
                onChangeText={(text) => updateSectionText(index, text)}
                style={styles.textInput}
                placeholder={placeholder}
                placeholderTextColor={COLORS.greyMid}
                multiline
            />
        );

        switch (section.type) {
            case 'TEXT_ONLY':
                return (
                    <View style={styles.sectionContainer}>
                        {/* No title needed for simple text */}
                        {renderTextEditor("Edit your post...")}
                    </View>
                );

            case 'TEXT_IMAGE':
                return (
                    <View style={styles.sectionContainer}>
                        {/* Only show text input if original post had text */}
                        {post.sections.find(s => s.type === 'TEXT_IMAGE')?.text !== undefined &&
                            renderTextEditor("Edit image caption...")}
                        {section.imageUrl && (
                            <View style={styles.mediaPreviewContainer}>
                                <Image
                                    source={typeof section.imageUrl === 'string' ? { uri: section.imageUrl } : section.imageUrl}
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                                <Text style={styles.helperText}>
                                    Image cannot be changed
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 'TEXT_VIDEO':
                 // Assuming video URL is stored similarly to imageUrl
                const videoUrl = (section as any).videoUrl || 'Video Preview Unavailable';
                return (
                    <View style={styles.sectionContainer}>
                        {renderTextEditor("Edit video caption...")}
                         <View style={styles.mediaPreviewContainer}>
                             {/* Basic Video Placeholder */}
                             <View style={styles.videoPlaceholder}>
                                 <Text style={styles.videoPlaceholderText}>Video</Text>
                             </View>
                            <Text style={styles.helperText}>
                                Video cannot be changed
                            </Text>
                        </View>
                    </View>
                );

             case 'TEXT_TRADE':
                 const tradeInfo = (section as any).tradeInfo || {}; // Assuming trade data exists
                 return (
                    <View style={styles.sectionContainer}>
                        {renderTextEditor("Edit trade caption...")}
                        <View style={styles.mediaPreviewContainer}>
                            <View style={styles.tradePlaceholder}>
                                <Text style={styles.tradePlaceholderText}>Trade Details</Text>
                                {/* Optionally display some basic trade info if available */}
                                {/* <Text style={styles.helperText}>{`Token: ${tradeInfo.tokenSymbol}`}</Text> */}
                            </View>
                            <Text style={styles.helperText}>
                                Trade data cannot be changed
                            </Text>
                        </View>
                    </View>
                );


             case 'NFT_LISTING':
                 const nftInfo = (section as any).nftInfo || {}; // Assuming NFT data exists
                return (
                    <View style={[styles.sectionContainer, styles.nonEditableSection]}>
                        <Text style={styles.sectionTitle}>NFT Listing</Text>
                         {nftInfo.imageUrl && (
                            <Image source={{ uri: nftInfo.imageUrl }} style={styles.nftPreview} resizeMode="contain" />
                        )}
                        <Text style={styles.helperTextBold}>
                            NFT listing data cannot be edited
                        </Text>
                    </View>
                );

             case 'POLL':
                 const pollOptions = (section as any).pollOptions || [];
                return (
                    <View style={[styles.sectionContainer, styles.nonEditableSection]}>
                        <Text style={styles.sectionTitle}>Poll</Text>
                         {pollOptions.map((opt: string, i: number) => (
                            <Text key={i} style={styles.pollOptionText}>{`- ${opt}`}</Text>
                        ))}
                        <Text style={styles.helperTextBold}>
                            Poll data cannot be edited
                        </Text>
                    </View>
                );


            default:
                 // Render a generic non-editable state for unknown types
                return (
                    <View style={[styles.sectionContainer, styles.nonEditableSection]}>
                        <Text style={styles.sectionTitle}>Unsupported Section</Text>
                        <Text style={styles.helperTextBold}>
                             This section type cannot be edited.
                        </Text>
                    </View>
                );
        }
    };

    // Get unique sections for the UI
    const uniqueDisplaySections = getUniqueEditableSections();

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => !isLoading && onClose()} // Prevent closing while loading
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.modalOverlay}>
                    {/* Touchable overlay to close modal */}
                     <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => !isLoading && onClose()}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Post</Text>
                            <TouchableOpacity onPress={() => !isLoading && onClose()} style={styles.closeButton} disabled={isLoading}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                            {uniqueDisplaySections.length === 0 && !isLoading && (
                                <Text style={styles.helperText}>No editable content found.</Text>
                            )}
                            {uniqueDisplaySections.map((section, index) => (
                                <View key={section.id || `section-${index}`}>
                                    {renderSectionEditor(section, index)}
                                </View>
                            ))}

                            {error && (
                                <Text style={styles.errorText}>{error}</Text>
                            )}
                        </ScrollView>

                        {/* Footer with buttons */}
                        <View style={styles.footer}>
                             <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                                disabled={isLoading}
                            >
                                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={[styles.buttonText, styles.saveButtonText]}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '92%', // Slightly wider
        maxHeight: '85%', // Allow more height
        backgroundColor: COLORS.white,
        borderRadius: 16, // More rounded corners
        overflow: 'hidden',
        elevation: 8, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.greyBorder, // Use existing border color
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600', // Slightly bolder
        color: COLORS.black,
    },
    closeButton: {
        padding: 8, // Easier to tap
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.greyDark,
    },
    scrollView: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8, // Add padding at the bottom
    },
    sectionContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.greyBorder, // Use existing border color
        borderRadius: 8,
        padding: 12,
        backgroundColor: COLORS.background, // Subtle background difference
    },
     nonEditableSection: {
        backgroundColor: COLORS.greyLight, // Different background for non-editable
        borderColor: COLORS.greyMid,
    },
    sectionTitle: {
        fontSize: 14, // Smaller title
        fontWeight: '600',
        marginBottom: 10,
        color: COLORS.greyDark, // Use existing grey color
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.greyBorder, // Use existing border color
        borderRadius: 8, // More rounded
        paddingVertical: 12,
        paddingHorizontal: 12,
        minHeight: 100, // Slightly taller
        fontSize: 16,
        color: COLORS.black, // Use black for primary text
        backgroundColor: COLORS.white,
        textAlignVertical: 'top', // Align text top on Android
    },
    mediaPreviewContainer: {
        marginTop: 12,
        alignItems: 'center',
        padding: 8,
        backgroundColor: COLORS.greyLight, // Background for media
        borderRadius: 8,
    },
    imagePreview: {
        width: '100%',
        aspectRatio: 16 / 9, // Standard aspect ratio
        borderRadius: 6,
        marginBottom: 8,
    },
    nftPreview: {
        width: 100,
        height: 100,
        borderRadius: 6,
        marginBottom: 8,
        alignSelf: 'center',
    },
     videoPlaceholder: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 6,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    videoPlaceholderText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
     tradePlaceholder: {
        width: '100%',
        paddingVertical: 20,
        borderRadius: 6,
        backgroundColor: COLORS.greyLight, // Fallback to greyLight
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    tradePlaceholderText: {
        color: COLORS.brandPrimary, // Use primary brand color
        fontWeight: 'bold',
    },
    pollOptionText: {
        fontSize: 14,
        color: COLORS.greyDark, // Use existing grey color
        marginBottom: 4,
    },
    helperText: {
        fontSize: 13, // Slightly larger helper text
        color: COLORS.greyDark, // Use existing grey color
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },
    helperTextBold: {
        fontSize: 13,
        color: COLORS.greyDark, // Use existing grey color
        fontWeight: '600', // Bolder for non-editable
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.greyBorder, // Use existing border color
        backgroundColor: COLORS.white, // Ensure footer background
    },
    button: {
        paddingVertical: 12, // Taller buttons
        paddingHorizontal: 24, // Wider buttons
        borderRadius: 25, // Pill shape
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100, // Minimum width
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelButton: {
        backgroundColor: COLORS.greyLight, // Lighter cancel
        borderWidth: 1,
        borderColor: COLORS.greyBorder, // Use existing border color
    },
    saveButton: {
        backgroundColor: COLORS.brandPrimary, // Use theme primary
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600', // Bolder text
    },
    cancelButtonText: {
         color: COLORS.greyDark, // Use existing grey color
    },
    saveButtonText: {
        color: COLORS.white,
    },
    errorText: {
        color: '#FF3B30', // Standard iOS red for errors
        marginVertical: 10,
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default EditPostModal; 