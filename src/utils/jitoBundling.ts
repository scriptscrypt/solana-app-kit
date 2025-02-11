import { VersionedTransaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

export interface JitoBundleResponse {
  jsonrpc: string;
  result: string;
  id: number;
}

// Use the mainnet bundling endpoint. (Note: the variable name is updated to reflect mainnet.)
const JITO_MAINNET_URL = 'https://mainnet.block-engine.jito.wtf/api/v1/bundles';

export async function sendJitoBundle(
  transactions: VersionedTransaction[],
): Promise<JitoBundleResponse> {
  console.log('[sendJitoBundle] Preparing to send bundle.');

  // Convert transactions to base64 strings.
  const base64Txns = transactions.map((tx, index) => {
    const serializedTx = tx.serialize();
    const base64Tx = Buffer.from(serializedTx).toString('base64');
    console.log(`[sendJitoBundle] Serialized transaction ${index + 1}: ${base64Tx}`);
    return base64Tx;
  });

  // Prepare the bundle request.
  const bundleRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'sendBundle',
    params: [base64Txns, { encoding: 'base64' }],
  };

  console.log('[sendJitoBundle] Bundle request:', JSON.stringify(bundleRequest, null, 2));

  // Send the bundle to Jito's block engine.
  const response = await fetch(JITO_MAINNET_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bundleRequest),
  });

  console.log('[sendJitoBundle] Received response with status:', response.status);

  const responseBody = await response.json();
  console.log('[sendJitoBundle] Response body:', JSON.stringify(responseBody, null, 2));

  return responseBody;
}
