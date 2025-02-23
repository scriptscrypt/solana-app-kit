// File: src/components/pumpfun/PumpportalLaunchButton.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useAuth} from '../../hooks/useAuth';
import {
  clusterApiUrl,
  PublicKey,
  Transaction,
  Connection,
  VersionedTransaction,
} from '@solana/web3.js';
import {Buffer} from 'buffer';

export const PumpportalLaunchButton = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mode, setMode] = useState<'jito' | 'local'>('jito'); // default to jito
  const [loading, setLoading] = useState(false);

  const {solanaWallet} = useAuth();
  const userPublicKey = solanaWallet?.wallets?.[0]?.publicKey || '';

  // 1) Let user pick an image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 2) Handler for final POST to your Node server
  const handleLaunch = async () => {
    if (!userPublicKey) {
      Alert.alert('Error', 'Please connect your wallet first.');
      return;
    }
    if (!tokenName || !tokenSymbol || !description || !imageUri) {
      Alert.alert('Error', 'Fill name, symbol, description, and image.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('publicKey', userPublicKey);
      formData.append('tokenName', tokenName);
      formData.append('tokenSymbol', tokenSymbol);
      formData.append('description', description);
      formData.append('twitter', twitter);
      formData.append('telegram', telegram);
      formData.append('website', website);
      formData.append('showName', 'true');
      formData.append('mode', mode);

      // Must match the multer field name: 'image'
      formData.append('image', {
        uri: imageUri,
        name: 'token.png',
        type: 'image/png',
      } as any);

      // POST to your /api/pumpportal/launch
      const response = await fetch(
        'http://localhost:3000/api/pumpportal/launch',
        {
          method: 'POST',
          body: formData,
        },
      );
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Status ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Launch failed, success=false');
      }
      console.log('Mint Address:', data.mintPublicKey);

      // data => { success, mintPublicKey, tradeResult }
      if (mode === 'jito') {
        // JITO typically returns { success: true, signature: "...", etc. }
        // (your server code can vary in shape)
        if (!data.tradeResult.signature) {
          Alert.alert('Created, but no signature returned from JITO flow');
          return;
        }
        Alert.alert(
          'Success',
          `Token minted via JITO!\nSignature: ${data.tradeResult.signature}\nCheck: https://solscan.io/tx/${data.tradeResult.signature}`,
        );
      } else {
        // mode = 'local' => We get { transaction: base64Tx }
        const base64Tx = data.tradeResult.transaction;
        if (!solanaWallet || !solanaWallet.getProvider) {
          throw new Error('No wallet provider for local signing.');
        }
        const provider = await solanaWallet.getProvider();

        // Convert base64 → bytes
        const rawBytes = Buffer.from(base64Tx, 'base64');
        let versionedTx: VersionedTransaction | null = null;
        let legacyTx: Transaction | null = null;

        // Attempt to parse as versioned
        try {
          versionedTx = VersionedTransaction.deserialize(rawBytes);
        } catch {
          // fallback: parse as legacy
          legacyTx = Transaction.from(rawBytes);
        }

        // Helper for message-signing with Privy or Dynamic
        const signTransactionMessage = async (messageBytes: Buffer) => {
          const base64Msg = messageBytes.toString('base64');
          const signResult = await provider.request({
            method: 'signMessage',
            params: {message: base64Msg},
          });
          if (!signResult || !signResult.signature) {
            throw new Error('No signature returned from provider');
          }
          return Buffer.from(signResult.signature, 'base64');
        };

        // Connect to mainnet
        const connection = new Connection(
          clusterApiUrl('mainnet-beta'),
          'confirmed',
        );

        if (versionedTx) {
          // ------------------
          //  Versioned
          // ------------------
          const messageBytes = versionedTx.message.serialize(); // just the message
          const userSignature = await signTransactionMessage(
            Buffer.from(messageBytes),
          );
          versionedTx.addSignature(new PublicKey(userPublicKey), userSignature);

          // Broadcast
          const txid = await connection.sendRawTransaction(
            versionedTx.serialize(),
          );
          await connection.confirmTransaction(txid, 'confirmed');

          Alert.alert(
            'Success',
            `Local versioned minted!\nTxid: ${txid}\nhttps://solscan.io/tx/${txid}`,
          );
        } else if (legacyTx) {
          // ------------------
          // Legacy
          // ------------------
          const messageBytes = legacyTx.serializeMessage();
          const userSignature = await signTransactionMessage(messageBytes);

          legacyTx.addSignature(new PublicKey(userPublicKey), userSignature);
          if (!legacyTx.verifySignatures()) {
            throw new Error('Legacy signature verification failed');
          }

          const txid = await connection.sendRawTransaction(
            legacyTx.serialize(),
          );
          await connection.confirmTransaction(txid, 'confirmed');

          Alert.alert(
            'Success',
            `Local legacy minted!\nTxid: ${txid}\nhttps://solscan.io/tx/${txid}`,
          );
        } else {
          throw new Error(
            'Unable to parse transaction: neither versioned nor legacy format',
          );
        }
      }
    } catch (error: any) {
      console.error('Launch error:', error);
      Alert.alert('Launch Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pumpportal Token Launch</Text>

      <TextInput
        style={styles.input}
        placeholder="Token Name"
        value={tokenName}
        onChangeText={setTokenName}
      />

      <TextInput
        style={styles.input}
        placeholder="Token Symbol"
        value={tokenSymbol}
        onChangeText={setTokenSymbol}
      />

      <TextInput
        style={[styles.input, {height: 60}]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Twitter (optional)"
        value={twitter}
        onChangeText={setTwitter}
      />

      <TextInput
        style={styles.input}
        placeholder="Telegram (optional)"
        value={telegram}
        onChangeText={setTelegram}
      />

      <TextInput
        style={styles.input}
        placeholder="Website (optional)"
        value={website}
        onChangeText={setWebsite}
      />

      {/* Mode Selector */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'jito' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('jito')}>
          <Text style={styles.modeButtonText}>Jito</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'local' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('local')}>
          <Text style={styles.modeButtonText}>Local</Text>
        </TouchableOpacity>
      </View>

      {/* Image Picker */}
      <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>
          {imageUri ? 'Change Image' : 'Pick Image'}
        </Text>
      </TouchableOpacity>
      {imageUri && (
        <Image source={{uri: imageUri}} style={styles.imagePreview} />
      )}

      {/* Launch Button */}
      <TouchableOpacity
        onPress={handleLaunch}
        style={styles.launchButton}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.launchButtonText}>Launch Token</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PumpportalLaunchButton;

const styles = StyleSheet.create({
  container: {padding: 16},
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  modeButton: {
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    backgroundColor: '#888',
  },
  modeButtonActive: {
    backgroundColor: '#333',
  },
  modeButtonText: {
    color: '#fff',
  },
  imageButton: {
    backgroundColor: 'dodgerblue',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
  },
  imageButtonText: {color: '#fff'},
  imagePreview: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginVertical: 10,
  },
  launchButton: {
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  launchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
