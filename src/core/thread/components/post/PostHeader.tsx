// FILE: src/components/thread/post/PostHeader.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ImageSourcePropType,
  StyleSheet,
  Platform,
} from 'react-native';
import Icons from '../../../../assets/svgs';
import { createThreadStyles, getMergedTheme } from '../thread.styles';
import { ThreadPost, ThreadUser } from '../thread.types';
import { DEFAULT_IMAGES } from '../../../../config/constants';
import { useWallet } from '../../../../modules/walletProviders/hooks/useWallet';
import { IPFSAwareImage } from '@/shared/utils/IPFSImage';
import COLORS from '@/assets/colors';

// Always available direct reference to an image in the bundle
const DEFAULT_AVATAR = require('../../../../assets/images/User.png');

// Generate random background colors for placeholders
function getAvatarColor(username: string): string {
  // Simple hash function to generate consistent colors for the same username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Get a pastel hue
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 80%)`;
}

// The ProfileAvatarView component - simplified to rely on IPFSAwareImage but with a 403/429 fix
function ProfileAvatarView({
  user,
  style,
  size = 40
}: {
  user: ThreadUser,
  style?: any,
  size?: number
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  // Track if we should use a fallback gateway after failing with the first one
  const [useBackupGateway, setUseBackupGateway] = useState(false);

  // Get user initials for the placeholder
  const initials = user?.username
    ? user.username.charAt(0).toUpperCase()
    : user?.handle ? user.handle.charAt(0).toUpperCase() : '?';

  // Get consistent background color based on username
  const backgroundColor = getAvatarColor(user?.username || user?.handle || '?');

  // Reset fallback gateway when user changes
  useEffect(() => {
    setUseBackupGateway(false);
  }, [user?.id, user?.avatar]);

  // *** DIRECT APPROACH FIX to use reliable IPFS gateways WITHOUT cache buster (ANDROID ONLY) ***
  const source = (() => {
    // Default if no avatar
    if (!user?.avatar) return DEFAULT_AVATAR;

    // On iOS, use the original avatar directly - no transformations needed 
    if (Platform.OS === 'ios') {
      // Simply return the original avatar as provided by the API
      return user.avatar;
    }

    // ANDROID ONLY - Below code only runs on Android
    let ipfsHash: string | null = null;
    let originalUrl: string | null = null;

    // Process string avatars
    if (typeof user.avatar === 'string') {
      originalUrl = String(user.avatar);
      if (originalUrl.includes('ipfs.io/ipfs/')) {
        const parts = originalUrl.split('/ipfs/');
        if (parts.length > 1) ipfsHash = parts[1].split('?')[0]?.split('#')[0];
      } else if (originalUrl.startsWith('ipfs://')) {
        ipfsHash = originalUrl.slice(7).split('?')[0]?.split('#')[0];
      }
    }
    // Process object avatars
    else if (typeof user.avatar === 'object' && user.avatar && !Array.isArray(user.avatar) && 'uri' in user.avatar) {
      originalUrl = user.avatar.uri as string;
      if (originalUrl && originalUrl.includes('ipfs.io/ipfs/')) {
        const parts = originalUrl.split('/ipfs/');
        if (parts.length > 1) ipfsHash = parts[1].split('?')[0]?.split('#')[0];
      }
    }

    // If we found an IPFS hash, construct the corrected source using a gateway that works on Android
    if (ipfsHash) {
      // Problematic hash that's hitting rate limits on Pinata - use additional gateways
      const knownProblematicHashes = ['QmVcntn6HWYG9f13YKBoevhCdtVq7wi1URZuHzSb91CZgZ'];

      let gatewayUri;

      // If we've already had an error with the first gateway, or this is a known problematic hash
      if (useBackupGateway || knownProblematicHashes.includes(ipfsHash)) {
        // Use a different gateway to avoid rate limits
        const fallbackGateways = [
          `https://nftstorage.link/ipfs/${ipfsHash}`,
          `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
          `https://ipfs.io/ipfs/${ipfsHash}`  // Try original as last resort
        ];

        // Use one of the fallback gateways
        gatewayUri = fallbackGateways[0];
      } else {
        // For all other hashes on first try, continue using Pinata as it works for them
        gatewayUri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      // Construct the source object, keeping original headers if present in an object avatar
      const headers = (typeof user.avatar === 'object' && !Array.isArray(user.avatar) && user.avatar.headers) ? user.avatar.headers : { 'Accept': '*/*' };
      return { uri: gatewayUri, headers };
    }

    // If it wasn't an IPFS URL needing transformation, return the original source
    if (originalUrl) {
      // If the original was an object, return it directly (handles headers etc.)
      if (typeof user.avatar === 'object' && !Array.isArray(user.avatar)) return user.avatar;
      // Otherwise, return a simple URI object from the string
      return { uri: originalUrl };
    }

    // Fallback / Default (handles require() or array sources)
    return user.avatar || DEFAULT_AVATAR;
  })();

  // Use a STABLE key based on user ID and the original avatar string/URI if possible
  const originalAvatarString = typeof user?.avatar === 'string' ? user.avatar :
    (typeof user?.avatar === 'object' && !Array.isArray(user?.avatar) && user?.avatar?.uri ? user.avatar.uri as string : null);

  // Include the backup gateway state in the key to force a reload with the new gateway
  const gatewayState = useBackupGateway ? '-backup' : '-primary';
  const imageKey = `avatar-${user?.id || 'local'}-${originalAvatarString || 'no-avatar'}${gatewayState}`;

  return (
    <View style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor, // Always show background color initially
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Ensure image stays within bounds
      },
      style
    ]}>
      {/* Initials Text - show only if image hasn't loaded */}
      {!imageLoaded && (
        <Text style={{
          fontSize: size * 0.45,
          fontWeight: '700',
          color: '#333',
          textAlign: 'center',
        }}>
          {initials}
        </Text>
      )}

      {/* Use IPFSAwareImage - it will handle its own errors/defaults */}
      <IPFSAwareImage
        source={source}
        defaultSource={DEFAULT_AVATAR} // IPFSAwareImage handles showing this on error
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          position: 'absolute', // Overlay on top of the background/initials
          top: 0,
          left: 0,
          opacity: imageLoaded ? 1 : 0, // Fade in when loaded
        }}
        key={imageKey} // Use the stable key that includes gateway state
        onLoad={() => {
          // console.log('[PostHeader] IPFSAwareImage onLoad triggered for source:', JSON.stringify(source));
          setImageLoaded(true);
        }} // Mark as loaded successfully
        onError={(error: any) => {
          console.error('[PostHeader] IPFSAwareImage onError triggered! Source:', JSON.stringify(source), 'Error:', error?.nativeEvent?.error || 'Unknown error');
          setImageLoaded(false); // Ensure initials show on error

          // If we're on Android and haven't tried the backup gateway yet, try it now
          if (Platform.OS === 'android' && !useBackupGateway) {
            console.log('[PostHeader] Trying fallback gateway for image...');
            setUseBackupGateway(true);
          }
        }}
        fadeDuration={Platform.OS === 'android' ? 0 : 150} // Optional fade-in
      />
    </View>
  );
}

interface PostHeaderProps {
  /** The post data to display in the header */
  post: ThreadPost;
  /** Callback fired when the user taps the menu and chooses "delete" */
  onDeletePost?: (post: ThreadPost) => void;
  /** Callback fired when the user taps "edit" */
  onEditPost?: (post: ThreadPost) => void;
  /** Theme overrides for customizing appearance */
  themeOverrides?: Partial<Record<string, any>>;
  /** Style overrides for specific components */
  styleOverrides?: { [key: string]: object };

  /**
   * NEW: callback if user taps on the user's avatar/username
   */
  onPressUser?: (user: ThreadUser) => void;
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(function PostHeader({
  post,
  onDeletePost,
  onEditPost,
  themeOverrides,
  styleOverrides,

  onPressUser,
}: PostHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, createdAt } = post;
  const mergedTheme = getMergedTheme(themeOverrides);
  const styles = createThreadStyles(mergedTheme, styleOverrides);

  // Get current user's wallet address to check post ownership
  const { address: currentUserAddress } = useWallet();

  // Check if post belongs to current user
  const isMyPost = currentUserAddress &&
    user.id &&
    currentUserAddress.toLowerCase() === user.id.toLowerCase();

  // Convert date to a short HH:mm string for display
  const timeString = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handlePressOutside = () => {
    setMenuOpen(false);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEditPost?.(post);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    if (!onDeletePost) return;
    // For safety, confirm before deleting
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeletePost(post) },
      ],
      { cancelable: true },
    );
  };

  const handleUserPress = () => {
    if (onPressUser) {
      onPressUser(user);
    }
  };

  // Add a function to format relative time
  const getRelativeTimeString = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}m`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <View style={[styles.threadItemHeaderRow, { zIndex: 1 }]}>
      {/* If the menu is open, a transparent overlay to detect outside clicks */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
          <View style={localHeaderStyles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.threadItemHeaderLeft}>
        {/* Wrap the avatar in a Touchable to press user */}
        <TouchableOpacity
          onPress={handleUserPress}
          style={{ position: 'relative' }}>
          <ProfileAvatarView
            user={user}
            style={styles.threadItemAvatar}
          />
          {/* <Icons.addUserIcon
            style={{
              position: 'absolute',
              bottom: -4,
              zIndex: 10,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: 'white',
            }}
          /> */}
        </TouchableOpacity>

        <View style={{ marginLeft: 8 }}>
          {/* Also wrap the username in a Touchable */}
          <TouchableOpacity
            onPress={handleUserPress}
            style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.threadItemUsername}>{user.username}</Text>
            {user.verified && (
              <Icons.BlueCheck
                width={14}
                height={14}
                style={styles.verifiedIcon}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.threadItemHandleTime}>
            {user.handle} • {timeString}
          </Text>
        </View>
      </View>

      {/* Time indicator and menu controls on the right */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={localHeaderStyles.relativeTime}>{getRelativeTimeString(createdAt)}</Text>

        {/* Only show 3-dot menu if this is the current user's post */}
        {isMyPost && (
          <TouchableOpacity onPress={handleToggleMenu}>
            <Icons.DotsThree width={20} height={20} color={COLORS.greyMid} />
          </TouchableOpacity>
        )}
      </View>

      {/* The small drop-down menu if menuOpen */}
      {menuOpen && isMyPost && (
        <View style={localHeaderStyles.menuContainer}>
          {/* Edit Option - No suitable icon found */}
          <TouchableOpacity
            style={localHeaderStyles.menuItem} // Use base style
            onPress={handleEdit}
          >
            {/* No icon here */}
            <Text style={localHeaderStyles.menuItemText}>Edit</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={localHeaderStyles.separator} />

          {/* Delete Option - Using 'cross' icon */}
          <TouchableOpacity
            style={localHeaderStyles.menuItem} // Use base style
            onPress={handleDelete}
          >
            <Text style={[localHeaderStyles.menuItemText, localHeaderStyles.deleteText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const localHeaderStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    right: -9999, // Extend further to cover more area
    bottom: -9999,
    width: '500%', // Larger area to ensure it covers screen taps
    height: '500%',
    zIndex: 30,
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional: slight dimming
  },
  menuContainer: {
    position: 'absolute',
    top: 30, // Adjusted position slightly lower
    right: 10, // Adjusted position slightly more inboard
    backgroundColor: COLORS.lighterBackground,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor, // Darker border for dark theme
    borderRadius: 8, // Slightly more rounded corners
    zIndex: 10000, // Increased zIndex slightly, ensure it's above parent row's potential context
    paddingVertical: 6, // Adjusted vertical padding
    minWidth: 120, // Ensure minimum width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Slightly larger shadow
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 5,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center items vertically
    paddingVertical: 10, // Increased vertical padding
    paddingHorizontal: 15, // Increased horizontal padding
  },
  menuIcon: {
    marginRight: 10, // Space between icon and text
    color: COLORS.errorRed, // Match delete text color
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.greyMid,
    flexShrink: 1, // Prevent text from pushing icon out if long
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderDarkColor, // Darker separator for dark theme
    marginHorizontal: 10, // Indent separator slightly
  },
  deleteText: {
    color: COLORS.errorRed, // Red from colors.ts
    fontWeight: '500', // Slightly bolder delete text
  },
  relativeTime: {
    fontSize: 12,
    color: COLORS.greyMid,
    marginRight: 8,
  },
});
