# On-Chain Data Module

This module provides utilities to fetch and manage on-chain Solana data like tokens, NFTs, and other assets. It includes services for fetching token balances, prices, and metadata, as well as React hooks for easy integration.

## Features

- Fetch token balances and metadata
- Retrieve token prices from multiple sources
- Handle different asset types (tokens, NFTs, compressed NFTs)
- Optimized React hooks with proper memoization to avoid re-renders
- Utility functions for image handling and data normalization

## Usage Examples

### Fetching Token Balances

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { useFetchTokens } from '@/modules/onChainData';

function TokenList() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const { tokens, loading, error } = useFetchTokens(walletAddress);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tokens.map(token => (
        <div key={token.mint}>
          <img src={token.image} alt={token.symbol} width={24} height={24} />
          <span>{token.name}</span>
          <span>{token.token_info?.balance}</span>
        </div>
      ))}
    </div>
  );
}
```

### Getting Token Prices

```typescript
import { fetchTokenPrice } from '@/modules/onChainData';

async function getTokenValue(tokenInfo) {
  const price = await fetchTokenPrice(tokenInfo);
  const balance = parseFloat(tokenInfo.token_info.balance) / Math.pow(10, tokenInfo.token_info.decimals);
  return balance * (price || 0);
}
```

### Fetching Complete Token Metadata

```typescript
import { fetchTokenMetadata } from '@/modules/onChainData';

async function loadTokenInfo(mintAddress) {
  const tokenInfo = await fetchTokenMetadata(mintAddress);
  return tokenInfo;
}
```

## Architecture

This module is organized into:

- **services**: Core functionality for fetching and processing on-chain data
- **hooks**: React hooks for integrating with components
- **types**: TypeScript type definitions
- **utils**: Helper utilities for data processing

## Performance Considerations

- All hooks use memoization to avoid unnecessary re-renders
- Batched network requests to minimize API calls
- Fallback strategies when primary data sources are unavailable
