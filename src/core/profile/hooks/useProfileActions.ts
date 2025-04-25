/**
 * Custom hook for fetching and managing profile actions/transactions
 */
import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useReduxHooks';
import { fetchWalletActionsWithCache, pruneOldActionData } from '@/shared/state/profile/reducer';

/**
 * Hook that manages profile actions/transactions
 * @param walletAddress The wallet address to fetch actions for
 * @returns Object with actions data and loading state
 */
export function useProfileActions(walletAddress: string | undefined) {
  const dispatch = useAppDispatch();
  
  // Get actions data from Redux state
  const profileActions = useAppSelector(state => state.profile.actions);

  // Extract values with error handling
  const myActions = walletAddress 
    ? (profileActions.data[walletAddress] || [])
    : [];
    
  const loadingActions = !!walletAddress && !!profileActions.loading[walletAddress];
  const fetchActionsError = walletAddress 
    ? profileActions.error[walletAddress] 
    : null;

  // Fetch actions with caching
  const fetchActions = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      await dispatch(fetchWalletActionsWithCache({ walletAddress }));
      
      // Prune old action data after fetching new data
      // This helps keep the store optimized
      dispatch(pruneOldActionData());
    } catch (error) {
      console.error('Error fetching wallet actions:', error);
    }
  }, [walletAddress, dispatch]);

  // Load actions when the wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchActions();
    }
  }, [walletAddress, fetchActions]);

  return {
    actions: myActions,
    loadingActions,
    fetchActionsError,
    refreshActions: fetchActions,
  };
} 