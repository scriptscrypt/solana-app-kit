import { AppScreen, NotificationAction, NotificationTemplate } from '@/types';

// App Screens available for navigation
export const APP_SCREENS: AppScreen[] = [
  // Main Screens
  { id: 'FeedScreen', name: 'Feed Screen', description: 'Main social feed', category: 'main' },
  { id: 'MainTabs', name: 'Main Tabs', description: 'Main tab navigation', category: 'main' },
  { id: 'HomeScreen', name: 'Home Screen', description: 'App home screen', category: 'main' },
  
  // Profile Screens
  { id: 'ProfileScreen', name: 'Profile Screen', description: 'User profile page', category: 'profile' },
  { id: 'OtherProfile', name: 'Other Profile', description: 'View other user profile', category: 'profile' },
  { id: 'EditProfile', name: 'Edit Profile', description: 'Edit user profile', category: 'profile' },
  { id: 'WalletScreen', name: 'Wallet Screen', description: 'User wallet overview', category: 'profile' },
  
  // Trading Screens
  { id: 'SwapScreen', name: 'Swap Screen', description: 'Token swap interface', category: 'trading' },
  { id: 'TradingScreen', name: 'Trading Screen', description: 'Trading interface', category: 'trading' },
  { id: 'TokenLaunchScreen', name: 'Token Launch', description: 'Launch new tokens', category: 'trading' },
  { id: 'StakingScreen', name: 'Staking Screen', description: 'Staking interface', category: 'trading' },
  { id: 'PortfolioScreen', name: 'Portfolio', description: 'Portfolio overview', category: 'trading' },
  
  // Social Screens
  { id: 'PostThread', name: 'Post Thread', description: 'View post thread', category: 'social' },
  { id: 'CreatePost', name: 'Create Post', description: 'Create new post', category: 'social' },
  { id: 'ChatScreen', name: 'Chat Screen', description: 'Chat interface', category: 'social' },
  { id: 'NotificationsScreen', name: 'Notifications', description: 'User notifications', category: 'social' },
  
  // Settings Screens
  { id: 'SettingsScreen', name: 'Settings', description: 'App settings', category: 'settings' },
  { id: 'SecurityScreen', name: 'Security', description: 'Security settings', category: 'settings' },
  { id: 'PreferencesScreen', name: 'Preferences', description: 'User preferences', category: 'settings' },
];

// Notification Actions
export const NOTIFICATION_ACTIONS: NotificationAction[] = [
  { 
    id: 'view_transaction', 
    name: 'View Transaction', 
    description: 'Navigate to transaction details',
    requiresData: true,
    dataFields: ['transactionId']
  },
  { 
    id: 'open_wallet', 
    name: 'Open Wallet', 
    description: 'Navigate to wallet screen',
    requiresData: false
  },
  { 
    id: 'view_profile', 
    name: 'View Profile', 
    description: 'Navigate to profile screen',
    requiresData: false
  },
  { 
    id: 'view_post', 
    name: 'View Post', 
    description: 'Navigate to specific post',
    requiresData: true,
    dataFields: ['postId']
  },
  { 
    id: 'open_chat', 
    name: 'Open Chat', 
    description: 'Navigate to chat screen',
    requiresData: true,
    dataFields: ['chatId', 'userId']
  },
  { 
    id: 'view_token', 
    name: 'View Token', 
    description: 'Navigate to token details',
    requiresData: true,
    dataFields: ['tokenAddress', 'tokenSymbol']
  },
  { 
    id: 'start_swap', 
    name: 'Start Swap', 
    description: 'Navigate to swap with pre-filled data',
    requiresData: true,
    dataFields: ['fromToken', 'toToken']
  },
  { 
    id: 'view_staking', 
    name: 'View Staking', 
    description: 'Navigate to staking rewards',
    requiresData: true,
    dataFields: ['stakingPool']
  },
  { 
    id: 'external_link', 
    name: 'External Link', 
    description: 'Open external URL',
    requiresData: true,
    dataFields: ['url']
  },
  { 
    id: 'custom_action', 
    name: 'Custom Action', 
    description: 'Custom app action',
    requiresData: true,
    dataFields: ['actionType', 'actionData']
  },
];

// Pre-defined Notification Templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Marketing Templates
  {
    id: 'welcome',
    name: 'Welcome Message',
    title: 'Welcome to Solana App! 🎉',
    body: 'Start your journey with crypto trading and social features.',
    data: { screen: 'MainTabs', action: 'welcome' },
    category: 'marketing',
    targetType: 'all',
    priority: 'normal'
  },
  {
    id: 'feature_announcement',
    name: 'New Feature Announcement',
    title: 'New Feature Available! 🚀',
    body: 'Check out the latest updates and improvements.',
    data: { screen: 'FeedScreen', action: 'feature_update' },
    category: 'marketing',
    targetType: 'all',
    priority: 'normal'
  },
  {
    id: 'daily_summary',
    name: 'Daily Portfolio Summary',
    title: 'Your Daily Portfolio Update 📊',
    body: 'See how your investments performed today.',
    data: { screen: 'PortfolioScreen', action: 'daily_summary' },
    category: 'marketing',
    targetType: 'all',
    priority: 'normal'
  },
  
  // Transactional Templates
  {
    id: 'swap_completed',
    name: 'Swap Completed',
    title: 'Swap Successful! ✅',
    body: 'Your token swap has been completed successfully.',
    data: { screen: 'SwapScreen', action: 'view_transaction' },
    category: 'transactional',
    targetType: 'all',
    priority: 'high'
  },
  {
    id: 'transaction_confirmed',
    name: 'Transaction Confirmed',
    title: 'Transaction Confirmed 🎯',
    body: 'Your transaction has been confirmed on the blockchain.',
    data: { screen: 'WalletScreen', action: 'view_transaction' },
    category: 'transactional',
    targetType: 'all',
    priority: 'high'
  },
  {
    id: 'staking_reward',
    name: 'Staking Reward',
    title: 'Staking Rewards Earned! 💰',
    body: 'You have earned new staking rewards.',
    data: { screen: 'StakingScreen', action: 'view_staking' },
    category: 'transactional',
    targetType: 'all',
    priority: 'normal'
  },
  
  // System Templates
  {
    id: 'maintenance_alert',
    name: 'Maintenance Alert',
    title: 'Scheduled Maintenance 🔧',
    body: 'The app will be under maintenance for a short period.',
    data: { screen: 'MainTabs', action: 'maintenance_info' },
    category: 'system',
    targetType: 'all',
    priority: 'high'
  },
  {
    id: 'security_alert',
    name: 'Security Alert',
    title: 'Security Alert 🔒',
    body: 'Important security update for your account.',
    data: { screen: 'SecurityScreen', action: 'security_update' },
    category: 'system',
    targetType: 'all',
    priority: 'high'
  },
  {
    id: 'price_alert',
    name: 'Price Alert',
    title: 'Price Alert! 📈',
    body: 'Your watched token has reached the target price.',
    data: { screen: 'TradingScreen', action: 'view_token' },
    category: 'system',
    targetType: 'all',
    priority: 'high'
  },
  
  // Social Templates
  {
    id: 'new_follower',
    name: 'New Follower',
    title: 'New Follower! 👥',
    body: 'Someone started following you.',
    data: { screen: 'ProfileScreen', action: 'view_profile' },
    category: 'social',
    targetType: 'all',
    priority: 'normal'
  },
  {
    id: 'post_liked',
    name: 'Post Liked',
    title: 'Your Post Got Liked! ❤️',
    body: 'Someone liked your recent post.',
    data: { screen: 'PostThread', action: 'view_post' },
    category: 'social',
    targetType: 'all',
    priority: 'normal'
  },
  {
    id: 'new_message',
    name: 'New Message',
    title: 'New Message 💬',
    body: 'You have a new message.',
    data: { screen: 'ChatScreen', action: 'open_chat' },
    category: 'social',
    targetType: 'all',
    priority: 'normal'
  },
];

// Sound Options
export const SOUND_OPTIONS = [
  { value: 'default', label: 'Default Sound' },
  { value: null, label: 'No Sound' },
];

// Priority Options
export const PRIORITY_OPTIONS = [
  { value: 'default', label: 'Default Priority' },
  { value: 'normal', label: 'Normal Priority' },
  { value: 'high', label: 'High Priority' },
];

// Target Type Options
export const TARGET_TYPE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'ios', label: 'iOS Users Only' },
  { value: 'android', label: 'Android Users Only' },
];

// Notification Categories
export const NOTIFICATION_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', color: 'bg-blue-100 text-blue-800' },
  { value: 'transactional', label: 'Transactional', color: 'bg-green-100 text-green-800' },
  { value: 'system', label: 'System', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'social', label: 'Social', color: 'bg-purple-100 text-purple-800' },
];

// Screen Categories
export const SCREEN_CATEGORIES = [
  { value: 'main', label: 'Main Screens', color: 'bg-blue-100 text-blue-800' },
  { value: 'profile', label: 'Profile Screens', color: 'bg-green-100 text-green-800' },
  { value: 'trading', label: 'Trading Screens', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'social', label: 'Social Screens', color: 'bg-purple-100 text-purple-800' },
  { value: 'settings', label: 'Settings Screens', color: 'bg-gray-100 text-gray-800' },
]; 