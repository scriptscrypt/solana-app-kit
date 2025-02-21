import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import COLORS from '../../assets/colors'; // or wherever your colors are
import {usePumpfun} from '../../hooks/usePumpfun';

/**
 * PumpfunLaunchButton (Improved UI/UX)
 *
 * This component allows the user to:
 *  1) Enter token data (name, symbol, description).
 *  2) Paste a remote image URL (we download & preview it).
 *  3) Optionally enter social links (twitter, telegram, website).
 *  4) Press "Launch Token" to call `launchToken`.
 *
 * On success, we show the minted token address and a success alert.
 */
export const PumpfunLaunchButton = () => {
  const {launchToken} = usePumpfun();

  // Form fields
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewValid, setIsPreviewValid] = useState(false); // tracks whether the pasted URL loads successfully
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);

  // Whenever `imageUrl` changes, try to validate (basic check: if it ends in .png, .jpg, .jpeg, etc.)
  // Then we can attempt an <Image> preview. If it fails to load, we show an error placeholder.
  useEffect(() => {
    setIsPreviewValid(false);
  }, [imageUrl]);

  // This triggers the actual token creation
  const handleLaunchToken = async () => {
    if (!tokenName.trim() || !tokenSymbol.trim()) {
      Alert.alert('Missing fields', 'Please fill out token name and symbol.');
      return;
    }
    setIsLoading(true);
    setTokenAddress(null);

    try {
      await launchToken({
        tokenName: tokenName.trim(),
        tokenSymbol: tokenSymbol.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        additionalOptions: {
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          website: website.trim(),
        },
      });
      Alert.alert('Success!', 'Your token has been launched on Pump.fun.');
      // If you want the minted public key, see `launchTokenViaPumpfun`
      // which returns {txId, mintPubkey}. We can capture it by modifying usePumpfun or returning it here:
      setTokenAddress('(Check console or code)');
    } catch (error: any) {
      console.error('Error launching token:', error);
      Alert.alert('Error', error?.message || String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // We show a "Broken" placeholder if the image fails to load
  const handleImageError = () => {
    setIsPreviewValid(false);
  };

  const handleImageLoad = () => {
    setIsPreviewValid(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Launch a New Pump.fun Token</Text>

      {/* Token Name */}
      <Text style={styles.label}>Token Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. ExampleToken"
        value={tokenName}
        onChangeText={setTokenName}
      />

      {/* Token Symbol */}
      <Text style={styles.label}>Symbol *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. EXM"
        value={tokenSymbol}
        onChangeText={setTokenSymbol}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, {height: 80}]}
        placeholder="Short description of your token..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Social Links */}
      <Text style={styles.label}>Twitter (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="https://twitter.com/YourToken"
        value={twitter}
        onChangeText={setTwitter}
      />

      <Text style={styles.label}>Telegram (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="https://t.me/YourTokenChat"
        value={telegram}
        onChangeText={setTelegram}
      />

      <Text style={styles.label}>Website (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com"
        value={website}
        onChangeText={setWebsite}
      />

      {/* Image URL */}
      <Text style={styles.label}>Image URL (Paste a direct link)</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/image.png"
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      {imageUrl ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <Image
            source={{uri: imageUrl}}
            style={styles.previewImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {!isPreviewValid && (
            <Text style={styles.previewError}>
              Could not load this image URL.
            </Text>
          )}
        </View>
      ) : null}

      {/* Launch Button + spinner */}
      <TouchableOpacity
        style={[styles.button, isLoading && {opacity: 0.8}]}
        onPress={handleLaunchToken}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Launch Token</Text>
        )}
      </TouchableOpacity>

      {tokenAddress && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Minted Token Address: {tokenAddress}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default PumpfunLaunchButton;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FDFDFD',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.greyBorderdark || '#CCC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  previewContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  previewImage: {
    width: 180,
    height: 180,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  previewError: {
    color: '#d33',
    marginTop: 6,
    fontSize: 12,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: COLORS.black || '#000',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: COLORS.white || '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  successContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E0FFE0',
    borderRadius: 6,
  },
  successText: {
    color: 'green',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
