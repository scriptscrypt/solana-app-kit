import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth'; // your Privy auth hook
import {
  Transaction,
  Connection,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const SERVER_URL = 'http://localhost:3000'; // update if needed

export default function TokenMillScreen() {
  const { solanaWallet } = useAuth();

  if (!solanaWallet || !solanaWallet.wallets || solanaWallet.wallets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Wallet not connected</Text>
      </SafeAreaView>
    );
  }

  const publicKey = solanaWallet.wallets[0].publicKey;
  const connection = new Connection(clusterApiUrl('devnet'));

  // Form states
  const [tokenName, setTokenName] = useState('MyToken');
  const [tokenSymbol, setTokenSymbol] = useState('MTK');
  const [metadataUri, setMetadataUri] = useState('https://arweave.net/abc123');
  const [totalSupply, setTotalSupply] = useState('1000000');
  const [creatorFee, setCreatorFee] = useState('3300');
  const [stakingFee, setStakingFee] = useState('6200');
  const [marketAddress, setMarketAddress] = useState('');
  const [baseTokenMint, setBaseTokenMint] = useState('');
  const [vestingAmount, setVestingAmount] = useState('200000');
  const [vestingPlanAddress, setVestingPlanAddress] = useState('');
  const [swapType, setSwapType] = useState<'buy' | 'sell'>('buy');
  const [swapAmount, setSwapAmount] = useState('1000000');

  // Handler for creating a market
  const handleCreateMarket = async () => {
    try {
      console.log('[handleCreateMarket] Initiating...');
      const body = {
        name: tokenName,
        symbol: tokenSymbol,
        uri: metadataUri,
        totalSupply: parseInt(totalSupply, 10),
        creatorFeeShare: parseInt(creatorFee, 10),
        stakingFeeShare: parseInt(stakingFee, 10),
        userPublicKey: publicKey,
      };

      const response = await fetch(`${SERVER_URL}/api/markets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      console.log('[handleCreateMarket] Server response:', json);

      if (!json.success) {
        throw new Error(json.error || 'Market creation failed');
      }

      // 1) Convert base64 to buffer, parse as a Legacy Transaction
      const txBuffer = Buffer.from(json.transaction, 'base64');
      const tx = Transaction.from(txBuffer);
      console.log('[handleCreateMarket] Deserialized Transaction:', tx);

      // 2) Get the wallet provider
      const provider = solanaWallet.getProvider && (await solanaWallet.getProvider());
      if (!provider || typeof provider.request !== 'function') {
        throw new Error('Wallet provider does not support the request method');
      }

      // 3) Serialize just the transaction *message* for signing
      const serializedMessage = tx.serializeMessage();
      const base64Message = Buffer.from(serializedMessage).toString('base64');
      console.log('[handleCreateMarket] Serialized transaction message (base64):', base64Message);

      // 4) Ask the wallet to sign the message
      const signResult = await provider.request({
        method: 'signMessage',
        params: { message: base64Message },
      });
      console.log('[handleCreateMarket] Wallet signature result:', signResult);
      if (!signResult || !signResult.signature) {
        throw new Error('No signature returned from wallet');
      }

      // 5) Insert that signature into the Transaction object
      tx.addSignature(
        new PublicKey(publicKey),
        Buffer.from(signResult.signature, 'base64')
      );
      console.log('[handleCreateMarket] Signature added to transaction');

      // 6) Send the fully signed transaction
      const signedTx = tx.serialize();
      console.log('[handleCreateMarket] Sending signed transaction...');
      const txSignature = await connection.sendRawTransaction(signedTx);
      console.log('[handleCreateMarket] Transaction sent, signature:', txSignature);

      await connection.confirmTransaction(txSignature);
      console.log('[handleCreateMarket] Transaction confirmed');

      Alert.alert(
        'Market Created',
        `Market: ${json.marketAddress}\nTx: ${txSignature}`
      );
      setMarketAddress(json.marketAddress);
      setBaseTokenMint(json.baseTokenMint);
    } catch (error: any) {
      console.error('[handleCreateMarket] Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleStake = async (amount: number) => {
    try {
      console.log('[handleStake] Staking', amount, 'tokens in market:', marketAddress);
      const response = await fetch(`${SERVER_URL}/api/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketAddress,
          amount,
          userPublicKey: publicKey,
        }),
      });
      const data = await response.json();
      console.log('[handleStake] Stake response:', data);
      if (!data.success) {
        throw new Error(data.error || 'Stake failed');
      }
      Alert.alert('Staked Successfully', `Tx: ${data.data.signature}`);
    } catch (error: any) {
      console.error('[handleStake] Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateVesting = async () => {
    try {
      console.log('[handleCreateVesting] Creating vesting plan for market:', marketAddress);
      const response = await fetch(`${SERVER_URL}/api/vesting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketAddress,
          recipient: publicKey,
          amount: parseInt(vestingAmount, 10),
          startTime: Math.floor(Date.now() / 1000),
          duration: 3600,
          cliffDuration: 1800,
          baseTokenMint,
        }),
      });
      const data = await response.json();
      console.log('[handleCreateVesting] Vesting response:', data);
      if (!data.success) throw new Error(data.error || 'Vesting failed');
      setVestingPlanAddress(data.data.vestingAccount);
      Alert.alert('Vesting Created', `Plan: ${data.data.vestingAccount}`);
    } catch (error: any) {
      console.error('[handleCreateVesting] Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleReleaseVesting = async () => {
    try {
      console.log('[handleReleaseVesting] Releasing vesting for market:', marketAddress);
      const endpoint = `${SERVER_URL}/api/vesting/${marketAddress}/claim`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vestingPlanAddress,
          baseTokenMint,
          userPublicKey: publicKey,
        }),
      });
      const data = await response.json();
      console.log('[handleReleaseVesting] Release vesting response:', data);
      if (!data.success) throw new Error(data.error || 'Release failed');
      Alert.alert('Vesting Released', data.data.signature || 'No signature');
    } catch (error: any) {
      console.error('[handleReleaseVesting] Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleSwap = async () => {
    try {
      console.log('[handleSwap] Initiating swap in market:', marketAddress);
      const response = await fetch(`${SERVER_URL}/api/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: marketAddress,
          quoteTokenMint: 'So11111111111111111111111111111111111111112',
          action: swapType,
          tradeType: 'exactInput',
          amount: parseInt(swapAmount, 10),
          otherAmountThreshold: 950000,
          userPublicKey: publicKey,
        }),
      });
      const data = await response.json();
      console.log('[handleSwap] Swap response:', data);
      if (!data.success) throw new Error(data.error || 'Swap failed');
      Alert.alert('Swap Success', data.signature || '');
    } catch (error: any) {
      console.error('[handleSwap] Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>TokenMill Screen</Text>
        <Text style={styles.helpText}>Your Pubkey: {publicKey}</Text>

        {/* 1) CREATE MARKET (TOKEN) */}
        <Text style={styles.sectionTitle}>1) Create Market (Token)</Text>
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
          style={styles.input}
          placeholder="Metadata URI"
          value={metadataUri}
          onChangeText={setMetadataUri}
        />
        <TextInput
          style={styles.input}
          placeholder="Total Supply"
          value={totalSupply}
          onChangeText={setTotalSupply}
        />
        <TextInput
          style={styles.input}
          placeholder="Creator Fee BPS"
          value={creatorFee}
          onChangeText={setCreatorFee}
        />
        <TextInput
          style={styles.input}
          placeholder="Staking Fee BPS"
          value={stakingFee}
          onChangeText={setStakingFee}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateMarket}>
          <Text style={styles.buttonText}>Create Market</Text>
        </TouchableOpacity>

        {/* 2) STAKE */}
        <Text style={styles.sectionTitle}>2) Stake in the Market</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleStake(50000)}>
          <Text style={styles.buttonText}>Stake 50,000 tokens</Text>
        </TouchableOpacity>

        {/* 3) VESTING */}
        <Text style={styles.sectionTitle}>3) Vesting</Text>
        <TextInput
          style={styles.input}
          placeholder="Vesting Amount"
          value={vestingAmount}
          onChangeText={setVestingAmount}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateVesting}>
          <Text style={styles.buttonText}>Create Vesting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReleaseVesting}>
          <Text style={styles.buttonText}>Release Vesting</Text>
        </TouchableOpacity>

        {/* 4) SWAP */}
        <Text style={styles.sectionTitle}>4) Swap</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.swapBtn, swapType === 'buy' && styles.swapBtnActive]}
            onPress={() => setSwapType('buy')}>
            <Text style={[styles.swapBtnText, swapType === 'buy' && styles.swapBtnTextActive]}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swapBtn, swapType === 'sell' && styles.swapBtnActive]}
            onPress={() => setSwapType('sell')}>
            <Text style={[styles.swapBtnText, swapType === 'sell' && styles.swapBtnTextActive]}>Sell</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Swap Amount"
          value={swapAmount}
          onChangeText={setSwapAmount}
        />
        <TouchableOpacity style={styles.button} onPress={handleSwap}>
          <Text style={styles.buttonText}>Swap</Text>
        </TouchableOpacity>

        <View style={{ height: 200 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  helpText: { fontSize: 12, color: '#555', marginBottom: 10 },
  input: {
    backgroundColor: '#f4f4f4',
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    marginVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff' },
  row: { flexDirection: 'row', marginVertical: 4 },
  swapBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
  },
  swapBtnActive: { backgroundColor: '#333' },
  swapBtnText: { color: '#000' },
  swapBtnTextActive: { color: '#fff' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20 },
});
