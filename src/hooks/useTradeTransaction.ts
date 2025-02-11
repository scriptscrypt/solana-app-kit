// src/hooks/useTradeTransaction.ts
import {useSelector} from 'react-redux';
import {Alert} from 'react-native';
import {useEmbeddedSolanaWallet} from '@privy-io/expo';
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js';
import {sendPriorityTransaction} from '../utils/sendPriorityTx';
import {RootState} from '../state/store';

export function useTradeTransaction() {
  const solanaWallet = useEmbeddedSolanaWallet();
  const selectedFeeTier = useSelector(
    (state: RootState) => state.transaction.selectedFeeTier,
  );

  const sendTrade = async () => {
    // Retrieve the sender’s public key from the wallet's array
    const walletPublicKey =
      solanaWallet.wallets && solanaWallet.wallets.length > 0
        ? solanaWallet.wallets[0].publicKey
        : null;
    if (!solanaWallet || !walletPublicKey) {
      Alert.alert('Wallet Error', 'Wallet not connected');
      return;
    }
    try {
      const provider = solanaWallet.getProvider
        ? await solanaWallet.getProvider()
        : null;
      if (!provider) {
        Alert.alert('Provider Error', 'Provider not available');
        return;
      }
      const connection = new Connection(clusterApiUrl('devnet'));
      // Convert sender's wallet public key from string to PublicKey
      const senderPubkey = new PublicKey(walletPublicKey);
      // Set the receiver's public key (your specified receiver)
      const receiverPubkey = new PublicKey(
        '24MDwQXG2TWiST8ty1rjcrKgtaYaMiLdRxFQawYgZh4v',
      );

      // Check if the receiver account exists; if not, request an airdrop (for testing on devnet)
      const receiverInfo = await connection.getAccountInfo(receiverPubkey);
      if (!receiverInfo) {
        console.log(
          'Receiver account does not exist; requesting airdrop to receiver for testing...',
        );
        const airdropReceiverSig = await connection.requestAirdrop(
          receiverPubkey,
          1e9,
        ); // 1 SOL
        await connection.confirmTransaction(airdropReceiverSig);
      }

      // Create a transfer instruction: transfer 1 lamport from sender to receiver
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: receiverPubkey,
        lamports: 500000000,
      });

      const txSignature = await sendPriorityTransaction(
        provider,
        selectedFeeTier,
        [transferInstruction],
        connection,
        senderPubkey,
      );
      Alert.alert('Transaction Sent', `Signature: ${txSignature}`);
      console.log('Transaction sent successfully', txSignature);
    } catch (error: any) {
      Alert.alert('Transaction Error', error.message);
    }
  };

  return {sendTrade};
}
