/**
 * DiceBear Avatar Service
 * 
 * Automatically generates and manages DiceBear avatars for users who don't have profile images.
 * Stores the generated avatar URL in the database to ensure consistency across sessions.
 */

import { SERVER_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Available DiceBear avatar styles
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'bottts-neutral',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'thumbs'
];

// Cache key prefix for storing avatar URLs locally
const AVATAR_CACHE_PREFIX = 'dicebear_avatar_';

/**
 * Generate a random avatar style
 */
function getRandomAvatarStyle(): string {
  const randomIndex = Math.floor(Math.random() * AVATAR_STYLES.length);
  return AVATAR_STYLES[randomIndex];
}

/**
 * Generate a DiceBear avatar URL
 * 
 * @param seed - Unique seed for the avatar (usually user ID/wallet address)
 * @param style - Avatar style (optional, will be randomly selected if not provided)
 * @returns DiceBear avatar URL
 */
export function generateDiceBearAvatarUrl(seed: string, style?: string): string {
  const avatarStyle = style || getRandomAvatarStyle();
  const baseUrl = 'https://api.dicebear.com/9.x';
  
  // Use PNG format for better compatibility with React Native
  return `${baseUrl}/${avatarStyle}/png?seed=${encodeURIComponent(seed)}&size=256`;
}

/**
 * Get cached avatar URL from local storage
 * 
 * @param userId - User ID/wallet address
 * @returns Cached avatar URL or null if not found
 */
async function getCachedAvatarUrl(userId: string): Promise<string | null> {
  try {
    const cacheKey = `${AVATAR_CACHE_PREFIX}${userId}`;
    return await AsyncStorage.getItem(cacheKey);
  } catch (error) {
    console.error('[DiceBearService] Error getting cached avatar:', error);
    return null;
  }
}

/**
 * Cache avatar URL in local storage
 * 
 * @param userId - User ID/wallet address
 * @param avatarUrl - Avatar URL to cache
 */
async function setCachedAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  try {
    const cacheKey = `${AVATAR_CACHE_PREFIX}${userId}`;
    await AsyncStorage.setItem(cacheKey, avatarUrl);
  } catch (error) {
    console.error('[DiceBearService] Error caching avatar:', error);
  }
}

/**
 * Update user's profile picture in the database
 * 
 * @param userId - User ID/wallet address
 * @param avatarUrl - Avatar URL to store
 * @returns Success status
 */
async function updateProfilePictureInDB(userId: string, avatarUrl: string): Promise<boolean> {
  try {
    if (!SERVER_URL) {
      return false;
    }

    const response = await fetch(`${SERVER_URL}/api/profile/update-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        avatarUrl,
        source: 'dicebear'
      }),
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (error) {
    console.error('[DiceBearService] Error updating profile picture in DB:', error);
    return false;
  }
}

/**
 * Generate and store a DiceBear avatar for a user
 * 
 * @param userId - User ID/wallet address
 * @param forceRegenerate - Whether to force regeneration even if avatar exists
 * @returns Generated avatar URL
 */
export async function generateAndStoreAvatar(
  userId: string, 
  forceRegenerate: boolean = false
): Promise<string> {
  try {
    // Check if we already have a cached avatar and don't want to force regenerate
    if (!forceRegenerate) {
      const cachedUrl = await getCachedAvatarUrl(userId);
      if (cachedUrl) {
        return cachedUrl;
      }
    }

    // Generate new avatar URL
    const avatarUrl = generateDiceBearAvatarUrl(userId);

    // Cache the avatar URL locally
    await setCachedAvatarUrl(userId, avatarUrl);

    // Try to update in database (non-blocking)
    updateProfilePictureInDB(userId, avatarUrl).catch(() => {
      // Silently fail - avatar will still work from cache
    });

    return avatarUrl;
  } catch (error) {
    console.error('[DiceBearService] Error generating avatar:', error);
    // Fallback to a simple avatar
    return generateDiceBearAvatarUrl(userId, 'pixel-art');
  }
}

/**
 * Get avatar URL for a user - either existing profile picture or generate DiceBear avatar
 * 
 * @param userId - User ID/wallet address
 * @param existingProfilePic - Existing profile picture URL (if any)
 * @returns Avatar URL to use
 */
export async function getAvatarUrl(
  userId: string, 
  existingProfilePic?: string | null
): Promise<string> {
  // If user already has a profile picture, use it
  if (existingProfilePic && existingProfilePic.trim() !== '') {
    return existingProfilePic;
  }

  // If no profile picture, generate/get DiceBear avatar
  return await generateAndStoreAvatar(userId);
}

/**
 * Clear cached avatar for a user (useful when user uploads their own profile picture)
 * 
 * @param userId - User ID/wallet address
 */
export async function clearCachedAvatar(userId: string): Promise<void> {
  try {
    const cacheKey = `${AVATAR_CACHE_PREFIX}${userId}`;
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('[DiceBearService] Error clearing cached avatar:', error);
  }
}

/**
 * Preload an avatar image for better UX
 * 
 * @param avatarUrl - Avatar URL to preload
 */
export function preloadAvatar(avatarUrl: string): void {
  // In React Native, we can preload images using Image.prefetch
  // This is a no-op if the image is already cached
  try {
    // Note: Image.prefetch is available in React Native
    // If using Expo, you might want to use expo-image's prefetch instead
    if (typeof Image !== 'undefined' && Image.prefetch) {
      Image.prefetch(avatarUrl);
    }
  } catch (error) {
    // Silently fail - preloading is not critical
  }
} 