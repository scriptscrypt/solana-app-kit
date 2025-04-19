# Solana Social Starter - Backend Server

A comprehensive backend server for the Solana App kit, providing token management, social features, and various API endpoints for interacting with the Solana blockchain.

## Overview

This backend server is built with Express.js and TypeScript, offering a robust API for:

- Token creation and management via TokenMill
- Social features including threads and profiles
- Image upload and management
- Token swapping via Jupiter and PumpSwap
- Staking and vesting functionality
- IPFS integration via Pinata
- Google Cloud Storage integration
- Turnkey API integration for wallet management

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- A Solana wallet with some SOL for transactions
- PostgreSQL database
- Google Cloud Storage account (for image storage)
- Pinata account (for IPFS storage)
- Turnkey API access (for wallet management)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/solana-social-starter.git
cd solana-social-starter/server
```

2. Install dependencies:

```bash
yarn install
```

3. Set up your environment variables by copying the example file:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your own credentials:

```env
# General
WALLET_PRIVATE_KEY="your-wallet-private-key"
RPC_URL="your-solana-rpc-url"
DATABASE_URL="postgresql://username:password@hostname:port/database_name"

# Token Mill
TOKEN_MILL_PROGRAMID="JoeaRXgtME3jAoz5WuFXGEndfv4NPH9nBxsLq44hk9J"
TOKEN_MILL_CONFIG_PDA="your-token-mill-config-pda"

# Swap Authority
SWAP_AUTHORITY_KEY="your-swap-authority-key"

# Pinata IPFS
PINATA_JWT="your-pinata-jwt"
PINATA_GATEWAY="your-pinata-gateway"
PINATA_SECRET="your-pinata-secret"
PINATA_API_KEY="your-pinata-api-key"

# Storage
GCS_BUCKET_NAME="your-gcs-bucket-name"
SERVICE_ACCOUNT_EMAIL="your-service-account-email"

# Turnkey API Configuration
TURNKEY_API_URL="https://api.turnkey.com"
TURNKEY_ORGANIZATION_ID="your-turnkey-organization-id"
TURNKEY_API_PUBLIC_KEY="your-turnkey-api-public-key"
TURNKEY_API_PRIVATE_KEY="your-turnkey-api-private-key"
```

## Development

Start the development server with auto-reload:

```bash
yarn dev
```

This will start the server on port 8080 (or the port specified in your environment variables).

## Production Build

Build the production-ready code:

```bash
yarn build
```

Start the production server:

```bash
yarn start
```

## Deployment

This project includes configuration for Google Cloud Platform deployment:

```bash
# Deploy to Google Cloud App Engine
gcloud app deploy
```

Make sure to set up the appropriate GCP credentials and project configuration before deploying.

## Project Structure

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
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── CONTRIBUTING.md        # Contribution guidelines
└── README.md              # This file
```

## API Endpoints

### TokenMill Endpoints

These endpoints interact with the TokenMill Solana program:

| Endpoint                 | Method | Description                             |
| ------------------------ | ------ | --------------------------------------- |
| `/api/config`            | POST   | Create a new TokenMill configuration    |
| `/api/quote-token-badge` | POST   | Get token badge quote                   |
| `/api/markets`           | POST   | Create a new token market               |
| `/api/free-market`       | POST   | Free a market from restrictions         |
| `/api/tokens`            | POST   | Create a new token                      |
| `/api/swap`              | POST   | Swap tokens between markets             |
| `/api/stake`             | POST   | Create a new staking position           |
| `/api/vesting`           | POST   | Create a new vesting schedule           |
| `/api/vesting/release`   | POST   | Release vested tokens                   |
| `/api/set-curve`         | POST   | Set market curve parameters             |
| `/api/quote-swap`        | POST   | Get quote for a swap                    |
| `/api/get-asset`         | POST   | Get asset metadata                      |
| `/api/graduation`        | GET    | Get graduation information for a market |

### Social Features Endpoints

| Endpoint             | Method  | Description                                |
| -------------------- | ------- | ------------------------------------------ |
| `/api/thread`        | Various | Thread creation, retrieval, and management |
| `/api/profile`       | Various | User profile management                    |
| `/api/thread/images` | Various | Thread image management                    |

### Swap Endpoints

| Endpoint         | Method  | Description              |
| ---------------- | ------- | ------------------------ |
| `/api/jupiter`   | Various | Jupiter DEX integration  |
| `/api/pump-swap` | Various | PumpSwap integration     |
| `/api/pumpfun`   | Various | PumpFun launch endpoints |

## Core Services

### TokenMill Service

The TokenMill service (`src/service/TokenMill/`) provides functionality for:

- Token creation and market management
- Setting bonding curves for token pricing
- Token swapping (buy/sell)
- Staking tokens for rewards
- Creating and releasing vesting plans
- Fund markets with SOL

### Database Integration

The server uses PostgreSQL with Knex.js for:

- User data storage
- Thread and profile information
- Migration management

### File Storage

Two file storage options are integrated:

1. **Google Cloud Storage** - For profile images and thread attachments
2. **IPFS via Pinata** - For decentralized, permanent storage of metadata

### Wallet Management

Turnkey API integration provides secure wallet management capabilities for:
- Key management
- Transaction signing
- Wallet authentication

## Error Handling

The server implements robust error handling with:

- Proper error messages
- Transaction validation
- Response formatting with success/error flags
- Logging for debugging

## Security Considerations

- All transactions require signature with appropriate authority
- Error messages are sanitized before being sent to clients
- Sensitive operation details are kept secure
- Database uses parameterized queries to prevent SQL injection
- Environment variables for sensitive credentials

## Contributing

We welcome contributions to the Solana Social Starter backend server! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed information on how to contribute to this project.

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the repository or contact the maintainers.
