import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  View,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePumpFun } from '../hooks/usePumpFun';
import { PumpfunLaunchStyles } from './Pumpfun.styles';
import PumpfunCard from './PumpfunCard';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';
import { PumpfunLaunchSectionProps } from '../types';

export const PumpfunLaunchSection: React.FC<PumpfunLaunchSectionProps> = ({
  containerStyle,
  inputStyle,
  buttonStyle,
  launchButtonLabel = 'Launch Token',
}) => {
  const { launchToken } = usePumpFun();

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [solAmount, setSolAmount] = useState('0.001');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Verification options
  const [verifyToken, setVerifyToken] = useState(true);
  const [dataIntegrityAccepted, setDataIntegrityAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleLaunch = async () => {
    if (!tokenName || !tokenSymbol || !description || !imageUri) {
      Alert.alert(
        'Error',
        'Please fill in name, symbol, description, and select an image.',
      );
      return;
    }

    // Verify that the user has accepted terms if verification is enabled
    if (verifyToken && (!dataIntegrityAccepted || !termsAccepted)) {
      Alert.alert(
        'Verification Terms',
        'You must accept both data integrity and terms to verify your token.',
      );
      return;
    }

    setLoading(true);
    setStatus('Preparing token launch...');

    try {
      await launchToken({
        tokenName,
        tokenSymbol,
        description,
        twitter,
        telegram,
        website,
        imageUri,
        solAmount: Number(solAmount),
        // Add verification options
        verifyToken,
        dataIntegrityAccepted,
        termsAccepted,
        onStatusUpdate: (newStatus) => {
          console.log('Launch token status:', newStatus);
          // Use TransactionService to filter raw error messages
          TransactionService.filterStatusUpdate(newStatus, setStatus);
        }
      });
      setStatus('Token launched successfully!');
      // Success message will be handled by TransactionService
    } catch (error: any) {
      console.error('Launch error:', error);
      // Don't show raw error in UI
      setStatus('Transaction failed');
      // Error notification will be handled by TransactionService
    } finally {
      setTimeout(() => {
        setLoading(false);
        setStatus(null);
      }, 2000);
    }
  };

  return (
    <PumpfunCard containerStyle={containerStyle}>
      <Text style={PumpfunLaunchStyles.header}>Pumpfun Token Launch</Text>

      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle]}
        placeholder="Token Name"
        value={tokenName}
        onChangeText={setTokenName}
        editable={!loading}
      />
      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle]}
        placeholder="Token Symbol"
        value={tokenSymbol}
        onChangeText={setTokenSymbol}
        editable={!loading}
      />
      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle, { height: 60 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
        editable={!loading}
      />
      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle]}
        placeholder="Twitter (optional)"
        value={twitter}
        onChangeText={setTwitter}
        editable={!loading}
      />
      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle]}
        placeholder="Telegram (optional)"
        value={telegram}
        onChangeText={setTelegram}
        editable={!loading}
      />
      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle]}
        placeholder="Website (optional)"
        value={website}
        onChangeText={setWebsite}
        editable={!loading}
      />
      <TextInput
        style={[PumpfunLaunchStyles.input, inputStyle]}
        placeholder="Initial SOL to Buy (e.g. 0.001)"
        keyboardType="decimal-pad"
        value={solAmount}
        onChangeText={setSolAmount}
        editable={!loading}
      />

      <TouchableOpacity
        onPress={pickImage}
        style={[PumpfunLaunchStyles.imageButton, loading && { opacity: 0.5 }]}
        disabled={loading}>
        <Text style={PumpfunLaunchStyles.imageButtonText}>
          {imageUri ? 'Change Image' : 'Pick Image'}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={PumpfunLaunchStyles.imagePreview}
        />
      )}

      {/* Token Verification Options */}
      <View style={PumpfunLaunchStyles.verificationSection}>
        <Text style={PumpfunLaunchStyles.verificationTitle}>Token Verification</Text>

        <View style={PumpfunLaunchStyles.switchRow}>
          <Text style={PumpfunLaunchStyles.switchLabel}>Verify on RugCheck</Text>
          <Switch
            value={verifyToken}
            onValueChange={setVerifyToken}
            disabled={loading}
            trackColor={{ false: '#d3d3d3', true: '#cce5ff' }}
            thumbColor={verifyToken ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        {verifyToken && (
          <>
            <View style={PumpfunLaunchStyles.switchRow}>
              <Text style={PumpfunLaunchStyles.switchLabel}>
                I confirm the data provided is accurate
              </Text>
              <Switch
                value={dataIntegrityAccepted}
                onValueChange={setDataIntegrityAccepted}
                disabled={loading}
                trackColor={{ false: '#d3d3d3', true: '#cce5ff' }}
                thumbColor={dataIntegrityAccepted ? '#2196F3' : '#f4f3f4'}
              />
            </View>

            <View style={PumpfunLaunchStyles.switchRow}>
              <Text style={PumpfunLaunchStyles.switchLabel}>
                I accept the RugCheck terms of service
              </Text>
              <Switch
                value={termsAccepted}
                onValueChange={setTermsAccepted}
                disabled={loading}
                trackColor={{ false: '#d3d3d3', true: '#cce5ff' }}
                thumbColor={termsAccepted ? '#2196F3' : '#f4f3f4'}
              />
            </View>

            <Text style={PumpfunLaunchStyles.verificationNote}>
              Verifying your token on RugCheck helps build trust with your community.
            </Text>
          </>
        )}
      </View>

      {status && (
        <Text style={PumpfunLaunchStyles.statusText}>{status}</Text>
      )}

      <TouchableOpacity
        onPress={handleLaunch}
        style={[PumpfunLaunchStyles.launchButton, buttonStyle]}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={PumpfunLaunchStyles.launchButtonText}>
            {launchButtonLabel}
          </Text>
        )}
      </TouchableOpacity>
    </PumpfunCard>
  );
};

export default PumpfunLaunchSection;
