/**
 * Token-related types for the onChainData module
 */

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface TokenPriceInfo {
  price: number;
  lastUpdated?: number;
  source?: string;
}

export type TokenEntry = {
  accountPubkey: string;
  mintPubkey: string;
  uiAmount: number;
  decimals: number;
}; 