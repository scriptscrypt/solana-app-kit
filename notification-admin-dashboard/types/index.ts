export interface PushToken {
  id?: number;
  user_id: string;
  expo_push_token: string;
  device_id?: string;
  platform: 'ios' | 'android';
  app_version?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_used_at?: Date;
}

export interface RegisterTokenRequest {
  userId: string;
  expoPushToken: string;
  deviceId?: string;
  platform: 'ios' | 'android';
  appVersion?: string;
}

export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
  targetType?: 'all' | 'ios' | 'android';
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface BroadcastResult {
  totalTokens: number;
  successfulSends: number;
  failedSends: number;
  tickets: any[];
  errors: string[];
}

export interface NotificationStats {
  totalActive: number;
  totalInactive: number;
  byPlatform: {
    ios?: number;
    android?: number;
  };
}

// App screens and actions for dropdowns
export interface AppScreen {
  id: string;
  name: string;
  description: string;
  category: 'main' | 'profile' | 'trading' | 'social' | 'settings';
}

export interface NotificationAction {
  id: string;
  name: string;
  description: string;
  requiresData?: boolean;
  dataFields?: string[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  category: 'marketing' | 'transactional' | 'system' | 'social';
  targetType: 'all' | 'ios' | 'android';
  priority: 'default' | 'normal' | 'high';
}

export interface NotificationCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  targetType: 'all' | 'ios' | 'android';
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  activeTokens: number;
  inactiveTokens: number;
  totalNotificationsSent: number;
  successRate: number;
  platformDistribution: {
    ios: number;
    android: number;
  };
  recentActivity: NotificationActivity[];
}

export interface NotificationActivity {
  id: string;
  type: 'broadcast' | 'campaign' | 'test';
  title: string;
  recipients: number;
  successRate: number;
  timestamp: Date;
  status: 'success' | 'partial' | 'failed';
} 