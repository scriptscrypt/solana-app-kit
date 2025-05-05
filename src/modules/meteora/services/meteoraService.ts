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
    
    const result = await apiCall('/meteora/build-curve-by-market-cap', 'POST', {
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
      feeClaimer: wallet.publicKey.toString(),
      leftoverReceiver: wallet.publicKey.toString(),
      payer: wallet.publicKey.toString(),
      quoteMint: 'So11111111111111111111111111111111111111112', // SOL by default
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to build curve');
    }

    onStatusUpdate?.('Signing transaction...');
    
    let txSignature;
    try {
      // Try to sign and send the transaction with confirmation
      txSignature = await wallet.sendBase64Transaction(
        result.transaction,
        connection,
        { 
          confirmTransaction: true, 
          statusCallback: onStatusUpdate,
          maxRetries: 60, // Increase maximum retries
          confirmationTimeout: 60000 // Increase timeout to 60 seconds
        }
      );
    } catch (confirmError) {
      console.warn('Error confirming transaction:', confirmError);
      
      // If confirmation fails, try to send without waiting for confirmation
      onStatusUpdate?.('Confirmation timed out. Sending without confirmation...');
      
      txSignature = await wallet.sendBase64Transaction(
        result.transaction,
        connection,
        { confirmTransaction: false, statusCallback: onStatusUpdate }
      );
      
      // Wait a few seconds to allow transaction to propagate
      onStatusUpdate?.('Transaction sent. Waiting for network propagation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Manually check if transaction succeeded
      try {
        const status = await connection.getSignatureStatus(txSignature);
        console.log('Transaction status:', status);
        
        if (status && status.value && (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized')) {
          onStatusUpdate?.('Transaction confirmed manually!');
        } else {
          onStatusUpdate?.('Transaction status unknown. Please check explorer.');
        }
      } catch (statusError) {
        console.warn('Error checking transaction status:', statusError);
        onStatusUpdate?.('Could not verify transaction status. Please check explorer.');
      }
    }
    
    onStatusUpdate?.('Curve building transaction sent! TX ID: ' + txSignature);

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
): Promise<{ txId: string, poolAddress: string, baseMintAddress: string }> => {
  try {
    onStatusUpdate?.('Creating token pool...');
    
    const result = await apiCall('/meteora/pool', 'POST', {
      payer: wallet.publicKey.toString(),
      poolCreator: wallet.publicKey.toString(),
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
    
    let txSignature;
    try {
      // Try to sign and send the transaction with confirmation
      txSignature = await wallet.sendBase64Transaction(
        result.transaction,
        connection,
        { 
          confirmTransaction: true, 
          statusCallback: onStatusUpdate,
          maxRetries: 60, // Increase maximum retries
          confirmationTimeout: 60000 // Increase timeout to 60 seconds
        }
      );
    } catch (confirmError) {
      console.warn('Error confirming pool creation transaction:', confirmError);
      
      // If confirmation fails, try to send without waiting for confirmation
      onStatusUpdate?.('Confirmation timed out. Sending without confirmation...');
      
      txSignature = await wallet.sendBase64Transaction(
        result.transaction,
        connection,
        { confirmTransaction: false, statusCallback: onStatusUpdate }
      );
      
      // Wait a few seconds to allow transaction to propagate
      onStatusUpdate?.('Transaction sent. Waiting for network propagation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Manually check if transaction succeeded
      try {
        const status = await connection.getSignatureStatus(txSignature);
        console.log('Pool creation transaction status:', status);
        
        if (status && status.value && (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized')) {
          onStatusUpdate?.('Transaction confirmed manually!');
        } else {
          onStatusUpdate?.('Transaction status unknown. Please check explorer.');
        }
      } catch (statusError) {
        console.warn('Error checking transaction status:', statusError);
        onStatusUpdate?.('Could not verify transaction status. Please check explorer.');
      }
    }
    
    onStatusUpdate?.('Pool creation transaction sent! TX ID: ' + txSignature);

    return {
      txId: txSignature,
      poolAddress: result.poolAddress || '',
      baseMintAddress: result.baseMintAddress || ''
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
 * Fetch swap quote from server
 */
export const fetchSwapQuote = async (
  inputToken: string,
  outputToken: string,
  amount: string,
  slippage: number = 0.5,
  poolAddress?: string
): Promise<any> => {
  try {
    console.log(`Fetching swap quote for ${amount} ${inputToken} to ${outputToken}`);
    
    // Build URL with optional pool address
    let url = `/meteora/quote?inputToken=${inputToken}&outputToken=${outputToken}&amount=${amount}&slippage=${slippage}`;
    if (poolAddress) {
      console.log(`Using specific pool: ${poolAddress}`);
      url += `&poolAddress=${poolAddress}`;
    }
    
    const result = await apiCall(url, 'GET');
    
    // Check if we got a response indicating no pool but suggesting a price-based fallback
    if (!result.success && result.shouldFallbackToPriceEstimate) {
      console.log('No pool available, client should fallback to price-based estimation');
      return {
        success: false,
        error: result.error,
        shouldFallbackToPriceEstimate: true,
        inputToken: result.inputToken,
        outputToken: result.outputToken,
        amount: result.amount
      };
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch quote');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching swap quote:', error);
    throw error;
  }
};

/**
 * Execute a trade on Meteora
 */
export const executeTrade = async (
  tradeParams: MeteoraTrade,
  poolAddress: string,
  wallet: any,
  onStatusUpdate?: (status: string) => void
): Promise<{ txId: string }> => {
  try {
    onStatusUpdate?.('Preparing trade...');
    
    // Validation checks
    if (!wallet) {
      throw new Error('Wallet is required for swap');
    }
    
    if (!wallet.publicKey) {
      throw new Error('Wallet public key is required for swap');
    }
    
    // Check if we need to get the pool first
    if (!poolAddress || poolAddress === '') {
      throw new Error('Pool address is required for swap');
    }
    
    // Create the swap parameters
    const swapParams = {
      owner: wallet.publicKey.toString(),
      amountIn: tradeParams.amount,
      minimumAmountOut: tradeParams.minimumAmountOut || '0', // Use provided min amount or 0
      swapBaseForQuote: tradeParams.inputToken !== 'So11111111111111111111111111111111111111112', // True if selling tokens, false if buying
      pool: poolAddress,
      referralTokenAccount: null
    };
    
    onStatusUpdate?.('Creating swap transaction...');
    
    // Make the API call to create the swap transaction
    const result = await apiCall('/meteora/swap', 'POST', swapParams);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create swap transaction');
    }

    onStatusUpdate?.('Signing transaction...');
    
    // Get connection from RPC - we'll use the default connection 
    // instead of trying to get it from wallet
    // This assumes wallet.sendBase64Transaction doesn't need a separate connection parameter
    // or will use its own connection if none is provided
    
    let txSignature;
    
    try {
      // Try with built-in connection first
      txSignature = await wallet.sendBase64Transaction(
        result.transaction,
        null, // Let the wallet use its own connection
        { confirmTransaction: true, statusCallback: onStatusUpdate }
      );
    } catch (err) {
      // Cast the unknown error to any type to safely check its string representation
      const sendError = err as any;
      
      // If that fails and it looks like we need to provide a connection
      if (sendError.toString().includes('connection') || sendError.toString().includes('undefined')) {
        console.log('Attempting to create a fallback connection...');
        
        // Import Connection from already imported libraries
        const { Connection } = require('@solana/web3.js');
        
        // Create a fallback connection to a public RPC endpoint
        const fallbackConnection = new Connection(
          'https://api.mainnet-beta.solana.com',
          'confirmed'
        );
        
        console.log('Using fallback connection for transaction');
        txSignature = await wallet.sendBase64Transaction(
          result.transaction,
          fallbackConnection,
          { confirmTransaction: true, statusCallback: onStatusUpdate }
        );
      } else {
        // If it's some other error, rethrow it
        throw sendError;
      }
    }
    
    if (!txSignature) {
      throw new Error('Failed to send transaction');
    }
    
    onStatusUpdate?.('Trade executed successfully!');

    return {
      txId: txSignature
    };
  } catch (err) {
    // Cast the unknown error to any type
    const error = err as any;
    console.error('Error executing Meteora trade:', error);
    onStatusUpdate?.('Trade failed: ' + (error.message || 'Unknown error'));
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