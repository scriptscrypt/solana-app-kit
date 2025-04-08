<div align="center">

# Solana App Kit

A modern React Native social application built on the Solana blockchain, providing a complete starter kit for building decentralized social experiences.


</div>

## Features

- **Blockchain Integration**: Built on Solana for fast, low-cost transactions
- **Wallet Management**: Multiple wallet connection options including embedded wallets
- **Social Features**: Feed, profiles, messaging via Dialect Blinks
- **Authentication**: Multiple auth options with Privy integration
- **Cryptocurrency Tracking**: View and track coin details and performance
- **Modern UI**: Beautiful, responsive interface with tab-based navigation
- **Token Management**: 
  - Token creation and launching
  - Bonding curve configuration
  - Token trading functionality
- **NFT Support**: Display and manage NFT collectibles
- **Portfolio Management**: Track and manage token holdings
- **Community Features**: User profiles, following system, and social interactions
- **Backend Server**: Full-featured Express.js server for blockchain interactions

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Simplified React Native development and deployment
- **Solana**: Fast, secure, and censorship-resistant blockchain
- **Dialect**: Native Blinks Integration
- **Privy**: Authentication and wallet management
- **Redux**: State management with Redux Toolkit
- **React Navigation**: Tab and stack-based navigation
- **TypeScript**: Type-safe development
- **BN.js**: Big number handling for blockchain operations
- **React Native Chart Kit**: Data visualization
- **Expo Image Picker**: Image handling for NFTs and profiles
- **Express.js**: Backend server framework
- **PostgreSQL**: Database for user data and social features
- **TokenMill**: Solana program for token management
- **Pinata**: IPFS storage integration
- **Google Cloud Storage**: Image and file storage

## Prerequisites

- Node.js >= 18
- Yarn or npm
- iOS: XCode and CocoaPods
- Android: Android Studio and Android SDK
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- PostgreSQL database (for the server)

## Getting Started

This project consists of two main parts:
1. React Native mobile application (in the root directory)
2. Backend server (in the `server` directory)

### Mobile App Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/solana-app-kit.git
   cd solana-app-kit
   ```

2. Install dependencies:
   ```sh
   yarn install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the necessary variables as shown in the example below:
   ```
   PRIVY_APP_ID=your_privy_app_id
   PRIVY_CLIENT_ID=your_privy_client_id
   TURNKEY_BASE_URL=https://api.turnkey.com
   TURNKEY_RP_ID=host.exp.exponent
   TURNKEY_RP_NAME=send-fi
   DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id
   HELIUS_API_KEY=your_helius_api_key
   SERVER_URL=your_server_url
   TENSOR_API_KEY=your_tensor_api_key
   CLUSTER=mainnet-beta
   PARA_API_KEY=your_para_api_key
   COINGECKO_API_KEY=your_coingecko_api_key
   ```

### Server Installation

1. Navigate to the server directory:
   ```sh
   cd server
   ```

2. Install server dependencies:
   ```sh
   yarn install
   ```

3. Set up server environment variables:
   ```sh
   cp .env.example .env
   ```
   Edit the `.env` file to include your specific credentials and configuration.

4. Start the development server:
   ```sh
   yarn dev
   ```

For more details about the server, see the [Server README](server/README.md).

### Environment Variables for EAS Builds

The project is configured to use the `.env.local` file for both local development and EAS builds. When building with EAS, the environment file is automatically loaded:

```sh
# Example for a development build on Android
npx eas build --profile development --platform android
```

The configuration in `eas.json` specifies the `.env.local` file for each build profile. The babel configuration dynamically loads this file during the build process.

### Running the Mobile App

#### Start Metro Bundler

```sh
yarn start
# or
npm start
```

#### iOS

For iOS, you need to install CocoaPods dependencies first:

```sh
# Install Ruby bundler (first time only)
bundle install

# Install CocoaPods dependencies
bundle exec pod install
```

Then run the app:

```sh
yarn ios
# or
npm run ios
```

#### Android

```sh
yarn android
# or
npm run android
```

## Project Structure

```
solana-app-kit/
├── src/                # Mobile app source code
│   ├── assets/         # Images, icons, and other static assets
│   ├── components/     # Reusable UI components
│   │   ├── actions/    # Action-related components
│   │   ├── wallet/     # Wallet-related components
│   │   ├── thread/     # Social thread components
│   │   ├── tokenMill/  # Token management components
│   │   └── ...         # Other UI components
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens
│   ├── services/       # API and service integrations
│   │   ├── pumpfun/    # Pump.fun integration
│   │   ├── tokenMill/  # Token mill service
│   │   └── walletProviders/ # Wallet provider integrations
│   ├── state/          # Redux store and slices
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── server/             # Backend server code
│   ├── src/            # Server source code
│   │   ├── controllers/ # Controller functions
│   │   ├── db/         # Database configuration
│   │   ├── routes/     # API endpoints
│   │   ├── service/    # Service implementations
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utility functions
│   ├── .env.example    # Example environment variables
│   └── README.md       # Server documentation
├── App.tsx             # Main application component
├── index.js            # Entry point
├── CONTRIBUTING.md     # Contribution guidelines
└── package.json        # Dependencies and scripts
```

## Key Features

### Wallet Integration
- Multiple wallet connection methods
- Embedded wallet support via Privy
- External wallet connections
- Dynamic wallet integration
- Transaction signing and management
- Turnkey wallet management

### Token Management
- Token creation and launching
- Bonding curve configuration
- Price curve visualization
- Token trading functionality
- Portfolio tracking
- TokenMill integration

### Social Features
- User profiles and following system
- Social feed with posts and interactions
- Messaging via Dialect Blinks
- Community engagement features
- NFT display and management
- IPFS storage for metadata

### Backend Features
- RESTful API for token operations
- Social data storage and retrieval
- Token market creation and management
- Swapping tokens via Jupiter and PumpSwap
- Staking and vesting functionality
- Image upload and storage

### UI/UX
- Modern, responsive design
- Tab-based navigation
- Interactive charts and visualizations
- Loading states and error handling
- Platform-specific optimizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more details, see our [Contributing Guide](CONTRIBUTING.md) and the [Server Contributing Guide](server/CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for the Solana ecosystem by Send Arcade
