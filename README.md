<div align="center">

# Solana App Kit

![Solana App Kit Cover](src/assets/images/Cover.png)

<!-- Stats badges; using SendArcade/solana-app-kit -->

[![Downloads](https://img.shields.io/github/downloads/SendArcade/solana-app-kit/total?label=Downloads&color=brightgreen&style=flat-square)](https://github.com/SendArcade/solana-app-kit/releases)
[![Forks](https://img.shields.io/github/forks/SendArcade/solana-app-kit?label=Forks&color=blue&style=flat-square)](https://github.com/SendArcade/solana-app-kit/network/members)
[![License](https://img.shields.io/github/license/SendArcade/solana-app-kit?label=License&message=Apache-2.0&color=brightgreen&style=flat-square)](https://github.com/SendArcade/solana-app-kit/blob/main/LICENSE)
<!-- [![App Store](https://img.shields.io/badge/App_Store-0D96F6?style=flat-square&logo=app-store&logoColor=white)](https://apps.apple.com/app/send-arcade/id1)
[![Play Store](https://img.shields.io/badge/Play_Store-414141?style=flat-square&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.sendarcade) -->
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://x.com/sendarcadefun)

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
- [Contributors](#contributors)
- [License](#license)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Community](#community)

## Core Blockchain Features

<div style="background: linear-gradient(to right, #1a1f71, #0099FF); border-radius: 8px; padding: 15px; margin-bottom: 20px; color: white;">
  <h3 style="margin-top: 0; color: white;">🔗 Token Operations</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Token creation and launching</strong> with TokenMill</li>
    <li><strong>Token trading</strong> through PumpSwap SDK</li>
    <li><strong>Token balances and transaction history</strong></li>
    <li><strong>Bonding curve configuration</strong> and visualization</li>
  </ul>

  <h3 style="color: white;">🖼️ NFT Integration</h3>
  <ul style="padding-left: 20px;">
    <li><strong>NFT fetching and display</strong></li>
    <li><strong>NFT listing and purchase</strong></li>
    <li><strong>Collection viewing</strong> with floor prices</li>
    <li><strong>Compressed NFT support</strong></li>
  </ul>

  <h3 style="color: white;">💹 DeFi Capabilities</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Token swapping</strong> via PumpSwap</li>
    <li><strong>Liquidity pool creation and management</strong></li>
    <li><strong>Staking and vesting functionality</strong></li>
    <li><strong>Market data integration</strong></li>
    <li><strong>Fund management</strong> for users and markets</li>
  </ul>

  <h3 style="color: white;">📊 Market Data</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Real-time price charts</strong></li>
    <li><strong>Portfolio tracking</strong></li>
    <li><strong>Integration</strong> with CoinGecko, BirdEye, and CoinMarketCap</li>
  </ul>
</div>

## App Features

<div style="background: linear-gradient(to right, #663399, #9370DB); border-radius: 8px; padding: 15px; margin-bottom: 20px; color: white;">
  <h3 style="margin-top: 0; color: white;">👛 Wallet Integration</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Multiple wallet connection methods</strong></li>
    <li><strong>Embedded wallet support</strong> via Privy</li>
    <li><strong>External wallet connections</strong></li>
    <li><strong>Dynamic wallet integration</strong></li>
    <li><strong>Transaction signing and management</strong></li>
    <li><strong>Turnkey wallet management</strong></li>
  </ul>

  <h3 style="color: white;">👥 Social Features</h3>
  <ul style="padding-left: 20px;">
    <li><strong>User profiles</strong> and following system</li>
    <li><strong>Social feed</strong> with posts and interactions</li>
    <li><strong>Messaging</strong> via Dialect Blinks</li>
    <li><strong>Community engagement features</strong></li>
    <li><strong>NFT display and management</strong></li>
    <li><strong>IPFS storage</strong> for metadata</li>
  </ul>

  <h3 style="color: white;">🎨 UI/UX</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Modern, responsive design</strong></li>
    <li><strong>Tab-based navigation</strong></li>
    <li><strong>Interactive charts</strong> and visualizations</li>
    <li><strong>Loading states</strong> and error handling</li>
    <li><strong>Platform-specific optimizations</strong></li>
  </ul>

  <h3 style="color: white;">🖥️ Backend Features</h3>
  <ul style="padding-left: 20px;">
    <li><strong>RESTful API</strong> for token operations</li>
    <li><strong>Social data storage</strong> and retrieval</li>
    <li><strong>Token market creation</strong> and management</li>
    <li><strong>Swapping tokens</strong> via Jupiter and PumpSwap</li>
    <li><strong>Staking and vesting</strong> functionality</li>
    <li><strong>Image upload</strong> and storage</li>
  </ul>
</div>

## Documentation

You can view the full documentation of the kit at: [https://docs.1doma.in/docs/introduction](https://docs.1doma.in/docs/introduction)

## Core Installation

```sh
npm install solana-app-kit
```

## Tech Stack

<div align="center" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
  <table style="border-collapse: separate; border-spacing: 10px; width: 100%; max-width: 800px;">
    <tr>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://reactnative.dev/" target="_blank" rel="noopener noreferrer">
          <img src="https://d33wubrfki0l68.cloudfront.net/554c3b0e09cf167f0281fda839a5433f2040b349/ecfc9/img/header_logo.svg" width="60" height="60" alt="React Native" />
          <br /><span style="font-weight: 500; color: #333;">React Native</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://expo.dev/" target="_blank" rel="noopener noreferrer">
          <img src="https://www.vectorlogo.zone/logos/expoio/expoio-icon.svg" width="60" height="60" alt="Expo" />
          <br /><span style="font-weight: 500; color: #333;">Expo</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://solana.com/" target="_blank" rel="noopener noreferrer">
          <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" width="60" height="60" alt="Solana" />
          <br /><span style="font-weight: 500; color: #333;">Solana</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://privy.io/" target="_blank" rel="noopener noreferrer">
          <img src="https://avatars.githubusercontent.com/u/81824329?s=200&v=4" width="60" height="60" alt="Privy" />
          <br /><span style="font-weight: 500; color: #333;">Privy</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://redux-toolkit.js.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.worldvectorlogo.com/logos/redux.svg" width="60" height="60" alt="Redux" />
          <br /><span style="font-weight: 500; color: #333;">Redux</span>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://reactnavigation.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://reactnavigation.org/img/spiro.svg" width="60" height="60" alt="React Navigation" />
          <br /><span style="font-weight: 500; color: #333;">React Nav</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.worldvectorlogo.com/logos/typescript.svg" width="60" height="60" alt="TypeScript" />
          <br /><span style="font-weight: 500; color: #333;">TypeScript</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://turnkey.io/" target="_blank" rel="noopener noreferrer">
          <img src="https://avatars.githubusercontent.com/u/104513330?s=200&v=4" width="60" height="60" alt="Turnkey" />
          <br /><span style="font-weight: 500; color: #333;">Turnkey</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://dynamic.xyz/" target="_blank" rel="noopener noreferrer">
          <img src="https://avatars.githubusercontent.com/u/96269716?s=200&v=4" width="60" height="60" alt="Dynamic" />
          <br /><span style="font-weight: 500; color: #333;">Dynamic</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://docs.expo.dev/versions/latest/sdk/imagepicker/" target="_blank" rel="noopener noreferrer">
          <img src="https://www.vectorlogo.zone/logos/expoio/expoio-icon.svg" width="60" height="60" alt="Image Picker" />
          <br /><span style="font-weight: 500; color: #333;">Image Picker</span>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">
          <img src="https://expressjs.com/images/favicon.png" width="60" height="60" alt="Express" style="background-color: white; border-radius: 10px; padding: 5px;" />
          <br /><span style="font-weight: 500; color: #333;">Express</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.worldvectorlogo.com/logos/postgresql.svg" width="60" height="60" alt="PostgreSQL" />
          <br /><span style="font-weight: 500; color: #333;">PostgreSQL</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://github.com/SendArcade/TokenMill" target="_blank" rel="noopener noreferrer">
          <img src="https://avatars.githubusercontent.com/u/82165905?s=48&v=4" width="60" height="60" alt="TokenMill" />
          <br /><span style="font-weight: 500; color: #333;">TokenMill</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://www.pinata.cloud/" target="_blank" rel="noopener noreferrer">
          <img src="https://avatars.githubusercontent.com/u/43088506?s=200&v=4" width="60" height="60" alt="Pinata" />
          <br /><span style="font-weight: 500; color: #333;">Pinata</span>
        </a>
      </td>
      <td align="center" style="width: 120px; height: 120px; background: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s; padding: 15px;">
        <a href="https://cloud.google.com/storage" target="_blank" rel="noopener noreferrer">
          <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" width="60" height="60" alt="Google Cloud" />
          <br /><span style="font-weight: 500; color: #333;">GCP Storage</span>
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

<div style="background: linear-gradient(to right, #00C08B, #00E599); border-radius: 8px; padding: 15px; margin-bottom: 20px; color: white;">
  <p style="font-size: 1.1em; margin-top: 0;">The Solana App Kit provides several modular features that can be used independently:</p>

  <h3 style="color: white;">🔐 walletProviders</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Multiple wallet connection methods</strong> (Privy, Dynamic, Mobile Wallet Adapter)</li>
    <li><strong>Standardized wallet interface</strong></li>
    <li><strong>Transaction handling</strong> across providers</li>
    <li><strong>Support for embedded wallets</strong>, social login, and external wallets</li>
  </ul>

  <h3 style="color: white;">🪙 tokenMill</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Token creation</strong> with configurable parameters</li>
    <li><strong>Bonding curve configuration</strong> for token pricing</li>
    <li><strong>Token swapping</strong> (buy/sell) functionality</li>
    <li><strong>Staking tokens</strong> for rewards</li>
    <li><strong>Creating and releasing</strong> vesting plans</li>
    <li><strong>Fund management</strong> for users and markets</li>
  </ul>

  <h3 style="color: white;">📊 onChainData</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Fetching on-chain data</strong> with optimized RPC calls</li>
    <li><strong>Token balance tracking</strong></li>
    <li><strong>Transaction history</strong> display</li>
    <li><strong>Real-time data</strong> synchronization</li>
  </ul>

  <h3 style="color: white;">🖼️ nft</h3>
  <ul style="padding-left: 20px;">
    <li><strong>NFT display, management</strong>, and trading</li>
    <li><strong>Collection viewing</strong> with floor prices</li>
    <li><strong>Compressed NFT</strong> support</li>
    <li><strong>Integration</strong> with threads and posts</li>
  </ul>

  <h3 style="color: white;">💱 pumpSwap</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Token swapping</strong> using PumpSwap SDK</li>
    <li><strong>Liquidity pool creation</strong> with custom token pairs</li>
    <li><strong>Liquidity management</strong> (add and remove liquidity)</li>
    <li><strong>Pool creation</strong> with custom parameters</li>
    <li><strong>Real-time quotes</strong> and price impact estimates</li>
    <li><strong>Transaction status</strong> monitoring</li>
  </ul>

  <h3 style="color: white;">🚀 pumpFun</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Integration</strong> with the Pump.fun ecosystem</li>
    <li><strong>Meme token creation</strong> and management</li>
    <li><strong>Community engagement</strong> tools</li>
  </ul>

  <!-- <h3 style="color: white;">💸 mercuro</h3>
  <ul style="padding-left: 20px;">
    <li><strong>Advanced financial</strong> transaction utilities</li>
    <li><strong>Custom financial</strong> operations</li>
  </ul> -->
</div>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For detailed guidelines on how to contribute to this project, see our [Contributing Guide](CONTRIBUTING.md).

## Contributors

<div align="center">
  <a href="https://github.com/SendArcade/solana-app-kit/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=SendArcade/solana-app-kit" alt="Contributors" />
  </a>
</div>

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
- [Twitter](https://x.com/sendarcadefun)

## License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.

---

Built with ❤️ for the Solana ecosystem by Send Arcade
