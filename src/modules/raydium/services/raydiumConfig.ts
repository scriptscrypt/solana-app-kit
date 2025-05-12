import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { Raydium, TxVersion, LAUNCHPAD_PROGRAM, DEV_LAUNCHPAD_PROGRAM } from '@raydium-io/raydium-sdk-v2';
import { CLUSTER, HELIUS_STAKED_URL } from '@env';
import { ENDPOINTS } from '@/config/constants';

/**
 * Raydium configuration for client-side SDK
 */
export class RaydiumConfig {
  // Environment detection
  static readonly IS_DEVNET = CLUSTER === 'devnet';
  static readonly CLUSTER_NAME: 'mainnet' | 'devnet' = RaydiumConfig.IS_DEVNET ? 'devnet' : 'mainnet';
  static readonly PROGRAM_ID = RaydiumConfig.IS_DEVNET ? DEV_LAUNCHPAD_PROGRAM : LAUNCHPAD_PROGRAM;
  static readonly TX_VERSION = TxVersion.V0;
  
  // Connection
  private static _connection: Connection | null = null;
  private static _rpcUrl: string | null = null;
  
  // SDK instance
  private static _raydium: Raydium | null = null;
  
  /**
   * Get the Solana RPC URL based on environment configuration
   */
  static getRpcUrl(): string {
    if (!this._rpcUrl) {
      this._rpcUrl = HELIUS_STAKED_URL || 
                    ENDPOINTS.helius || 
                    `https://api.${CLUSTER}.solana.com`;
    }
    return this._rpcUrl;
  }
  
  /**
   * Get a Solana connection
   */
  static getConnection(): Connection {
    if (!this._connection) {
      const rpcUrl = this.getRpcUrl();
      console.log(`[RaydiumConfig] Creating connection to: ${rpcUrl}`);
      this._connection = new Connection(rpcUrl, 'confirmed');
    }
    return this._connection;
  }
  
  /**
   * Get a Raydium SDK instance
   */
  static async getRaydiumSdk(): Promise<Raydium> {
    if (this._raydium) return this._raydium;
    
    const connection = this.getConnection();
    
    // Create a temporary keypair for SDK initialization
    // This isn't used for signing transactions on the client side
    const owner = Keypair.generate();
    
    console.log(`[RaydiumConfig] Initializing Raydium SDK for ${this.CLUSTER_NAME}`);
    
    try {
      this._raydium = await Raydium.load({
        owner,
        connection,
        cluster: this.CLUSTER_NAME,
        disableFeatureCheck: true,
        disableLoadToken: true,
        blockhashCommitment: 'confirmed',
      });
      
      return this._raydium;
    } catch (error) {
      console.error('[RaydiumConfig] Failed to initialize Raydium SDK:', error);
      throw error;
    }
  }
  
  /**
   * Reset the cached connections and SDK instances
   * Useful for testing or when changing networks
   */
  static reset(): void {
    this._connection = null;
    this._rpcUrl = null;
    this._raydium = null;
  }
} 