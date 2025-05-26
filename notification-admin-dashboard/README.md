# 📱 Notification Admin Dashboard

A comprehensive admin dashboard for managing push notifications in your Solana app. Built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎯 **Comprehensive Notification Management**

- **Pre-built Templates**: 12+ notification templates for different use cases
- **Smart Dropdowns**: All app screens and actions available as intuitive dropdowns
- **Real-time Preview**: See how your notification will look on mobile devices
- **Advanced Options**: Sound, priority, badge count, and custom data support

### 📊 **Dashboard Analytics**

- **Live Statistics**: Total users, active tokens, success rates
- **Platform Distribution**: iOS vs Android breakdown
- **Recent Activity**: Track all sent notifications with success rates
- **Real-time Status**: Server health monitoring

### 🚀 **Quick Actions**

- **One-click Templates**: Send welcome messages, feature updates instantly
- **Test Notifications**: Send test notifications before broadcasting
- **Bulk Operations**: Target all users or specific platforms
- **API Integration**: Full REST API with cURL examples

### 🎨 **Modern UI/UX**

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Beautiful color schemes
- **Loading States**: Smooth animations and feedback
- **Error Handling**: Comprehensive error messages and recovery

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- Your notification server running on port 8080

### Setup

1. **Install Dependencies**

   ```bash
   cd notification-admin-dashboard
   pnpm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Start Development Server**

   ```bash
   pnpm dev
   ```

4. **Open Dashboard**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 📋 Available Templates

### 🎯 **Marketing Templates**

- **Welcome Message**: Onboard new users
- **Feature Announcements**: Promote new features
- **Daily Portfolio Summary**: Engagement notifications

### 💰 **Transactional Templates**

- **Swap Completed**: Transaction confirmations
- **Staking Rewards**: Reward notifications
- **Transaction Confirmed**: Blockchain confirmations

### ⚙️ **System Templates**

- **Maintenance Alerts**: Downtime notifications
- **Security Alerts**: Important security updates
- **Price Alerts**: Token price notifications

### 👥 **Social Templates**

- **New Followers**: Social engagement
- **Post Interactions**: Likes and comments
- **New Messages**: Chat notifications

## 🎮 App Screens & Actions

### 📱 **Available Screens**

- **Main Screens**: FeedScreen, MainTabs, HomeScreen
- **Profile Screens**: ProfileScreen, WalletScreen, EditProfile
- **Trading Screens**: SwapScreen, TradingScreen, StakingScreen
- **Social Screens**: PostThread, ChatScreen, CreatePost
- **Settings Screens**: SettingsScreen, SecurityScreen

### ⚡ **Available Actions**

- **Navigation**: Direct users to specific screens
- **Transactions**: View transaction details
- **Social**: Open chats, view profiles
- **Trading**: Start swaps, view tokens
- **Custom**: Define your own actions

## 🔧 Advanced Features

### 📊 **Custom Data Support**

Send structured data with notifications:

```json
{
  "transactionId": "abc123",
  "amount": "100 SOL",
  "tokenSymbol": "SOL"
}
```

### 🎯 **Targeting Options**

- **All Users**: Broadcast to everyone
- **iOS Only**: Target iOS devices
- **Android Only**: Target Android devices

### 🔊 **Notification Settings**

- **Sound**: Default sound or silent
- **Priority**: Default, normal, or high priority
- **Badge**: iOS badge count support

## 🌐 API Endpoints

### 📤 **Broadcast Notification**

```bash
POST /api/notifications/broadcast
```

**Example Request:**

```json
{
  "title": "Hello World! 👋",
  "body": "This is a test notification",
  "targetType": "all",
  "priority": "normal",
  "sound": "default",
  "data": {
    "screen": "FeedScreen",
    "action": "welcome"
  }
}
```

### 📊 **Get Statistics**

```bash
GET /api/notifications/stats
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "totalActive": 1250,
    "totalInactive": 45,
    "byPlatform": {
      "ios": 750,
      "android": 500
    }
  }
}
```

## 🎨 UI Components

### 🧩 **Reusable Components**

- **Button**: Multiple variants and sizes
- **Card**: Flexible content containers
- **Input/Textarea**: Form inputs with validation
- **Select**: Dropdown with search and categories
- **Badge**: Status indicators

### 🎯 **Dashboard Components**

- **StatsCards**: Metric display cards
- **NotificationForm**: Comprehensive form with all options
- **ActivityFeed**: Recent notification history

## 🚀 Production Deployment

### 📦 **Build for Production**

```bash
pnpm build
pnpm start
```

### 🌐 **Environment Variables**

```env
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

### 🔒 **Security Considerations**

- Add authentication middleware
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs

## 🛠️ Development

### 📁 **Project Structure**

```
notification-admin-dashboard/
├── app/                    # Next.js app directory
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utilities and constants
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

### 🎨 **Styling**

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Pre-styled component library
- **Responsive Design**: Mobile-first approach
- **Color System**: Consistent color palette

### 🔧 **Development Scripts**

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

## 📱 Mobile Preview

The dashboard includes a real-time mobile preview that shows exactly how your notification will appear on users' devices, including:

- App icon and name
- Notification title and body
- Timestamp
- Interactive elements

## 🎯 Quick Start Guide

1. **Start your notification server** (port 8080)
2. **Launch the dashboard** (`pnpm dev`)
3. **Check server status** (should show green "Online")
4. **Send a test notification** using the quick action button
5. **Create custom notifications** using the comprehensive form
6. **Monitor activity** in the recent activity section

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Solana ecosystem**
