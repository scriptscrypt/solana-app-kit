import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import {
  Transaction,
  Connection,
  PublicKey,
  clusterApiUrl,
  VersionedTransaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const SERVER_URL = 'http://localhost:3000'; // update if needed

export default function TokenMillScreen() {
  const { solanaWallet } = useAuth();

  if (!solanaWallet || !solanaWallet.wallets || solanaWallet.wallets.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
  const [loading, setLoading] = useState(false);

  // Handler for creating a market
  const handleCreateMarket = async () => {
    try {
      setLoading(true);
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

      // Convert base64 to buffer, parse as a Legacy Transaction
      const txBuffer = Buffer.from(json.transaction, 'base64');
      const tx = Transaction.from(txBuffer);
      console.log('[handleCreateMarket] Deserialized Transaction:', tx);

      // Get the wallet provider
      const provider = solanaWallet.getProvider && (await solanaWallet.getProvider());
      if (!provider || typeof provider.request !== 'function') {
        throw new Error('Wallet provider does not support the request method');
      }

      // Serialize the transaction message for signing
      const serializedMessage = tx.serializeMessage();
      const base64Message = Buffer.from(serializedMessage).toString('base64');
      console.log('[handleCreateMarket] Serialized transaction message (base64):', base64Message);

      // Ask the wallet to sign the message
      const signResult = await provider.request({
        method: 'signMessage',
        params: { message: base64Message },
      });
      console.log('[handleCreateMarket] Wallet signature result:', signResult);
      if (!signResult || !signResult.signature) {
        throw new Error('No signature returned from wallet');
      }

      // Insert the wallet's signature into the Transaction object
      tx.addSignature(
        new PublicKey(publicKey),
        Buffer.from(signResult.signature, 'base64')
      );
      console.log('[handleCreateMarket] Signature added to transaction');

      // Send the fully signed transaction
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
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async (amount: number) => {
    try {
      setLoading(true);
      console.log('[handleStake] Initiating stake...');
      
      // 1) Ask server to build a legacy transaction message
      const body = {
        marketAddress,
        amount,
        userPublicKey: publicKey,
      };
      const response = await fetch(`${SERVER_URL}/api/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      console.log('[handleStake] Server response:', json);
      if (!json.success) {
        throw new Error(json.error || 'Stake failed');
      }
  
      // 2) Deserialize the base64-encoded, legacy transaction
      const txBuffer = Buffer.from(json.data, 'base64');
      const tx = Transaction.from(txBuffer);
      console.log('[handleStake] Deserialized stake transaction:', tx);
  
      // 3) Ask the wallet to sign the transaction message
      const provider = solanaWallet.getProvider && (await solanaWallet.getProvider());
      if (!provider || typeof provider.request !== 'function') {
        throw new Error('Wallet provider does not support the request method');
      }
      const serializedMessage = tx.serializeMessage();
      const base64Message = Buffer.from(serializedMessage).toString('base64');
      console.log('[handleStake] Stake message (base64) for signing:', base64Message);
  
      const signResult = await provider.request({
        method: 'signMessage',
        params: { message: base64Message },
      });
      console.log('[handleStake] Wallet signature result:', signResult);
      if (!signResult || !signResult.signature) {
        throw new Error('No signature returned from wallet');
      }
  
      // 4) Insert the signature into the Transaction
      tx.addSignature(
        new PublicKey(publicKey),
        Buffer.from(signResult.signature, 'base64')
      );
      console.log('[handleStake] Signature added to transaction');
  
      // 5) Serialize and send
      const signedTx = tx.serialize();
      console.log('[handleStake] Sending stake transaction...');
      const txSignature = await connection.sendRawTransaction(signedTx);
      console.log('[handleStake] Stake transaction sent, signature:', txSignature);
  
      await connection.confirmTransaction(txSignature);
      console.log('[handleStake] Stake transaction confirmed');
      Alert.alert('Staked Successfully', `Tx: ${txSignature}`);
    } catch (error: any) {
      console.error('[handleStake] Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCreateVesting = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseVesting = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>TokenMill</Text>
        <Text style={styles.subHeader}>Your Pubkey: {publicKey}</Text>
        {loading && <ActivityIndicator size="large" color="#2a2a2a" style={styles.loader} />}

        {/* Existing Market Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Existing Market (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Market Address"
            value={marketAddress}
            onChangeText={setMarketAddress}
          />
        </View>

        {/* Create Market Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Market (Token)</Text>
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
          {marketAddress ? (
            <Text style={styles.result}>Market Address: {marketAddress}</Text>
          ) : null}
        </View>

        {/* Stake Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stake in the Market</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleStake(50000)}>
            <Text style={styles.buttonText}>Stake 50,000 tokens</Text>
          </TouchableOpacity>
        </View>

        {/* Vesting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vesting</Text>
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
        </View>

        {/* Swap Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Swap</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.swapBtn, swapType === 'buy' && styles.swapBtnActive]}
              onPress={() => setSwapType('buy')}
            >
              <Text style={[styles.swapBtnText, swapType === 'buy' && styles.swapBtnTextActive]}>
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.swapBtn, swapType === 'sell' && styles.swapBtnActive]}
              onPress={() => setSwapType('sell')}
            >
              <Text style={[styles.swapBtnText, swapType === 'sell' && styles.swapBtnTextActive]}>
                Sell
              </Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#2a2a2a',
  },
  subHeader: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  section: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2a2a2a',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#2a2a2a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  swapBtn: {
    flex: 1,
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  swapBtnActive: {
    backgroundColor: '#2a2a2a',
  },
  swapBtnText: {
    color: '#2a2a2a',
    fontWeight: '600',
  },
  swapBtnTextActive: {
    color: '#fff',
  },
  result: {
    marginTop: 8,
    fontSize: 14,
    color: '#2a2a2a',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
