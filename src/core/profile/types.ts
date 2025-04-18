import { ThreadPost } from '@/core/thread/types';
import { NftItem } from '@/modules/nft/types';
import { PortfolioData, AssetItem } from '@/modules/dataModule';
// import { WalletAction } from '@/shared/state/profile/reducer'; // Keep commented out

/**
 * Represents the core data needed for a user profile display.
 */
export interface UserProfileData {
  address: string;
  profilePicUrl: string | null;
  username: string | null;
  description: string | null;
  attachmentData?: { [key: string]: any };
}

/**
 * Props for the main Profile component.
 */
export interface ProfileProps {
  isOwnProfile?: boolean;
  user?: UserProfileData;
  posts?: ThreadPost[];
  nfts?: NftItem[];
  loadingNfts?: boolean;
  fetchNftsError?: string | null;
  containerStyle?: object;
}

/**
 * Props for the ProfileView component (the visual layout).
 */
export interface ProfileViewProps {
  isOwnProfile: boolean;
  user: UserProfileData;
  myPosts: ThreadPost[];
  myNFTs: NftItem[];
  loadingNfts?: boolean;
  fetchNftsError?: string | null;
  onAvatarPress?: () => void;
  onEditProfile?: () => void;
  followersCount?: number;
  followingCount?: number;
  onPressFollowers?: () => void;
  onPressFollowing?: () => void;
  onFollowPress?: () => void;
  onUnfollowPress?: () => void;
  amIFollowing?: boolean;
  areTheyFollowingMe?: boolean;
  onPressPost?: (post: ThreadPost) => void;
  containerStyle?: object;
  myActions?: any[]; // Use any[] for now
  loadingActions?: boolean;
  fetchActionsError?: string | null;
  portfolioData?: PortfolioData;
  onRefreshPortfolio?: () => void;
  refreshingPortfolio?: boolean;
  onAssetPress?: (asset: AssetItem) => void;
  isLoading?: boolean;
  onEditPost?: (post: ThreadPost) => void;
}

/**
 * Props for the ProfileTabs component.
 */
export interface ProfileTabsProps {
  myPosts: ThreadPost[];
  myNFTs: NftItem[];
  loadingNfts?: boolean;
  fetchNftsError?: string | null;
  myActions: any[]; // Use any[] for now
  loadingActions?: boolean;
  fetchActionsError?: string | null;
  onPressPost?: (post: ThreadPost) => void;
  portfolioData?: PortfolioData;
  onRefreshPortfolio?: () => void;
  refreshingPortfolio?: boolean;
  onAssetPress?: (asset: AssetItem) => void;
  onEditPost?: (post: ThreadPost) => void;
} 