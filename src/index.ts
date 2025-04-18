// File: src/index.ts

export * from './config';
export {CustomizationProvider, useCustomization} from './config/CustomizationProvider';

// Export Redux store slices (optional: or let users combine them themselves)
export {store} from './shared/state/store';
export type {RootState, AppDispatch} from './shared/state/store';

// Export Hooks
export {useAuth} from './modules/walletProviders/hooks/useAuth';
export {useAppSelector, useAppDispatch} from './shared/hooks/useReduxHooks';

// Export Services or Providers

// Export Components
export * from './core/thread/components';
export * from './core/sharedUI/TradeCard';

// Export transaction utilities (if needed)
export {sendPriorityTransaction} from './shared/utils/transactions/sendPriorityTx';
export {sendJitoBundleTransaction} from './shared/utils/transactions/sendJitoBundleTx';

// Export modules
export * from './modules/tokenMill';
export * from './modules/pumpFun';