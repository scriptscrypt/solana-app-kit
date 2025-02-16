import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import {
  Blink,
  Miniblink,
  useAction,
  BlockchainIds,
  createSignMessageText,
  type ActionAdapter,
  type SignMessageData,
  ActionContext,
} from '@dialectlabs/blinks-react-native';

import {
  PublicKey,
  Connection,
  clusterApiUrl,
  VersionedTransaction,
  Transaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';

/**
 * 1) Create a Dialect adapter for Privy that:
 *    - Decodes the base64 from Blink into a Transaction or VersionedTransaction
 *    - Passes that TX object to Privy (which expects an actual Transaction, not base64)
 *    - Receives the signedTransaction back, broadcasts it, returns the signature to Blink
 */
function createPrivyWalletAdapter(): ActionAdapter {
  // Connect to Solana mainnet
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

  // Get the Privy embedded wallet
  const solanaWallet = useEmbeddedSolanaWallet();

  return {
    // -----------------------------------------------------------------------
    // connect(...) => Promise<publicKeyString>
    // -----------------------------------------------------------------------
    connect: async (context: ActionContext) => {
      console.debug('[BlinkAdapter] connect() called, context:', context);
      if (!solanaWallet?.wallets?.length) {
        throw new Error('No Privy Solana wallet found. Please log in first.');
      }
      const pubkeyStr = solanaWallet.wallets[0].publicKey;
      if (!pubkeyStr) {
        throw new Error('Missing public key in Privy Solana wallet.');
      }
      console.debug('[BlinkAdapter] connect() returning pubkey:', pubkeyStr);
      return pubkeyStr;
    },

    // -----------------------------------------------------------------------
    // signTransaction(tx: string, context) => Promise<{ signature: string } | { error: string }>
    //
    // Dialect gives us a base64 string. We must:
    //  - decode it -> Transaction or VersionedTransaction
    //  - pass that to Privy, which returns { signedTransaction }
    //  - broadcast & return the txid as { signature }
    // -----------------------------------------------------------------------
    signTransaction: async (txBase64: string, context: ActionContext) => {
      console.debug('[BlinkAdapter] signTransaction() called with txBase64:', txBase64);
      try {
        // 1) Ensure we have a provider from Privy
        if (!solanaWallet?.getProvider || !solanaWallet?.wallets?.length) {
          return { error: 'No Privy Solana wallet or provider found.' };
        }
        const provider = await solanaWallet.getProvider();
        if (!provider || typeof provider.request !== 'function') {
          return { error: 'Privy provider is missing or invalid.' };
        }

        // 2) Decode base64 into a transaction object
        const txBuffer = Buffer.from(txBase64, 'base64');
        let txObj: VersionedTransaction | Transaction;
        // Try versioned first
        try {
          txObj = VersionedTransaction.deserialize(txBuffer);
          console.debug('[BlinkAdapter] signTransaction -> Decoded as VersionedTransaction.');
        } catch (versionedError) {
          // fallback to legacy
          txObj = Transaction.from(txBuffer);
          console.debug('[BlinkAdapter] signTransaction -> Decoded as Legacy Transaction.');
        }

        // 3) Let Privy sign it by passing the actual transaction object
        //    The type signature says it expects { transaction: VersionedTransaction | Transaction }
        console.debug('[BlinkAdapter] signTransaction -> calling provider.request...');
        const signResp = await provider.request({
          method: 'signTransaction',
          params: {
            transaction: txObj, // << pass the actual object, not a string
          },
        });
        console.debug('[BlinkAdapter] signTransaction -> signResp:', signResp);

        // According to Privy’s expo docs, signResp = { signedTransaction: Transaction/VersionedTransaction }
        if (!signResp || !signResp.signedTransaction) {
          return { error: 'No signedTransaction returned by Privy.' };
        }
        // This is the fully signed Transaction/VersionedTransaction
        const { signedTransaction } = signResp;

        // 4) Broadcast the signed transaction
        console.debug('[BlinkAdapter] signTransaction -> sending raw transaction...');
        const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
        });
        console.debug('[BlinkAdapter] signTransaction -> txid:', txid);

        // (Optional) confirm if needed:
        // await connection.confirmTransaction(txid, 'confirmed');

        // 5) Return the txid to Blink as { signature }
        return { signature: txid };
      } catch (err: any) {
        console.error('[BlinkAdapter] signTransaction error:', err);
        return { error: err?.message ?? String(err) };
      }
    },

    // -----------------------------------------------------------------------
    // confirmTransaction(signature: string, context) => Promise<void>
    // If we've already broadcast, we can no-op or confirm again here.
    // -----------------------------------------------------------------------
    confirmTransaction: async (signature: string) => {
      console.debug('[BlinkAdapter] confirmTransaction() called with:', signature);
      // You could do `await connection.confirmTransaction(signature, 'confirmed')` here if desired
      return;
    },

    // -----------------------------------------------------------------------
    // signMessage(...) => Promise<{ signature: string } | { error: string }>
    // -----------------------------------------------------------------------
    signMessage: async (message: string | SignMessageData) => {
      console.debug('[BlinkAdapter] signMessage() called with:', message);
      try {
        if (!solanaWallet?.getProvider || !solanaWallet?.wallets?.length) {
          return { error: 'No Privy Solana wallet or provider found.' };
        }
        const provider = await solanaWallet.getProvider();
        if (!provider || typeof provider.request !== 'function') {
          return { error: 'Privy provider is missing or invalid.' };
        }

        // If Dialect passes a SignMessageData object, convert to a string
        const messageToSign =
          typeof message === 'string' ? message : createSignMessageText(message);

        const signResp = await provider.request({
          method: 'signMessage',
          params: {
            // If Privy on RN expects an actual Buffer or base64, adapt as needed:
            message: Buffer.from(messageToSign).toString('base64'),
          },
        });
        console.debug('[BlinkAdapter] signMessage -> signResp:', signResp);

        if (!signResp || !signResp.signature) {
          return { error: 'No signature returned by Privy signMessage.' };
        }
        // signResp.signature is base64
        return { signature: signResp.signature };
      } catch (err: any) {
        console.error('[BlinkAdapter] signMessage error:', err);
        return { error: err?.message ?? String(err) };
      }
    },

    // -----------------------------------------------------------------------
    // Which chain(s) are supported
    // -----------------------------------------------------------------------
    metadata: {
      supportedBlockchainIds: [BlockchainIds.SOLANA_MAINNET],
    },
  };
}

/**
 * 2) BlinkExample - the actual React component that uses our adapter
 */
export const BlinkExample: React.FC<{ url: string }> = ({ url }) => {
  console.debug('[BlinkExample] rendering, url=', url);

  const adapter = createPrivyWalletAdapter();
  const { action, isLoading, refresh } = useAction({ url });

  if (isLoading) {
    console.debug('[BlinkExample] isLoading = true, returning ActivityIndicator');
    return <ActivityIndicator />;
  }
  if (!action) {
    console.error('[BlinkExample] No action found from URL:', url);
    return <Text>Could not load action from {url}</Text>;
  }

  console.debug('[BlinkExample] action loaded, rendering Blink for url=', url);

  // For display in the Blink, parse out domain from the URL
  const website = new URL(url);

  return (
    <Blink
      theme={{
        '--blink-button': '#1D9BF0',
        '--blink-border-radius-rounded-button': 9999,
        '--blink-spacing-input-height': 44,
      }}
      action={action}
      adapter={adapter}
      websiteUrl={website.href}
      websiteText={website.hostname}
    />
  );
};

/**
 * 3) MiniblinkExample - optional "mini" version
 */
export const MiniblinkExample: React.FC<{ url: string }> = ({ url }) => {
  console.debug('[MiniblinkExample] rendering, url=', url);

  const adapter = createPrivyWalletAdapter();
  const { action, isLoading } = useAction({ url });

  if (isLoading) {
    console.debug('[MiniblinkExample] isLoading = true, returning ActivityIndicator');
    return <ActivityIndicator />;
  }
  if (!action) {
    console.error('[MiniblinkExample] No action found from URL:', url);
    return <Text>Could not load action from {url}</Text>;
  }

  console.debug('[MiniblinkExample] action loaded, rendering Miniblink for url=', url);

  return (
    <Miniblink
      action={action}
      adapter={adapter}
      selector={(currentAction) =>
        currentAction.actions.find((a) => a.label === 'Donate')!
      }
    />
  );
};
