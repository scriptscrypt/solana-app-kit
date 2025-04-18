<div align="center">

# Solana App Kit

![Solana App Kit Cover](src/assets/images/Cover.png)

<!-- Stats badges; using SendArcade/solana-app-kit -->

![Downloads](https://img.shields.io/github/downloads/SendArcade/solana-app-kit/total?label=Downloads&color=brightgreen&style=flat-square)
![Forks](https://img.shields.io/github/forks/SendArcade/solana-app-kit?label=Forks&color=blue&style=flat-square)
![License](https://img.shields.io/github/license/SendArcade/solana-app-kit?label=License&message=Apache-2.0&color=brightgreen&style=flat-square)

A modern React Native social application built on the Solana blockchain, providing a complete starter kit for building decentralized social experiences.

Anyone—whether a seasoned React Native developer or a newcomer—can bring their ideas and seamlessly integrate them with Solana protocols.

</div>

## Table of Contents

- [Core Blockchain Features](#core-blockchain-features)
- [App Features](#app-features)
- [Documentation](#documentation)
- [Core Installation](#core-installation)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Hotkeys](#hotkeys)
- [Development Mode Guide](#development-mode-guide)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Examples](#examples)
- [Production Deployment](#production-deployment)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Community](#community)

## Core Blockchain Features

### Token Operations

- Token creation and launching with TokenMill
- Token trading through PumpSwap SDK
- Token balances and transaction history
- Bonding curve configuration and visualization

### NFT Integration

- NFT fetching and display
- NFT listing and purchase
- Collection viewing with floor prices
- Compressed NFT support

### DeFi Capabilities

- Token swapping via PumpSwap
- Liquidity pool creation and management
- Staking and vesting functionality
- Market data integration
- Fund management for users and markets

### Market Data

- Real-time price charts
- Portfolio tracking
- Integration with CoinGecko, BirdEye, and CoinMarketCap

## App Features

### Wallet Integration

- Multiple wallet connection methods
- Embedded wallet support via Privy
- External wallet connections
- Dynamic wallet integration
- Transaction signing and management
- Turnkey wallet management

### Social Features

- User profiles and following system
- Social feed with posts and interactions
- Messaging via Dialect Blinks
- Community engagement features
- NFT display and management
- IPFS storage for metadata

### UI/UX

- Modern, responsive design
- Tab-based navigation
- Interactive charts and visualizations
- Loading states and error handling
- Platform-specific optimizations

### Backend Features

- RESTful API for token operations
- Social data storage and retrieval
- Token market creation and management
- Swapping tokens via Jupiter and PumpSwap
- Staking and vesting functionality
- Image upload and storage

## Documentation

You can view the full documentation of the kit at: [https://docs.1doma.in/docs/introduction](https://docs.1doma.in/docs/introduction)

## Core Installation

```sh
npm install solana-app-kit
```

## Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="100">
        <a href="https://reactnative.dev/" target="_blank" rel="noopener noreferrer">
          <img src="https://d33wubrfki0l68.cloudfront.net/554c3b0e09cf167f0281fda839a5433f2040b349/ecfc9/img/header_logo.svg" width="50" height="50" alt="React Native" />
          <br />React Native
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://expo.dev/" target="_blank" rel="noopener noreferrer">
          <img src="https://www.vectorlogo.zone/logos/expoio/expoio-icon.svg" width="50" height="50" alt="Expo" />
          <br />Expo
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://solana.com/" target="_blank" rel="noopener noreferrer">
          <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" width="50" height="50" alt="Solana" />
          <br />Solana
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://privy.io/" target="_blank" rel="noopener noreferrer">
          <img src="https://assets.privy.io/public-assets/Privy_Logomark_Circle_Purple.svg" width="50" height="50" alt="Privy" />
          <br />Privy
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://redux-toolkit.js.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.worldvectorlogo.com/logos/redux.svg" width="50" height="50" alt="Redux" />
          <br />Redux
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" width="100">
        <a href="https://reactnavigation.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://reactnavigation.org/img/spiro.svg" width="50" height="50" alt="React Navigation" />
          <br />React Nav
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.worldvectorlogo.com/logos/typescript.svg" width="50" height="50" alt="TypeScript" />
          <br />TypeScript
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://turnkey.io/" target="_blank" rel="noopener noreferrer">
          <img src="https://turnkey.io/assets/img/icons/apple-icon.png" width="50" height="50" alt="Turnkey" />
          <br />Turnkey
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://dynamic.xyz/" target="_blank" rel="noopener noreferrer">
          <img src="https://dynamic.xyz/images/dynamic-icon.svg" width="50" height="50" alt="Dynamic" />
          <br />Dynamic
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://docs.expo.dev/versions/latest/sdk/imagepicker/" target="_blank" rel="noopener noreferrer">
          <img src="https://www.vectorlogo.zone/logos/expoio/expoio-icon.svg" width="50" height="50" alt="Image Picker" />
          <br />Image Picker
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" width="100">
        <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">
          <img src="https://expressjs.com/images/favicon.png" width="50" height="50" alt="Express" style="background-color: white; border-radius: 10px; padding: 5px;" />
          <br />Express
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.worldvectorlogo.com/logos/postgresql.svg" width="50" height="50" alt="PostgreSQL" />
          <br />PostgreSQL
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://github.com/SendArcade/TokenMill" target="_blank" rel="noopener noreferrer">
          <img src="https://cryptologos.cc/logos/token-token-logo.png" width="50" height="50" alt="TokenMill" />
          <br />TokenMill
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://www.pinata.cloud/" target="_blank" rel="noopener noreferrer">
          <img src="https://pinata.cloud/icons/pinnie-animated.png" width="50" height="50" alt="Pinata" />
          <br />Pinata
        </a>
      </td>
      <td align="center" width="100">
        <a href="https://cloud.google.com/storage" target="_blank" rel="noopener noreferrer">
          <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" width="50" height="50" alt="Google Cloud" />
          <br />GCP Storage
        </a>
      </td>
    </tr>
  </table>
</div>

## Prerequisites

- Node.js >= 18
- pnpm or yarn or npm
- iOS: XCode and CocoaPods
- Android: Android Studio and Android SDK
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- PostgreSQL database (for the server)

## Quick Start

1. Clone the repository:

   ```sh
   git clone https://github.com/SendArcade/solana-app-kit.git
   cd solana-app-kit
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Start the Expo development server:

   ```sh
   pnpm start
   ```

4. Run on a specific platform:

   ```sh
   # For iOS
   npx expo run:ios

   # For Android
   npx expo run:android
   ```

To run in development mode with cache clearing:

```sh
pnpm start --dev --clear
```

## Hotkeys

When running the Expo development server:

- Press `i` to open on iOS simulator
- Press `a` to open on Android emulator
- Press `w` to open in web browser
- Press `r` to reload the app
- Press `m` to toggle the menu
- Press `d` to open developer tools

## Development Mode Guide

For details on running the app in development mode, including environment variable handling and troubleshooting, please refer to the [Development Mode Guide](docs/DEV_MODE.md).

## Getting Started

This project consists of two main parts:

1. React Native mobile application (in the root directory)
2. Backend server (in the `server` directory)

### Mobile App Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/SendArcade/solana-app-kit.git
   cd solana-app-kit
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the necessary variables as shown in the example below:

   ```
   # Blockchain
   CLUSTER=mainnet-beta

   # Authentication
   PRIVY_APP_ID=your_privy_app_id
   PRIVY_CLIENT_ID=your_privy_client_id
   DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id

   # Turnkey wallet
   TURNKEY_BASE_URL=https://api.turnkey.com
   TURNKEY_RP_ID=host.exp.exponent
   TURNKEY_RP_NAME=send-fi
   TURNKEY_ORGANIZATION_ID=your_turnkey_organization_id
   TURNKEY_API_PUBLIC_KEY=your_turnkey_public_key
   TURNKEY_API_PRIVATE_KEY=your_turnkey_private_key

   # APIs
   HELIUS_API_KEY=your_helius_api_key
   HELIUS_RPC_CLUSTER=mainnet
   HELIUS_STAKED_URL=your_helius_staked_url
   HELIUS_STAKED_API_KEY=your_helius_staked_api_key
   SERVER_URL=your_server_url
   TENSOR_API_KEY=your_tensor_api_key
   PARA_API_KEY=your_para_api_key
   COINGECKO_API_KEY=your_coingecko_api_key
   BIRDEYE_API_KEY=your_birdeye_api_key
   COIN_MARKE_CAPAPI_KEY=your_coinmarketcap_api_key
   ```

### Server Installation

1. Navigate to the server directory:

   ```sh
   cd server
   ```

2. Install server dependencies:

   ```sh
   pnpm install
   ```

3. Set up server environment variables:

   ```sh
   cp .env.example .env
   ```

   Required server environment variables:

   ```
   WALLET_PRIVATE_KEY=your_wallet_private_key
   RPC_URL=your_helius_rpc_url
   TOKEN_MILL_PROGRAMID=your_token_mill_program_id
   TOKEN_MILL_CONFIG_PDA=your_token_mill_config_pda
   SWAP_AUTHORITY_KEY=your_swap_authority_key

   # Pinata for IPFS
   PINATA_JWT=your_pinata_jwt
   PINATA_GATEWAY=your_pinata_gateway
   PINATA_SECRET=your_pinata_secret
   PINATA_API_KEY=your_pinata_api_key

   # Database and Storage
   DATABASE_URL=your_postgresql_url
   GCS_BUCKET_NAME=your_gcs_bucket_name
   SERVICE_ACCOUNT_EMAIL=your_service_account_email

   # Turnkey
   TURNKEY_API_URL=https://api.turnkey.com
   TURNKEY_ORGANIZATION_ID=your_turnkey_organization_id
   TURNKEY_API_PUBLIC_KEY=your_turnkey_api_public_key
   TURNKEY_API_PRIVATE_KEY=your_turnkey_api_private_key
   ```

4. Start the development server:
   ```sh
   pnpm dev
   # or
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
pnpm start
# or
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
pnpm ios
# or
yarn ios
# or
npm run ios
```

#### Android

```sh
pnpm android
# or
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
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── modules/        # Feature modules (core functionality)
│   │   ├── mercuro/    # Advanced financial utilities
│   │   ├── nft/        # NFT display and management
│   │   ├── onChainData/ # On-chain data fetching and display
│   │   ├── pumpFun/    # Pump.fun integration
│   │   ├── pumpSwap/   # Token swapping and liquidity pools
│   │   ├── tokenMill/  # Token creation and management
│   │   └── walletProviders/ # Wallet connection adapters
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens and UI flows
│   ├── services/       # API integrations and business logic
│   ├── state/          # Redux store and slices
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions and helpers
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
├── docs/               # Documentation files
├── CONTRIBUTING.md     # Contribution guidelines
└── package.json        # Dependencies and scripts
```

## Modules

The Solana App Kit provides several modular features that can be used independently:

### walletProviders

- Multiple wallet connection methods (Privy, Dynamic, Mobile Wallet Adapter)
- Standardized wallet interface
- Transaction handling across providers
- Support for embedded wallets, social login, and external wallets

### tokenMill

- Token creation with configurable parameters
- Bonding curve configuration for token pricing
- Token swapping (buy/sell) functionality
- Staking tokens for rewards
- Creating and releasing vesting plans
- Fund management for users and markets

### onChainData

- Fetching on-chain data with optimized RPC calls
- Token balance tracking
- Transaction history display
- Real-time data synchronization

### nft

- NFT display, management, and trading
- Collection viewing with floor prices
- Compressed NFT support
- Integration with threads and posts

### pumpSwap

- Token swapping using PumpSwap SDK
- Liquidity pool creation with custom token pairs
- Liquidity management (add and remove liquidity)
- Pool creation with custom parameters
- Real-time quotes and price impact estimates
- Transaction status monitoring

### pumpFun

- Integration with the Pump.fun ecosystem
- Meme token creation and management
- Community engagement tools

### mercuro

- Advanced financial transaction utilities
- Custom financial operations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For detailed guidelines on how to contribute to this project, see our [Contributing Guide](CONTRIBUTING.md).

## Security

This toolkit handles transaction generation, signing and sending, using provided wallets. Always ensure you're using it in a secure environment and never share your private keys.

## Troubleshooting

Common issues and their solutions:

- **Expo build errors**: Clear your cache with `expo start --clear`
- **Wallet connection issues**: Ensure you're using the correct provider and have properly configured environment variables
- **iOS simulator issues**: Try resetting the simulator or running `pod install` in the iOS directory

## Community

Join our community to get help, share your projects, and contribute:

- [Discord](https://discord.gg/sendarcade)
- [Twitter](https://twitter.com/sendarcade)

## License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.

---

Built with ❤️ for the Solana ecosystem by Send Arcade
