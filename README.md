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

<div align="center" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin: 20px 0;">
  <!-- Token Operations Card -->
  <div style="flex: 1; min-width: 280px; max-width: 350px; background: linear-gradient(145deg, #14F195 0%, #9945FF 100%); border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px; color: white;">
    <div style="padding: 24px 20px; background: rgba(0, 0, 0, 0.2);">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 12px;">
          <path d="M0 5a5.002 5.002 0 0 0 4.027 4.905 6.46 6.46 0 0 1 .544-2.073C3.695 7.536 3.132 6.864 3 5.91h-.5v-.426h.466V5.05c0-.046 0-.093.004-.135H2.5v-.427h.511C3.236 3.24 4.213 2.5 5.681 2.5c.316 0 .59.031.819.085v.733a3.46 3.46 0 0 0-.815-.082c-.919 0-1.538.466-1.734 1.252h1.917v.427h-1.98c-.003.046-.003.097-.003.147v.422h1.983v.427H3.93c.118.602.468 1.03 1.005 1.229a6.5 6.5 0 0 1 4.97-3.113A5.002 5.002 0 0 0 0 5zm16 5.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zm-7.75 1.322c.069.835.746 1.485 1.964 1.562V14h.54v-.62c1.259-.086 1.996-.74 1.996-1.69 0-.865-.563-1.31-1.57-1.54l-.426-.1V8.374c.54.06.884.347.966.745h.948c-.07-.804-.779-1.433-1.914-1.502V7h-.54v.629c-1.076.103-1.808.732-1.808 1.622 0 .787.544 1.288 1.45 1.493l.358.085v1.78c-.554-.08-.92-.376-1.003-.787H8.25zm1.96-1.895c-.532-.12-.82-.364-.82-.732 0-.41.311-.719.824-.809v1.54h-.005zm.622 1.044c.645.145.943.38.943.796 0 .474-.37.8-1.02.86v-1.674l.077.018z"/>
        </svg>
        <h3 style="margin: 0; font-size: 22px; font-weight: 700;">Token Operations</h3>
      </div>
    </div>
    <div style="padding: 16px 20px 24px;">
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Token creation and launching with TokenMill
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Token trading through PumpSwap SDK
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Token balances and transaction history
        </li>
        <li style="display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Bonding curve configuration and visualization
        </li>
      </ul>
    </div>
  </div>

  <!-- NFT Integration Card -->
  <div style="flex: 1; min-width: 280px; max-width: 350px; background: linear-gradient(145deg, #00C2FF 0%, #8A2BE2 100%); border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px; color: white;">
    <div style="padding: 24px 20px; background: rgba(0, 0, 0, 0.2);">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 12px;">
          <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
        </svg>
        <h3 style="margin: 0; font-size: 22px; font-weight: 700;">NFT Integration</h3>
      </div>
    </div>
    <div style="padding: 16px 20px 24px;">
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          NFT fetching and display
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          NFT listing and purchase
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Collection viewing with floor prices
        </li>
        <li style="display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Compressed NFT support
        </li>
      </ul>
    </div>
  </div>

  <!-- DeFi Capabilities Card -->
  <div style="flex: 1; min-width: 280px; max-width: 350px; background: linear-gradient(145deg, #FF9900 0%, #FF3B30 100%); border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px; color: white;">
    <div style="padding: 24px 20px; background: rgba(0, 0, 0, 0.2);">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 12px;">
          <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
          <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
        </svg>
        <h3 style="margin: 0; font-size: 22px; font-weight: 700;">DeFi Capabilities</h3>
      </div>
    </div>
    <div style="padding: 16px 20px 24px;">
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Token swapping via PumpSwap
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Liquidity pool creation and management
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Staking and vesting functionality
        </li>
        <li style="display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Fund management for users and markets
        </li>
      </ul>
    </div>
  </div>

  <!-- Market Data Card -->
  <div style="flex: 1; min-width: 280px; max-width: 350px; background: linear-gradient(145deg, #03A9F4 0%, #00E676 100%); border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px; color: white;">
    <div style="padding: 24px 20px; background: rgba(0, 0, 0, 0.2);">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 12px;">
          <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
        </svg>
        <h3 style="margin: 0; font-size: 22px; font-weight: 700;">Market Data</h3>
      </div>
    </div>
    <div style="padding: 16px 20px 24px;">
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Real-time price charts
        </li>
        <li style="margin-bottom: 10px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Portfolio tracking
        </li>
        <li style="display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #fff; border-radius: 50%; margin-right: 10px;"></span>
          Integration with CoinGecko, BirdEye, and CoinMarketCap
        </li>
      </ul>
    </div>
  </div>
</div>

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
