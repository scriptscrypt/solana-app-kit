// services/walletProviders/dynamicWallet.ts

export async function handleDynamicConnect(
  onWalletConnected?: (info: {provider: 'dynamic'; address: string}) => void,
  setStatusMessage?: (msg: string) => void,
) {
  setStatusMessage?.('Provider "dynamic" not implemented yet.');
  // If you had a real flow, implement it here and call onWalletConnected
  // with the correct address or user info.
}
