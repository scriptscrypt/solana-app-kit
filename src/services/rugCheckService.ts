import { Platform } from 'react-native';

const RUGCHECK_BASE_URL = 'https://api.rugcheck.xyz/v1';

export interface TokenRiskReport {
  score: number;
  score_normalised: number;
  risks: {
    name: string;
    description: string;
    level: string;
    score: number;
    value: string;
  }[];
  rugged: boolean;
  mint: string;
  tokenMeta?: {
    name: string;
    symbol: string;
  };
  topHolders?: {
    address: string;
    amount: number;
    decimals: number;
    insider: boolean;
    owner: string;
    pct: number;
    uiAmount: number;
    uiAmountString: string;
  }[];
  totalHolders?: number;
  totalMarketLiquidity?: number;
}

export async function getTokenRiskReport(tokenMint: string): Promise<TokenRiskReport | null> {
  try {
    console.log(`[RugCheck] Fetching risk report for token: ${tokenMint}`);
    
    const endpoint = `${RUGCHECK_BASE_URL}/tokens/${tokenMint}/report`;
    console.log(`[RugCheck] API endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'User-Agent': `SolanaSocialApp/${Platform.OS}`
      },
    });

    console.log(`[RugCheck] Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[RugCheck] API error: ${response.status}`);
      
      // Log more details about the error
      try {
        const errorText = await response.text();
        console.error(`[RugCheck] Error details: ${errorText}`);
      } catch (e) {
        console.error('[RugCheck] Could not parse error details');
      }
      
      return null;
    }

    const data = await response.json();
    console.log(`[RugCheck] Successfully retrieved data for ${tokenMint}`);
    return data;
  } catch (error) {
    console.error('[RugCheck] Error fetching token risk report:', error);
    return null;
  }
}

// Helper function to determine risk level based on normalized score
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'critical';
}

// Helper function to get color for risk score
export function getRiskScoreColor(score: number): string {
  if (score < 30) return '#4CAF50'; // Low risk - green
  if (score < 60) return '#FFC107'; // Medium risk - yellow
  if (score < 80) return '#FF9800'; // High risk - orange
  return '#F44336'; // Critical risk - red
}

// Helper function to get color for risk level
export function getRiskLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return '#4CAF50';
    case 'medium':
      return '#FFC107';
    case 'high':
      return '#FF9800';
    case 'critical':
      return '#F44336';
    default:
      return '#999999';
  }
} 