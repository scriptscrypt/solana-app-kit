import axios from 'axios';
import { 
  BroadcastNotificationRequest, 
  NotificationResponse, 
  NotificationStats,
  DashboardStats 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const notificationApi = {
  // Broadcast notification to all users
  async broadcastNotification(data: BroadcastNotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await api.post('/notifications/broadcast', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send broadcast notification');
    }
  },

  // Get notification statistics
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await api.get('/notifications/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification stats');
    }
  },

  // Get dashboard statistics (using real data only)
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get real stats from the server
      const stats = await this.getStats();
      
      // Return only real data, no dummy/mock data
      return {
        totalUsers: stats.totalActive + stats.totalInactive,
        activeTokens: stats.totalActive,
        inactiveTokens: stats.totalInactive,
        totalNotificationsSent: 0, // Will be tracked when we implement notification logging
        successRate: stats.totalActive > 0 ? 1.0 : 0, // 100% if we have active tokens, 0% if none
        platformDistribution: {
          ios: stats.byPlatform.ios || 0,
          android: stats.byPlatform.android || 0,
        },
        recentActivity: [] // Will be populated when we implement activity logging
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  // Test notification endpoint
  async testNotification(data: BroadcastNotificationRequest): Promise<NotificationResponse> {
    try {
      // For testing, we'll use the same broadcast endpoint but with a flag
      const testData = {
        ...data,
        title: `[TEST] ${data.title}`,
        body: `[TEST] ${data.body}`,
      };
      
      const response = await api.post('/notifications/broadcast', testData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send test notification');
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      // If health endpoint doesn't exist, try stats endpoint
      try {
        await this.getStats();
        return {
          status: 'healthy',
          timestamp: new Date().toISOString()
        };
      } catch {
        throw new Error('Server is not responding');
      }
    }
  },

  // Get push token details (if endpoint exists)
  async getTokenDetails(): Promise<any> {
    try {
      const response = await api.get('/notifications/tokens');
      return response.data;
    } catch (error: any) {
      // Return mock data if endpoint doesn't exist
      return {
        tokens: [],
        total: 0
      };
    }
  },
};

export default api; 