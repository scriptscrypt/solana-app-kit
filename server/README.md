# 🚀 Solana App Kit - Backend Server

<div align="center">

![Solana](https://img.shields.io/badge/Solana-black?style=for-the-badge&logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**A comprehensive backend server for the Solana App kit, providing token management, social features, and various API endpoints for interacting with the Solana blockchain.**

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Core Services](#-core-services)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## 🔍 Overview

This backend server is built with Express.js and TypeScript, offering a robust API for Solana blockchain interactions, social features, and token management.

## ✨ Features

| Category | Features |
|----------|----------|
| **Token Management** | • Token creation via TokenMill<br>• Market creation and management<br>• Setting bonding curves<br>• Token swapping<br>• Staking and vesting |
| **Social Features** | • Thread creation and management<br>• User profiles<br>• Image management |
| **Storage** | • IPFS integration via Pinata<br>• Google Cloud Storage integration |
| **Wallet** | • Turnkey API integration<br>• Secure wallet management |
| **Swapping** | • Jupiter DEX integration<br>• PumpSwap integration |

## 📦 Prerequisites

| Requirement | Version/Details |
|-------------|-----------------|
| Node.js | v16 or higher |
| Yarn | Latest version |
| Solana Wallet | With SOL for transactions |
| PostgreSQL | Latest version |
| Google Cloud Storage | Account with bucket setup |
| Pinata | Account for IPFS storage |
| Turnkey | API access for wallet management |

## 🛠️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/solana-social-starter.git
cd solana-social-starter/server
```

2. **Install dependencies:**

```bash
yarn install
```

## 🔐 Environment Setup

1. **Create your environment file:**

```bash
cp .env.example .env
```

2. **Configure the following parameters in your `.env` file:**

| Category | Variables |
|----------|-----------|
| **General** | `WALLET_PRIVATE_KEY`<br>`RPC_URL`<br>`DATABASE_URL` |
| **Token Mill** | `TOKEN_MILL_PROGRAMID`<br>`TOKEN_MILL_CONFIG_PDA` |
| **Swap** | `SWAP_AUTHORITY_KEY` |
| **Pinata IPFS** | `PINATA_JWT`<br>`PINATA_GATEWAY`<br>`PINATA_SECRET`<br>`PINATA_API_KEY` |
| **Google Cloud** | `GCS_BUCKET_NAME`<br>`SERVICE_ACCOUNT_EMAIL` |
| **Turnkey API** | `TURNKEY_API_URL`<br>`TURNKEY_ORGANIZATION_ID`<br>`TURNKEY_API_PUBLIC_KEY`<br>`TURNKEY_API_PRIVATE_KEY` |

## 💻 Development

**Start development server with auto-reload:**

```bash
yarn dev
```

The server will start on port 8080 (or the port specified in your environment variables).

**Build for production:**

```bash
yarn build
```

**Start production server:**

```bash
yarn start
```

## 🚢 Deployment

### Google Cloud Platform Deployment

1. **Configure deployment files:**

```bash
cp cloudbuild.yaml.example cloudbuild.yaml
cp deploy.sh.example deploy.sh
chmod +x deploy.sh
```

2. **Deployment options:**

| Method | Command |
|--------|---------|
| Google Cloud Run | `gcloud app deploy` |
| Deployment Script | `./deploy.sh` |

> **Note**: Configuration files (`cloudbuild.yaml` and `deploy.sh`) are included in `.gitignore` to protect sensitive credentials.

## 📁 Project Structure

```
server/
├── src/                   # Source code
│   ├── controllers/       # Controller functions
│   ├── db/                # Database configuration and migrations
│   ├── idl/               # Interface Definition Language files for Solana programs
│   ├── routes/            # API route definitions
│   ├── service/           # Service implementations
│   │   └── TokenMill/     # TokenMill service implementation
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── index.ts           # Main application entry point
│   └── program-init.ts    # Solana program initialization
├── dist/                  # Compiled JavaScript output
├── uploads/               # Temporary upload directory
├── configuration files    # .env, cloudbuild.yaml, etc.
└── documentation          # README.md, CONTRIBUTING.md, etc.
```

## 🔌 API Endpoints

### TokenMill Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | POST | Create a new TokenMill configuration |
| `/api/quote-token-badge` | POST | Get token badge quote |
| `/api/markets` | POST | Create a new token market |
| `/api/free-market` | POST | Free a market from restrictions |
| `/api/tokens` | POST | Create a new token |
| `/api/swap` | POST | Swap tokens between markets |
| `/api/stake` | POST | Create a new staking position |
| `/api/vesting` | POST | Create a new vesting schedule |
| `/api/vesting/release` | POST | Release vested tokens |
| `/api/set-curve` | POST | Set market curve parameters |
| `/api/quote-swap` | POST | Get quote for a swap |
| `/api/get-asset` | POST | Get asset metadata |
| `/api/graduation` | GET | Get graduation information for a market |

### Social Features Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/thread` | Various | Thread creation, retrieval, and management |
| `/api/profile` | Various | User profile management |
| `/api/thread/images` | Various | Thread image management |

### Swap Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jupiter` | Various | Jupiter DEX integration |
| `/api/pump-swap` | Various | PumpSwap integration |
| `/api/pumpfun` | Various | PumpFun launch endpoints |

## 🧩 Core Services

| Service | Functionality |
|---------|---------------|
| **TokenMill** | • Token creation and market management<br>• Setting bonding curves<br>• Token swapping<br>• Staking and vesting<br>• Market funding |
| **Database** | • PostgreSQL with Knex.js<br>• User data storage<br>• Thread and profile information<br>• Migration management |
| **Storage** | • Google Cloud Storage for images<br>• IPFS via Pinata for metadata |
| **Wallet Management** | • Turnkey API integration<br>• Key management<br>• Transaction signing<br>• Wallet authentication |

### Security Measures

| Area | Implementations |
|------|-----------------|
| **Transactions** | All transactions require signature with appropriate authority |
| **Error Handling** | Sanitized error messages, transaction validation |
| **Database** | Parameterized queries to prevent SQL injection |
| **Credentials** | Environment variables for sensitive information |

## 👥 Contributing

We welcome contributions to the Solana App Kit backend server! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed information on how to contribute to this project.

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue in the repository or contact the maintainers.
