// Export all wallet components
export { default as EmbeddedWalletAuth } from './components/wallet/EmbeddedWallet';
export { default as TurnkeyWalletAuth } from './components/turnkey/TurnkeyWallet';

// Export the authentication hooks
export { useAuth } from './hooks/useAuth';
export { useWallet } from './hooks/useWallet';
export { useTurnkeyWalletLogic } from './hooks/useTurnkeyWalletLogic';

// Export wallet service functions
export { getDynamicClient, initDynamicClient } from './services/walletProviders/dynamic';
