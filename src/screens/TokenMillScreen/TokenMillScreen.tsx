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

  // console.log(baseTokenMint, "baseTokenMint");

  // --------------------------------------------------
  // Helper: sign and send a base64-encoded Legacy Transaction
  // --------------------------------------------------
  const signAndSendLegacyTx = async (base64Tx: string) => {
    // 1) Deserialize
    const txBuffer = Buffer.from(base64Tx, 'base64');
    const legacyTx = Transaction.from(txBuffer);
    // 2) Ask wallet to sign the message
    const provider = solanaWallet.getProvider && (await solanaWallet.getProvider());
    if (!provider || typeof provider.request !== 'function') {
      throw new Error('Wallet provider does not support the request method');
    }
    const serializedMessage = legacyTx.serializeMessage();
    const base64Message = Buffer.from(serializedMessage).toString('base64');

    const signResult = await provider.request({
      method: 'signMessage',
      params: { message: base64Message },
    });
    if (!signResult || !signResult.signature) {
      throw new Error('No signature returned from wallet');
    }

    // 3) Insert signature
    legacyTx.addSignature(
      new PublicKey(publicKey),
      Buffer.from(signResult.signature, 'base64')
    );

    // 4) Send raw
    const signedTx = legacyTx.serialize();
    const txSignature = await connection.sendRawTransaction(signedTx);
    await connection.confirmTransaction(txSignature);
    return txSignature;
  };

  // --------------------------------------------------
  // Create Market Handler
  // --------------------------------------------------
  const handleCreateMarket = async () => {
    try {
      setLoading(true);

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

      if (!json.success) {
        throw new Error(json.error || 'Market creation failed');
      }

      // The server returns { success, transaction (base64), marketAddress, baseTokenMint }
      // 1) sign & send
      const txSig = await signAndSendLegacyTx(json.transaction);
      Alert.alert('Market Created', `Market: ${json.marketAddress}\nTx: ${txSig}`);
      // 2) store addresses
      setMarketAddress(json.marketAddress);
      setBaseTokenMint(json.baseTokenMint);
    } catch (error: any) {
      console.error('[handleCreateMarket] Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Stake Handler
  // --------------------------------------------------
  const handleStake = async (amount: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/api/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketAddress,
          amount,
          userPublicKey: publicKey,
        }),
      });
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Stake failed');
      }
      // sign & send
      const txSig = await signAndSendLegacyTx(json.data);
      Alert.alert('Staked Successfully', `Tx: ${txSig}`);
    } catch (error: any) {
      console.error('[handleStake] Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Create Vesting Handler
  // --------------------------------------------------
  const handleCreateVesting = async () => {
    try {
      setLoading(true);

      const resp = await fetch(`${SERVER_URL}/api/vesting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketAddress,
          recipient: publicKey,
          amount: parseInt(vestingAmount, 10),
          startTime: Math.floor(Date.now() / 1000),
          duration: 3600,        // 1 hour
          cliffDuration: 1800,   // 30 minutes
          baseTokenMint,
          userPublicKey: publicKey, // your wallet
        }),
      });

      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || 'Vesting creation failed');
      }
      // data.data => { transaction, ephemeralVestingPubkey }
      const txSig = await signAndSendLegacyTx(data.data.transaction);
      Alert.alert(
        'Vesting Created',
        `VestingPlan: ${data.data.ephemeralVestingPubkey}\nTx: ${txSig}`
      );
    } catch (err: any) {
      console.error('[handleCreateVesting] Error:', err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Release Vesting Handler
  // --------------------------------------------------
  const handleReleaseVesting = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/api/vesting/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketAddress,
          vestingPlanAddress,
          baseTokenMint,
          userPublicKey: publicKey,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Release vesting failed');
      }
      // data.data => base64 transaction
      const txSig = await signAndSendLegacyTx(data.data);
      Alert.alert('Vesting Released', `Tx: ${txSig}`);
    } catch (error: any) {
      console.error('[handleReleaseVesting] Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Swap Handler
  // --------------------------------------------------
  const handleSwap = async () => {
    try {
      setLoading(true);
  
      const response = await fetch(`${SERVER_URL}/api/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: marketAddress,
          quoteTokenMint: 'So11111111111111111111111111111111111111112', // wSOL
          action: swapType,             // 'buy' | 'sell'
          tradeType: 'exactInput',      // or 'exactOutput'
          amount: parseInt(swapAmount, 10),
          otherAmountThreshold: 1, // or any fallback
          userPublicKey: publicKey,     // let the server know the user’s key
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Swap failed');
      }
  
      // data.transaction is the base64-encoded transaction
      const txSig = await signAndSendLegacyTx(data.transaction);
  
      // All done
      Alert.alert('Swap Success', `Signature: ${txSig}`);
    } catch (error: any) {
      console.error('[handleSwap] Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Render UI
  // --------------------------------------------------
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Existing Base Token Mint (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Base Token Mint"
            value={baseTokenMint}
            onChangeText={setBaseTokenMint}
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

// ---------------------- STYLES -------------------------
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
