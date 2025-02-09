// services/walletProviders/turnkeyWallet.ts

import {
  createPasskey,
  PasskeyStamper,
} from '@turnkey/react-native-passkey-stamper';
import {TurnkeyClient} from '@turnkey/http';

export async function handleTurnkeyConnect(
  onWalletConnected?: (info: {provider: 'turnkey'; address: string}) => void,
  setStatusMessage?: (msg: string) => void,
) {
  setStatusMessage?.('Connecting with Turnkey...');
  try {
    // This is the exact code from your EmbeddedWallet, just moved here.
    // (Hardcoded for demo, with environment-based domain/name.)
    const authenticatorParams = await createPasskey({
      authenticatorName: 'End-User Passkey',
      rp: {
        id: process.env.TURNKEY_RP_ID || '',
        name: process.env.TURNKEY_RP_NAME || '',
      },
      user: {
        id: String(Date.now()), // Unique user ID for demo
        name: 'Demo User',
        displayName: 'Demo User',
      },
    });
    console.log('Turnkey authenticator parameters:', authenticatorParams);

    const stamper = new PasskeyStamper({
      rpId: process.env.TURNKEY_RP_ID || '',
    });
    const turnkeyClient = new TurnkeyClient(
      {baseUrl: process.env.TURNKEY_BASE_URL || ''},
      stamper,
    );

    // For demo, consider it successful once passkey is created
    setStatusMessage?.('Turnkey login flow initiated successfully.');

    // If your backend returns a real address, you'd put that here. For demo, just use Date.now().
    onWalletConnected?.({
      provider: 'turnkey',
      address: String(Date.now()),
    });
  } catch (error: any) {
    console.error('Turnkey login error:', error);
    setStatusMessage?.(`Turnkey login failed: ${error.message}`);
    throw error;
  }
}
