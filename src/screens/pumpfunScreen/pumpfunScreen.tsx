import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {usePumpfun} from '../../hooks/usePumpFun';
// ^ or import {useAppDispatch, useAppSelector} directly if you didn't create the hook
import {styles} from './pumpfunScreen.style';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function PumpfunScreen() {
  const {pumpfunState, launchToken, buyToken, sellToken, resetPumpfunState} =
    usePumpfun();

  const [privateKey, setPrivateKey] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenTicker, setTokenTicker] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buyerPubkey, setBuyerPubkey] = useState('');
  const [sellerPubkey, setSellerPubkey] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [launchTwitter, setLaunchTwitter] = useState('');
  const [launchTelegram, setLaunchTelegram] = useState('');
  const [launchWebsite, setLaunchWebsite] = useState('');

  // For buying/selling amounts
  const [solAmount, setSolAmount] = useState('0.1'); // default 0.1
  const [sellTokenAmount, setSellTokenAmount] = useState('100'); // default 100 tokens

  // Show results or errors
  useEffect(() => {
    if (pumpfunState.status === 'failed' && pumpfunState.error) {
      Alert.alert('Pumpfun Error', pumpfunState.error);
    }
    if (
      pumpfunState.status === 'succeeded' &&
      pumpfunState.transactionSignature
    ) {
      Alert.alert(
        'Pumpfun Success',
        `Signature: ${pumpfunState.transactionSignature}\nMinted Address: ${
          pumpfunState.mintedTokenAddress || ''
        }`,
      );
    }
  }, [pumpfunState]);

  const onLaunchPress = () => {
    if (!privateKey || !tokenName || !tokenTicker || !imageUrl) {
      Alert.alert(
        'Missing fields',
        'Please provide privateKey, name, ticker, imageUrl',
      );
      return;
    }
    launchToken({
      privateKey,
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      twitter: launchTwitter,
      telegram: launchTelegram,
      website: launchWebsite,
    });
  };

  const onBuyPress = () => {
    if (!buyerPubkey || !tokenAddress || !solAmount) {
      Alert.alert(
        'Missing fields',
        'Please provide buyerPubkey, tokenAddress, and solAmount',
      );
      return;
    }
    buyToken({
      buyerPublicKey: buyerPubkey,
      tokenAddress,
      solAmount: parseFloat(solAmount),
    });
  };

  const onSellPress = () => {
    if (!sellerPubkey || !tokenAddress || !sellTokenAmount) {
      Alert.alert(
        'Missing fields',
        'Please provide sellerPubkey, tokenAddress, and token amount to sell',
      );
      return;
    }
    sellToken({
      sellerPublicKey: sellerPubkey,
      tokenAddress,
      tokenAmount: parseFloat(sellTokenAmount),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding: 16}}>
        <Text style={styles.headerTitle}>Pumpfun Integration Demo</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Launch Token</Text>
          <TextInput
            style={styles.input}
            placeholder="Private Key (base58)"
            value={privateKey}
            onChangeText={setPrivateKey}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Token Name (e.g. MyCoin)"
            value={tokenName}
            onChangeText={setTokenName}
          />
          <TextInput
            style={styles.input}
            placeholder="Token Ticker (e.g. MYC)"
            value={tokenTicker}
            onChangeText={setTokenTicker}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Image URL (e.g. https://...)"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
          <TextInput
            style={styles.input}
            placeholder="Twitter handle or link (optional)"
            value={launchTwitter}
            onChangeText={setLaunchTwitter}
          />
          <TextInput
            style={styles.input}
            placeholder="Telegram link (optional)"
            value={launchTelegram}
            onChangeText={setLaunchTelegram}
          />
          <TextInput
            style={styles.input}
            placeholder="Website (optional)"
            value={launchWebsite}
            onChangeText={setLaunchWebsite}
          />
          <TouchableOpacity style={styles.button} onPress={onLaunchPress}>
            <Text style={styles.buttonText}>Launch Token</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy</Text>
          <TextInput
            style={styles.input}
            placeholder="Buyer Public Key"
            value={buyerPubkey}
            onChangeText={setBuyerPubkey}
          />
          <TextInput
            style={styles.input}
            placeholder="Token Address"
            value={tokenAddress}
            onChangeText={setTokenAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="SOL Amount"
            value={solAmount}
            onChangeText={setSolAmount}
          />
          <TouchableOpacity style={styles.button} onPress={onBuyPress}>
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sell</Text>
          <TextInput
            style={styles.input}
            placeholder="Seller Public Key"
            value={sellerPubkey}
            onChangeText={setSellerPubkey}
          />
          <TextInput
            style={styles.input}
            placeholder="Token Address"
            value={tokenAddress}
            onChangeText={setTokenAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Token Amount (e.g. 100.0)"
            value={sellTokenAmount}
            onChangeText={setSellTokenAmount}
          />
          <TouchableOpacity style={styles.button} onPress={onSellPress}>
            <Text style={styles.buttonText}>Sell</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#999'}]}
            onPress={resetPumpfunState}>
            <Text style={styles.buttonText}>Reset State</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
