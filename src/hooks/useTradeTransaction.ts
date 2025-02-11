import { useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { sendPriorityTransaction } from '../utils/sendPriorityTx';
import { sendJitoBundleTransaction } from '../utils/sendJitoBundleTx';
import { RootState } from '../state/store';

export function useTradeTransaction() {
  const solanaWallet = useEmbeddedSolanaWallet();
  const selectedFeeTier = useSelector((state: RootState) => state.transaction.selectedFeeTier);

  const sendTrade = async (mode: 'priority' | 'jito') => {
    const walletPublicKey =
      solanaWallet.wallets && solanaWallet.wallets.length > 0
        ? solanaWallet.wallets[0].publicKey
        : null;
    if (!solanaWallet || !walletPublicKey) {
      Alert.alert('Wallet Error', 'Wallet not connected');
      return;
    }

    try {
      const provider = solanaWallet.getProvider ? await solanaWallet.getProvider() : null;
      if (!provider || typeof provider.request !== 'function') {
        Alert.alert('Provider Error', 'Provider does not support signing transactions.');
        return;
      }
      // Use mainnet-beta connection since you are sending mainnet transactions.
      const connection = new Connection(clusterApiUrl('mainnet-beta'));
      const senderPubkey = new PublicKey(walletPublicKey);
      const receiverPubkey = new PublicKey('5GZJmjy3LmRXwYyNrKUB6mdijqjWM5cszSAwmND6BUV6');

      // Check receiver account (if it doesn’t exist, abort)
      const receiverInfo = await connection.getAccountInfo(receiverPubkey);
      if (!receiverInfo) {
        console.log('[Trade] Receiver account does not exist, cannot proceed.');
        Alert.alert('Receiver Error', 'Receiver account does not exist.');
        return;
      }

      let txSignature: string;
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: receiverPubkey,
        lamports: 10000000, // adjust the lamports as needed (here 0.01 SOL)
      });
      const instructions: TransactionInstruction[] = [transferInstruction];

      if (mode === 'priority') {
        txSignature = await sendPriorityTransaction(
          provider,
          selectedFeeTier,
          instructions,
          connection,
          senderPubkey,
        );
      } else if (mode === 'jito') {
        txSignature = await sendJitoBundleTransaction(
          provider,
          selectedFeeTier,
          instructions,
          senderPubkey,
        );
      } else {
        throw new Error('Invalid mode');
      }
      
      Alert.alert('Transaction Sent', `Signature: ${txSignature}`);
      console.log('[Trade] Transaction sent successfully', txSignature);
    } catch (error: any) {
      Alert.alert('Transaction Error', error.message);
    }
  };
  return { sendTrade };
}
