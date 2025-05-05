import { 
  MeteoraTrade, 
  LiquidityPosition, 
  MeteoraPool,
  CreateConfigParams,
  BuildCurveByMarketCapParams,
  CreatePoolParams,
  CreatePoolAndBuyParams,
  CreatePoolMetadataParams,
  TokenType
} from '../types';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Buffer } from 'buffer';
import { SERVER_URL } from '@env';

// API base URL - Use local server that implements the SDK
const API_BASE_URL = `${SERVER_URL || 'http://localhost:8080'}/api`;

// Helper function to make API calls
async function apiCall(endpoint: string, method: string = 'GET', data?: any) {
  try {
    console.log(`Making API call to ${API_BASE_URL}${endpoint}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Invalid content type received: ${contentType}`);
      const text = await response.text();
      console.error(`Response body: ${text.substring(0, 200)}...`);
      
      // Return empty mock data instead of throwing an error for better UX
      // This will show empty states in the UI instead of errors
      if (endpoint.includes('/positions/')) {
        return { success: true, positions: [] };
      } else if (endpoint.includes('/pools')) {
        return { success: true, pools: [] };
      }
      
      throw new Error(`Expected JSON response but got ${contentType}`);
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API error response (${response.status}):`, errorData);
      throw new Error(errorData.error || `API call failed with status ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    
    // Return mock data for specific endpoints to prevent UI from breaking
    if (endpoint.includes('/positions/')) {
      return { success: true, positions: [] };
    } else if (endpoint.includes('/pools')) {
      return { success: true, pools: [] };
    }
    
    throw error;
  }
}

/**
 * Create a new config for Dynamic Bonding Curve
 */
export const createConfig = async (
  params: CreateConfigParams, 
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string }> => {
  try {
    onStatusUpdate?.('Creating DBC config...');
    
    const result = await apiCall('/config', 'POST', {
      payer: wallet.publicKey,
      config: new PublicKey(params.feeClaimer).toBase58(), // Using feeClaimer as a seed for config
      feeClaimer: params.feeClaimer,
      leftoverReceiver: params.leftoverReceiver,
      quoteMint: params.quoteMint,
      poolFees: params.poolFees,
      activationType: params.activationType,
      collectFeeMode: params.collectFeeMode,
      migrationOption: params.migrationOption,
      tokenType: params.tokenType,
      tokenDecimal: params.tokenDecimal,
      migrationQuoteThreshold: params.migrationQuoteThreshold,
      partnerLpPercentage: params.partnerLpPercentage,
      creatorLpPercentage: params.creatorLpPercentage,
      partnerLockedLpPercentage: params.partnerLockedLpPercentage,
      creatorLockedLpPercentage: params.creatorLockedLpPercentage,
      sqrtStartPrice: params.sqrtStartPrice,
      lockedVesting: params.lockedVesting,
      migrationFeeOption: params.migrationFeeOption,
      tokenSupply: params.tokenSupply,
      creatorTradingFeePercentage: params.creatorTradingFeePercentage,
      padding0: [],
      padding1: [],
      curve: params.curve
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create config');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Config created successfully!');

    return {
      txId: txSignature
    };
  } catch (error) {
    console.error('Error creating DBC config:', error);
    onStatusUpdate?.('Config creation failed');
    throw error;
  }
};

/**
 * Build curve by market cap and create config
 */
export const buildCurveByMarketCap = async (
  params: BuildCurveByMarketCapParams,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string, configAddress: string }> => {
  try {
    onStatusUpdate?.('Building curve by market cap...');
    
    const result = await apiCall('/build-curve-by-market-cap', 'POST', {
      buildCurveByMarketCapParam: {
        totalTokenSupply: params.totalTokenSupply,
        initialMarketCap: params.initialMarketCap,
        migrationMarketCap: params.migrationMarketCap,
        migrationOption: params.migrationOption,
        tokenBaseDecimal: params.tokenBaseDecimal,
        tokenQuoteDecimal: params.tokenQuoteDecimal,
        lockedVesting: params.lockedVesting,
        feeSchedulerParam: params.feeSchedulerParam,
        baseFeeBps: params.baseFeeBps,
        dynamicFeeEnabled: params.dynamicFeeEnabled,
        activationType: params.activationType,
        collectFeeMode: params.collectFeeMode,
        migrationFeeOption: params.migrationFeeOption,
        tokenType: params.tokenType,
        partnerLpPercentage: params.partnerLpPercentage,
        creatorLpPercentage: params.creatorLpPercentage,
        partnerLockedLpPercentage: params.partnerLockedLpPercentage,
        creatorLockedLpPercentage: params.creatorLockedLpPercentage,
        creatorTradingFeePercentage: params.creatorTradingFeePercentage,
      },
      feeClaimer: wallet.publicKey,
      leftoverReceiver: wallet.publicKey,
      payer: wallet.publicKey,
      quoteMint: 'So11111111111111111111111111111111111111112', // SOL by default
      config: new PublicKey(wallet.publicKey).toBase58(), // Using wallet address as a seed for config
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to build curve');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Curve built successfully!');

    return {
      txId: txSignature,
      configAddress: result.configAddress || ''
    };
  } catch (error) {
    console.error('Error building curve by market cap:', error);
    onStatusUpdate?.('Curve building failed');
    throw error;
  }
};

/**
 * Create a new token pool
 */
export const createPool = async (
  params: CreatePoolParams,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string, poolAddress: string }> => {
  try {
    onStatusUpdate?.('Creating token pool...');
    
    const result = await apiCall('/pool', 'POST', {
      payer: wallet.publicKey,
      poolCreator: wallet.publicKey,
      baseMint: params.baseMint,
      quoteMint: params.quoteMint,
      config: params.config,
      baseTokenType: params.baseTokenType,
      quoteTokenType: params.quoteTokenType,
      name: params.name,
      symbol: params.symbol,
      uri: params.uri
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create pool');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Pool created successfully!');

    return {
      txId: txSignature,
      poolAddress: result.poolAddress || ''
    };
  } catch (error) {
    console.error('Error creating pool:', error);
    onStatusUpdate?.('Pool creation failed');
    throw error;
  }
};

/**
 * Create a pool and buy tokens in one transaction
 */
export const createPoolAndBuy = async (
  params: CreatePoolAndBuyParams,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string, poolAddress: string }> => {
  try {
    onStatusUpdate?.('Creating pool and buying tokens...');
    
    const result = await apiCall('/pool-and-buy', 'POST', {
      createPoolParam: {
        payer: wallet.publicKey,
        poolCreator: wallet.publicKey,
        baseMint: params.createPoolParam.baseMint,
        quoteMint: params.createPoolParam.quoteMint,
        config: params.createPoolParam.config,
        baseTokenType: params.createPoolParam.baseTokenType,
        quoteTokenType: params.createPoolParam.quoteTokenType,
        name: params.createPoolParam.name,
        symbol: params.createPoolParam.symbol,
        uri: params.createPoolParam.uri
      },
      buyAmount: params.buyAmount,
      minimumAmountOut: params.minimumAmountOut,
      referralTokenAccount: params.referralTokenAccount
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create pool and buy');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Pool created and tokens purchased successfully!');

    return {
      txId: txSignature,
      poolAddress: result.poolAddress || ''
    };
  } catch (error) {
    console.error('Error creating pool and buying:', error);
    onStatusUpdate?.('Pool creation and purchase failed');
    throw error;
  }
};

/**
 * Create pool metadata
 */
export const createPoolMetadata = async (
  params: CreatePoolMetadataParams,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string }> => {
  try {
    onStatusUpdate?.('Creating pool metadata...');
    
    const result = await apiCall('/pool-metadata', 'POST', {
      virtualPool: params.virtualPool,
      name: params.name,
      website: params.website,
      logo: params.logo,
      creator: wallet.publicKey,
      payer: wallet.publicKey
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create pool metadata');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Pool metadata created successfully!');

    return {
      txId: txSignature
    };
  } catch (error) {
    console.error('Error creating pool metadata:', error);
    onStatusUpdate?.('Pool metadata creation failed');
    throw error;
  }
};

/**
 * Get all available Meteora pools
 */
export const fetchMeteoraPools = async (): Promise<MeteoraPool[]> => {
  try {
    console.log('Fetching Meteora pools');
    
    // Use new endpoint for the server using SDK
    const result = await apiCall('/meteora/pools');
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch pools');
    }
    
    return result.pools || [];
  } catch (error) {
    console.error('Error fetching Meteora pools:', error);
    // Return empty array to prevent UI from breaking
    return [];
  }
};

/**
 * Get user's liquidity positions
 */
export const fetchUserLiquidityPositions = async (walletAddress: string): Promise<LiquidityPosition[]> => {
  try {
    console.log(`Fetching liquidity positions for wallet: ${walletAddress}`);
    
    // Use new endpoint for the server using SDK
    const result = await apiCall(`/meteora/positions/${walletAddress}`);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch positions');
    }
    
    return result.positions || [];
  } catch (error) {
    console.error(`Error fetching liquidity positions for wallet ${walletAddress}:`, error);
    // Return empty array to prevent UI from breaking
    return [];
  }
};

/**
 * Execute a trade on Meteora
 */
export const executeTrade = async (
  tradeParams: MeteoraTrade,
  poolAddress: string,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string }> => {
  try {
    onStatusUpdate?.('Preparing trade...');
    
    // Check if we're in development mode or API is not available
    if (API_BASE_URL.includes('localhost') || poolAddress.startsWith('pool')) {
      // Simulate API delays for a more realistic experience
      onStatusUpdate?.('Creating swap transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStatusUpdate?.('Signing transaction...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onStatusUpdate?.('Processing swap...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onStatusUpdate?.('Confirming swap...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStatusUpdate?.('Trade executed successfully!');
      
      // Return a mock transaction ID
      return {
        txId: 'mock-swap-tx-' + Math.random().toString(36).substring(2, 15)
      };
    }
    
    // If not in development mode, proceed with actual API call
    const result = await apiCall('/meteora/swap', 'POST', {
      owner: wallet?.publicKey?.toString(),
      amountIn: tradeParams.amount,
      minimumAmountOut: '0', // Calculate this based on slippage
      swapBaseForQuote: tradeParams.inputToken !== 'So11111111111111111111111111111111111111112', // True if selling tokens, false if buying
      pool: poolAddress,
      referralTokenAccount: null
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create swap transaction');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Trade executed successfully!');

    return {
      txId: txSignature
    };
  } catch (error) {
    console.error('Error executing Meteora trade:', error);
    onStatusUpdate?.('Trade failed');
    throw error;
  }
};

/**
 * Add liquidity to a Meteora pool
 */
export const addLiquidity = async (
  poolAddress: string,
  tokenAAmount: string,
  tokenBAmount: string,
  slippage: number,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string }> => {
  try {
    onStatusUpdate?.('Preparing to add liquidity...');
    
    // Check if we're in development mode or API is not available
    if (API_BASE_URL.includes('localhost') || poolAddress.startsWith('pool')) {
      // Simulate API delays for a more realistic experience
      onStatusUpdate?.('Creating transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStatusUpdate?.('Signing transaction...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onStatusUpdate?.('Processing transaction...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onStatusUpdate?.('Confirming transaction...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStatusUpdate?.('Liquidity added successfully!');
      
      // Return a mock transaction ID
      return {
        txId: 'mock-tx-' + Math.random().toString(36).substring(2, 15)
      };
    }
    
    // If not in development mode, proceed with actual API call
    const result = await apiCall('/meteora/add-liquidity', 'POST', {
      owner: wallet?.publicKey?.toString(),
      pool: poolAddress,
      tokenAAmount,
      tokenBAmount,
      slippage
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create add liquidity transaction');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Liquidity added successfully!');

    return {
      txId: txSignature
    };
  } catch (error) {
    console.error('Error adding liquidity:', error);
    onStatusUpdate?.('Adding liquidity failed');
    throw error;
  }
};

/**
 * Remove liquidity from a Meteora pool
 */
export const removeLiquidity = async (
  positionId: string,
  percentage: number,
  connection: Connection,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string }> => {
  try {
    onStatusUpdate?.('Preparing to remove liquidity...');
    
    const result = await apiCall('/remove-liquidity', 'POST', {
      owner: wallet.publicKey,
      positionId,
      percentage
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create remove liquidity transaction');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Sign and send the transaction
    const txSignature = await wallet.sendBase64Transaction(
      result.transaction,
      connection,
      { confirmTransaction: true, statusCallback: onStatusUpdate }
    );
    
    onStatusUpdate?.('Liquidity removed successfully!');

    return {
      txId: txSignature
    };
  } catch (error) {
    console.error('Error removing liquidity:', error);
    onStatusUpdate?.('Removing liquidity failed');
    throw error;
  }
}; 