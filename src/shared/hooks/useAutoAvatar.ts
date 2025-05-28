/**
 * useAutoAvatar Hook
 * 
 * Automatically manages DiceBear avatars for users who don't have profile images.
 * This hook handles the generation, caching, and updating of avatars seamlessly.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useReduxHooks';
import { updateProfilePic } from '../state/auth/reducer';
import { 
  getAvatarUrl, 
  generateAndStoreAvatar, 
  clearCachedAvatar,
  preloadAvatar 
} from '../services/diceBearAvatarService';

interface UseAutoAvatarOptions {
  /** Whether to automatically generate avatar for current user if they don't have one */
  autoGenerate?: boolean;
  /** Whether to preload the avatar for better UX */
  preload?: boolean;
  /** Whether to update Redux state when avatar is generated */
  updateRedux?: boolean;
}

interface UseAutoAvatarReturn {
  /** The avatar URL to use (either existing profile pic or generated DiceBear avatar) */
  avatarUrl: string | null;
  /** Whether the avatar is currently being generated/loaded */
  isLoading: boolean;
  /** Any error that occurred during avatar generation */
  error: string | null;
  /** Function to manually regenerate the avatar */
  regenerateAvatar: () => Promise<void>;
  /** Function to clear the cached avatar (useful when user uploads their own) */
  clearAvatar: () => Promise<void>;
  /** Whether the current avatar is a DiceBear generated one */
  isDiceBearAvatar: boolean;
}

/**
 * Hook for automatically managing user avatars
 * 
 * @param userId - User ID/wallet address (optional, defaults to current user)
 * @param existingProfilePic - Existing profile picture URL (optional)
 * @param options - Configuration options
 * @returns Avatar management state and functions
 */
export function useAutoAvatar(
  userId?: string,
  existingProfilePic?: string | null,
  options: UseAutoAvatarOptions = {}
): UseAutoAvatarReturn {
  const {
    autoGenerate = true,
    preload = true,
    updateRedux = true
  } = options;

  const dispatch = useAppDispatch();
  
  // Get current user data from Redux
  const currentUserId = useAppSelector(state => state.auth.address);
  const currentUserProfilePic = useAppSelector(state => state.auth.profilePicUrl);
  
  // Use provided userId or fall back to current user
  const targetUserId = userId || currentUserId;
  const targetProfilePic = existingProfilePic !== undefined ? existingProfilePic : currentUserProfilePic;
  
  // Local state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(targetProfilePic);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiceBearAvatar, setIsDiceBearAvatar] = useState(false);
  
  // Ref to track if generation is in progress to prevent multiple calls
  const isGeneratingRef = useRef(false);

  /**
   * Generate or get avatar for the user
   */
  const generateAvatar = useCallback(async (forceRegenerate: boolean = false) => {
    if (!targetUserId) {
      setError('No user ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newAvatarUrl = await getAvatarUrl(targetUserId, targetProfilePic);
      
      // Check if this is a DiceBear avatar (contains dicebear.com)
      const isDiceBear = newAvatarUrl.includes('dicebear.com');
      setIsDiceBearAvatar(isDiceBear);
      
      setAvatarUrl(newAvatarUrl);

      // Preload the avatar if requested
      if (preload) {
        preloadAvatar(newAvatarUrl);
      }

      // Update Redux state if this is for the current user and updateRedux is enabled
      if (updateRedux && targetUserId === currentUserId && isDiceBear && !targetProfilePic) {
        dispatch(updateProfilePic(newAvatarUrl));
      }
    } catch (err: any) {
      console.error('[useAutoAvatar] Error generating avatar:', err);
      setError(err.message || 'Failed to generate avatar');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, targetProfilePic, preload, updateRedux, currentUserId, dispatch]);

  /**
   * Manually regenerate the avatar
   */
  const regenerateAvatar = useCallback(async () => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    try {
      const newAvatarUrl = await generateAndStoreAvatar(targetUserId, true);
      setAvatarUrl(newAvatarUrl);
      setIsDiceBearAvatar(true);
      
      if (preload) {
        preloadAvatar(newAvatarUrl);
      }

      // Update Redux if this is for the current user
      if (updateRedux && targetUserId === currentUserId) {
        dispatch(updateProfilePic(newAvatarUrl));
      }
    } catch (err: any) {
      console.error('[useAutoAvatar] Error regenerating avatar:', err);
      setError(err.message || 'Failed to regenerate avatar');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, preload, updateRedux, currentUserId, dispatch]);

  /**
   * Clear the cached avatar
   */
  const clearAvatar = useCallback(async () => {
    if (!targetUserId) return;
    
    try {
      await clearCachedAvatar(targetUserId);
      setIsDiceBearAvatar(false);
    } catch (err: any) {
      console.error('[useAutoAvatar] Error clearing avatar:', err);
    }
  }, [targetUserId]);

  // Effect to generate avatar when component mounts or dependencies change
  useEffect(() => {
    if (autoGenerate && targetUserId && !targetProfilePic && !avatarUrl) {
      // Only generate if we don't already have an avatar URL
      // Call generateAvatar directly without including it in dependencies
      const generateAvatarForUser = async () => {
        if (isGeneratingRef.current) return; // Prevent multiple simultaneous calls
        
        isGeneratingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
          const newAvatarUrl = await getAvatarUrl(targetUserId, targetProfilePic);
          
          // Check if this is a DiceBear avatar (contains dicebear.com)
          const isDiceBear = newAvatarUrl.includes('dicebear.com');
          setIsDiceBearAvatar(isDiceBear);
          
          setAvatarUrl(newAvatarUrl);

          // Preload the avatar if requested
          if (preload) {
            preloadAvatar(newAvatarUrl);
          }

          // Update Redux state if this is for the current user and updateRedux is enabled
          if (updateRedux && targetUserId === currentUserId && isDiceBear && !targetProfilePic) {
            dispatch(updateProfilePic(newAvatarUrl));
          }
        } catch (err: any) {
          console.error('[useAutoAvatar] Error generating avatar:', err);
          setError(err.message || 'Failed to generate avatar');
        } finally {
          setIsLoading(false);
          isGeneratingRef.current = false;
        }
      };

      generateAvatarForUser();
    } else if (targetProfilePic) {
      // User has an existing profile picture
      setAvatarUrl(targetProfilePic);
      setIsDiceBearAvatar(false);
    }
  }, [autoGenerate, targetUserId, targetProfilePic, preload, updateRedux, currentUserId, dispatch, avatarUrl]);

  // Update avatar URL when targetProfilePic changes
  useEffect(() => {
    if (targetProfilePic) {
      setAvatarUrl(targetProfilePic);
      setIsDiceBearAvatar(false);
    }
  }, [targetProfilePic]);

  return {
    avatarUrl,
    isLoading,
    error,
    regenerateAvatar,
    clearAvatar,
    isDiceBearAvatar
  };
}

/**
 * Simplified hook for just getting an avatar URL
 * 
 * @param userId - User ID/wallet address
 * @param existingProfilePic - Existing profile picture URL
 * @returns Avatar URL or null if loading
 */
export function useAvatarUrl(userId?: string, existingProfilePic?: string | null): string | null {
  const { avatarUrl } = useAutoAvatar(userId, existingProfilePic, {
    autoGenerate: true,
    preload: false,
    updateRedux: false
  });
  
  return avatarUrl;
} 