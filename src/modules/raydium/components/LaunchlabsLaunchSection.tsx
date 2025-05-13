import React, {useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  View,
  Switch,
  StyleSheet,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import PumpfunCard from '../../pumpFun/components/PumpfunCard';
import {TransactionService} from '../../walletProviders/services/transaction/transactionService';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Define the props interface for our component
interface LaunchlabsLaunchSectionProps {
  containerStyle?: any;
  inputStyle?: any;
  buttonStyle?: any;
  launchButtonLabel?: string;
  onGoToLab?: (tokenData: TokenData) => void;
  onJustSendIt?: (tokenData: TokenData) => void;
}

// Define the token data interface
export interface TokenData {
  name: string;
  symbol: string;
  description: string;
  imageUri?: string | null;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export const LaunchlabsLaunchSection: React.FC<
  LaunchlabsLaunchSectionProps
> = ({
  containerStyle,
  inputStyle,
  buttonStyle,
  launchButtonLabel = 'Launch Token',
  onGoToLab,
  onJustSendIt,
}) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Add a new state variable to track whether social fields are visible
  const [showSocials, setShowSocials] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const validateForm = (): boolean => {
    if (!tokenName) {
      Alert.alert('Error', 'Please enter a token name');
      return false;
    }

    if (!tokenSymbol) {
      Alert.alert('Error', 'Please enter a token symbol');
      return false;
    }

    if (!description) {
      Alert.alert('Error', 'Please provide a token description');
      return false;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please select an image for your token');
      return false;
    }

    return true;
  };

  // Handle the "justSendIt" mode - simple token creation with default settings
  const handleJustSendIt = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus('Preparing JustSendIt token launch...');

    try {
      // Create token data with default parameters
      const tokenData: TokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        description,
        imageUri,
        twitter: twitter || undefined,
        telegram: telegram || undefined,
        website: website || undefined,
      };

      // Use a preset configuration for JustSendIt mode (as per docs)
      if (onJustSendIt) {
        onJustSendIt(tokenData);
      } else {
        // Fallback if handler is not provided
        Alert.alert(
          'JustSendIt',
          'Ready to launch token with standard settings',
        );
      }
    } catch (error: any) {
      console.error('JustSendIt error:', error);
      setStatus('Preparation failed');
      Alert.alert('Error', error.message || 'Failed to prepare token data');
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  // Handle the "go to lab" mode - advanced configuration
  const handleGoToLab = () => {
    if (validateForm() && onGoToLab) {
      // Create token data to pass to the advanced options
      const tokenData: TokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        description,
        imageUri,
        twitter: twitter || undefined,
        telegram: telegram || undefined,
        website: website || undefined,
      };

      // Pass the token data to the parent component for advanced configuration
      onGoToLab(tokenData);
    }
  };

  // Toggle social fields visibility
  const toggleSocials = () => {
    setShowSocials(!showSocials);
  };

  return (
    <PumpfunCard containerStyle={containerStyle}>
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Token Name</Text>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder="Token Name"
          placeholderTextColor={COLORS.greyMid}
          value={tokenName}
          onChangeText={setTokenName}
          editable={!loading}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Token Symbol</Text>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder="Symbol (e.g. BTC)"
          placeholderTextColor={COLORS.greyMid}
          value={tokenSymbol}
          onChangeText={setTokenSymbol}
          editable={!loading}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, inputStyle, {height: 80}]}
          placeholder="Describe your token's purpose"
          placeholderTextColor={COLORS.greyMid}
          multiline
          value={description}
          onChangeText={setDescription}
          editable={!loading}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Token Image</Text>
        <View style={styles.imageUploadContainer}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{uri: imageUri}} style={styles.imagePreview} />
              <View style={styles.imageControlsContainer}>
                <TouchableOpacity
                  style={styles.imageControlButton}
                  onPress={pickImage}
                  disabled={loading}>
                  <Text style={styles.imageControlText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageControlButton, styles.removeButton]}
                  onPress={removeImage}
                  disabled={loading}>
                  <Text style={styles.imageControlText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadContent}>
              <View style={styles.uploadIconContainer}>
                <View style={styles.uploadIcon}>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 3L12 17M12 3L7 8M12 3L17 8"
                      stroke={COLORS.white}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M3 21H21M3 21V19M21 21V19"
                      stroke={COLORS.white}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
              </View>
              <Text style={styles.uploadText}>
                drag and drop an image or video
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.selectFileButton}
                disabled={loading}>
                <Text style={styles.selectFileText}>select file</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Add socials section */}
      <View style={styles.formField}>
        <TouchableOpacity
          style={styles.socialsToggleButton}
          onPress={toggleSocials}
          disabled={loading}>
          <Text style={styles.socialsToggleText}>
            add socials (optional) {showSocials ? '↑' : '↓'}
          </Text>
        </TouchableOpacity>

        {showSocials && (
          <View style={styles.socialsContainer}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Twitter (optional)</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="@username"
                placeholderTextColor={COLORS.greyMid}
                value={twitter}
                onChangeText={setTwitter}
                editable={!loading}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Telegram (optional)</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="t.me/community"
                placeholderTextColor={COLORS.greyMid}
                value={telegram}
                onChangeText={setTelegram}
                editable={!loading}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Website (optional)</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={COLORS.greyMid}
                value={website}
                onChangeText={setWebsite}
                editable={!loading}
              />
            </View>
          </View>
        )}
      </View>

      {status && (
        <View style={styles.statusContainer}>
          <ActivityIndicator
            size="small"
            color={COLORS.brandBlue}
            style={styles.loader}
          />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleJustSendIt}
          style={[
            styles.button,
            styles.justSendItButton,
            buttonStyle,
            loading && styles.disabledButton,
          ]}
          disabled={loading}>
          <Text style={styles.buttonText}>justSendIt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoToLab}
          style={[styles.button, styles.goToLabButton]}
          disabled={loading}>
          <Text style={styles.buttonText}>go to lab</Text>
        </TouchableOpacity>
      </View>
    </PumpfunCard>
  );
};

const styles = StyleSheet.create({
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.greyMid,
    marginBottom: 8,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  input: {
    backgroundColor: 'transparent',
    color: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: TYPOGRAPHY.size.md,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  imageUploadContainer: {
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderStyle: 'dashed',
    height: 200,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 20,
  },
  uploadIconContainer: {
    marginBottom: 16,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  uploadText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  selectFileButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  selectFileText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageControlsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
  imageControlButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: 'rgba(220,53,69,0.8)', // Red color with transparency
  },
  imageControlText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  socialsToggleButton: {
    paddingVertical: 12,
    marginBottom: 0,
  },
  socialsToggleText: {
    color: COLORS.brandBlue,
    fontSize: TYPOGRAPHY.size.md,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  socialsContainer: {
    marginTop: 8,
  },
  verificationSection: {
    backgroundColor: COLORS.lighterBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  verificationTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    marginBottom: 16,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  switchDescription: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.greyMid,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  switchControl: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  verificationOptionsContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDarkColor,
  },
  verificationNote: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.brandBlue,
    marginTop: 12,
    fontFamily: TYPOGRAPHY.fontFamily,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lighterBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loader: {
    marginRight: 10,
  },
  statusText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  buttonsContainer: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  justSendItButton: {
    backgroundColor: COLORS.brandBlue,
  },
  goToLabButton: {
    backgroundColor: COLORS.darkerBackground,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default LaunchlabsLaunchSection;
