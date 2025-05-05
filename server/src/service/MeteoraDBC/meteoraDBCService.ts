import { PublicKey, Connection, Transaction, Keypair } from '@solana/web3.js';
import { DynamicBondingCurveClient, deriveDbcPoolAddress } from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
import * as types from './types';
import bs58 from 'bs58';
import { METEORA_DBC_PROGRAM_ID } from '../../utils/connection';

export class MeteoraDBCService {
  private client: DynamicBondingCurveClient;

  constructor(connection: Connection) {
    this.client = new DynamicBondingCurveClient(connection, 'confirmed');
    console.log(`Initialized Meteora DBC client with program ID: ${METEORA_DBC_PROGRAM_ID.toString()}`);
  }

  /**
   * Convert a string PublicKey to PublicKey object
   */
  private toPublicKey(key: string): PublicKey {
    return new PublicKey(key);
  }

  /**
   * Convert a string to BN
   */
  private toBN(value: string): BN {
    return new BN(value);
  }

  /**
   * Serialize a transaction to base64 string
   */
  private serializeTransaction(transaction: Transaction): string {
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });
    return serializedTransaction.toString('base64');
  }

  /**
   * Ensure transaction has a recent blockhash and serialize it to base64 string
   */
  private async prepareTransaction(transaction: Transaction): Promise<string> {
    // Get a recent blockhash if not already set
    if (!transaction.recentBlockhash) {
      const { blockhash } = await this.client.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
    }

    // Ensure there's a fee payer set
    if (!transaction.feePayer) {
      // For the transaction to serialize, we need to set a temporary fee payer
      // The actual fee payer will be set on the client side when the user signs
      const instructions = transaction.instructions;
      if (instructions.length > 0 && instructions[0].keys.length > 0) {
        // Use the first signer from the first instruction as a temporary fee payer
        const firstSigner = instructions[0].keys.find(key => key.isSigner);
        if (firstSigner) {
          transaction.feePayer = firstSigner.pubkey;
        }
      }
    }

    // Check if we have a fee payer set
    if (!transaction.feePayer) {
      throw new Error("Transaction fee payer required");
    }

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false, 
      verifySignatures: false
    });
    
    return serializedTransaction.toString('base64');
  }

  /**
   * Helper method to create and prepare a transaction
   * This centralizes transaction creation logic with proper blockhash handling
   */
  private async createAndPrepareTransaction<T>(
    createTransactionFn: () => Promise<Transaction>,
    additionalData: T = {} as T
  ): Promise<types.ApiResponse & T> {
    try {
      // Create the transaction
      const transaction = await createTransactionFn();
      
      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);
      
      return {
        success: true,
        transaction: serializedTransaction,
        ...additionalData
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...additionalData
      };
    }
  }

  /**
   * Create a configuration for Dynamic Bonding Curve
   */
  async createConfig(params: types.CreateConfigParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.partner.createConfig({
        payer: this.toPublicKey(params.payer),
        config: this.toPublicKey(params.config),
        feeClaimer: this.toPublicKey(params.feeClaimer),
        leftoverReceiver: this.toPublicKey(params.leftoverReceiver),
        quoteMint: this.toPublicKey(params.quoteMint),
        poolFees: {
          baseFee: {
            cliffFeeNumerator: this.toBN(params.poolFees.baseFee.cliffFeeNumerator),
            numberOfPeriod: params.poolFees.baseFee.numberOfPeriod,
            reductionFactor: this.toBN(params.poolFees.baseFee.reductionFactor),
            periodFrequency: this.toBN(params.poolFees.baseFee.periodFrequency),
            feeSchedulerMode: params.poolFees.baseFee.feeSchedulerMode,
          },
          dynamicFee: params.poolFees.dynamicFee ? {
            binStep: params.poolFees.dynamicFee.binStep,
            binStepU128: this.toBN(params.poolFees.dynamicFee.binStepU128),
            filterPeriod: params.poolFees.dynamicFee.filterPeriod,
            decayPeriod: params.poolFees.dynamicFee.decayPeriod,
            reductionFactor: params.poolFees.dynamicFee.reductionFactor,
            variableFeeControl: params.poolFees.dynamicFee.variableFeeControl,
            maxVolatilityAccumulator: params.poolFees.dynamicFee.maxVolatilityAccumulator,
          } : null,
        },
        activationType: params.activationType,
        collectFeeMode: params.collectFeeMode,
        migrationOption: params.migrationOption,
        tokenType: params.tokenType,
        tokenDecimal: params.tokenDecimal,
        migrationQuoteThreshold: this.toBN(params.migrationQuoteThreshold),
        partnerLpPercentage: params.partnerLpPercentage,
        creatorLpPercentage: params.creatorLpPercentage,
        partnerLockedLpPercentage: params.partnerLockedLpPercentage,
        creatorLockedLpPercentage: params.creatorLockedLpPercentage,
        sqrtStartPrice: this.toBN(params.sqrtStartPrice),
        lockedVesting: {
          amountPerPeriod: this.toBN(params.lockedVesting.amountPerPeriod),
          cliffDurationFromMigrationTime: this.toBN(params.lockedVesting.cliffDurationFromMigrationTime),
          frequency: this.toBN(params.lockedVesting.frequency),
          numberOfPeriod: this.toBN(params.lockedVesting.numberOfPeriod),
          cliffUnlockAmount: this.toBN(params.lockedVesting.cliffUnlockAmount),
        },
        migrationFeeOption: params.migrationFeeOption,
        tokenSupply: params.tokenSupply ? {
          preMigrationTokenSupply: this.toBN(params.tokenSupply.preMigrationTokenSupply),
          postMigrationTokenSupply: this.toBN(params.tokenSupply.postMigrationTokenSupply),
        } : null,
        creatorTradingFeePercentage: params.creatorTradingFeePercentage,
        padding0: [],
        padding1: [],
        curve: params.curve.map(curve => ({
          sqrtPrice: this.toBN(curve.sqrtPrice),
          liquidity: this.toBN(curve.liquidity),
        })),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createConfig:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build curve and create config
   */
  async buildCurveAndCreateConfig(params: types.BuildCurveAndCreateConfigParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.partner.buildCurveAndCreateConfig({
        buildCurveParam: {
          totalTokenSupply: params.buildCurveParam.totalTokenSupply,
          percentageSupplyOnMigration: params.buildCurveParam.percentageSupplyOnMigration,
          migrationQuoteThreshold: params.buildCurveParam.migrationQuoteThreshold,
          migrationOption: params.buildCurveParam.migrationOption,
          tokenBaseDecimal: params.buildCurveParam.tokenBaseDecimal,
          tokenQuoteDecimal: params.buildCurveParam.tokenQuoteDecimal,
          lockedVesting: {
            amountPerPeriod: this.toBN(params.buildCurveParam.lockedVesting.amountPerPeriod),
            cliffDurationFromMigrationTime: this.toBN(params.buildCurveParam.lockedVesting.cliffDurationFromMigrationTime),
            frequency: this.toBN(params.buildCurveParam.lockedVesting.frequency),
            numberOfPeriod: this.toBN(params.buildCurveParam.lockedVesting.numberOfPeriod),
            cliffUnlockAmount: this.toBN(params.buildCurveParam.lockedVesting.cliffUnlockAmount),
          },
          feeSchedulerParam: {
            numberOfPeriod: params.buildCurveParam.feeSchedulerParam.numberOfPeriod,
            reductionFactor: params.buildCurveParam.feeSchedulerParam.reductionFactor,
            periodFrequency: params.buildCurveParam.feeSchedulerParam.periodFrequency,
            feeSchedulerMode: params.buildCurveParam.feeSchedulerParam.feeSchedulerMode,
          },
          baseFeeBps: params.buildCurveParam.baseFeeBps,
          dynamicFeeEnabled: params.buildCurveParam.dynamicFeeEnabled,
          activationType: params.buildCurveParam.activationType,
          collectFeeMode: params.buildCurveParam.collectFeeMode,
          migrationFeeOption: params.buildCurveParam.migrationFeeOption,
          tokenType: params.buildCurveParam.tokenType,
          partnerLpPercentage: params.buildCurveParam.partnerLpPercentage,
          creatorLpPercentage: params.buildCurveParam.creatorLpPercentage,
          partnerLockedLpPercentage: params.buildCurveParam.partnerLockedLpPercentage,
          creatorLockedLpPercentage: params.buildCurveParam.creatorLockedLpPercentage,
          creatorTradingFeePercentage: params.buildCurveParam.creatorTradingFeePercentage,
        },
        feeClaimer: this.toPublicKey(params.feeClaimer),
        leftoverReceiver: this.toPublicKey(params.leftoverReceiver),
        payer: this.toPublicKey(params.payer),
        quoteMint: this.toPublicKey(params.quoteMint),
        config: this.toPublicKey(params.config),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in buildCurveAndCreateConfig:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build curve by market cap and create config
   */
  async buildCurveAndCreateConfigByMarketCap(params: types.BuildCurveAndCreateConfigByMarketCapParam): Promise<types.ApiResponse> {
    try {
      // Generate a new keypair for the config account
      const configKeypair = Keypair.generate();
      const configPubkey = configKeypair.publicKey;
      
      console.log('Building curve with params. Using new config keypair:', configPubkey.toString());
      
      const transaction = await this.client.partner.buildCurveAndCreateConfigByMarketCap({
        buildCurveByMarketCapParam: {
          totalTokenSupply: params.buildCurveByMarketCapParam.totalTokenSupply,
          initialMarketCap: params.buildCurveByMarketCapParam.initialMarketCap,
          migrationMarketCap: params.buildCurveByMarketCapParam.migrationMarketCap,
          migrationOption: params.buildCurveByMarketCapParam.migrationOption,
          tokenBaseDecimal: params.buildCurveByMarketCapParam.tokenBaseDecimal,
          tokenQuoteDecimal: params.buildCurveByMarketCapParam.tokenQuoteDecimal,
          lockedVesting: {
            amountPerPeriod: this.toBN(params.buildCurveByMarketCapParam.lockedVesting.amountPerPeriod),
            cliffDurationFromMigrationTime: this.toBN(params.buildCurveByMarketCapParam.lockedVesting.cliffDurationFromMigrationTime),
            frequency: this.toBN(params.buildCurveByMarketCapParam.lockedVesting.frequency),
            numberOfPeriod: this.toBN(params.buildCurveByMarketCapParam.lockedVesting.numberOfPeriod),
            cliffUnlockAmount: this.toBN(params.buildCurveByMarketCapParam.lockedVesting.cliffUnlockAmount),
          },
          feeSchedulerParam: {
            numberOfPeriod: params.buildCurveByMarketCapParam.feeSchedulerParam.numberOfPeriod,
            reductionFactor: params.buildCurveByMarketCapParam.feeSchedulerParam.reductionFactor,
            periodFrequency: params.buildCurveByMarketCapParam.feeSchedulerParam.periodFrequency,
            feeSchedulerMode: params.buildCurveByMarketCapParam.feeSchedulerParam.feeSchedulerMode,
          },
          baseFeeBps: params.buildCurveByMarketCapParam.baseFeeBps,
          dynamicFeeEnabled: params.buildCurveByMarketCapParam.dynamicFeeEnabled,
          activationType: params.buildCurveByMarketCapParam.activationType,
          collectFeeMode: params.buildCurveByMarketCapParam.collectFeeMode,
          migrationFeeOption: params.buildCurveByMarketCapParam.migrationFeeOption,
          tokenType: params.buildCurveByMarketCapParam.tokenType,
          partnerLpPercentage: params.buildCurveByMarketCapParam.partnerLpPercentage,
          creatorLpPercentage: params.buildCurveByMarketCapParam.creatorLpPercentage,
          partnerLockedLpPercentage: params.buildCurveByMarketCapParam.partnerLockedLpPercentage,
          creatorLockedLpPercentage: params.buildCurveByMarketCapParam.creatorLockedLpPercentage,
          creatorTradingFeePercentage: params.buildCurveByMarketCapParam.creatorTradingFeePercentage,
        },
        feeClaimer: this.toPublicKey(params.feeClaimer),
        leftoverReceiver: this.toPublicKey(params.leftoverReceiver),
        payer: this.toPublicKey(params.payer),
        quoteMint: this.toPublicKey(params.quoteMint),
        config: configPubkey, // Use the new keypair's pubkey
      });

      console.log('Config created successfully');
      
      // Set the fee payer explicitly
      transaction.feePayer = this.toPublicKey(params.payer);
      
      // Get a recent blockhash before trying to sign
      if (!transaction.recentBlockhash) {
        const { blockhash } = await this.client.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }
      
      // Partial sign the transaction with the config keypair
      transaction.partialSign(configKeypair);

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
        configAddress: configPubkey.toString()
      };
    } catch (error) {
      console.error('Error in buildCurveAndCreateConfigByMarketCap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create partner metadata
   */
  async createPartnerMetadata(params: types.CreatePartnerMetadataParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.partner.createPartnerMetadata({
        name: params.name,
        website: params.website,
        logo: params.logo,
        feeClaimer: this.toPublicKey(params.feeClaimer),
        payer: this.toPublicKey(params.payer),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createPartnerMetadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Claim partner trading fee
   */
  async claimPartnerTradingFee(params: types.ClaimTradingFeeParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.partner.claimPartnerTradingFee({
        pool: this.toPublicKey(params.pool),
        feeClaimer: this.toPublicKey(params.feeClaimer),
        maxBaseAmount: this.toBN(params.maxBaseAmount),
        maxQuoteAmount: this.toBN(params.maxQuoteAmount),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in claimPartnerTradingFee:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Partner withdraw surplus
   */
  async partnerWithdrawSurplus(params: types.WithdrawSurplusParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.partner.partnerWithdrawSurplus({
        feeClaimer: this.toPublicKey(params.feeClaimer),
        virtualPool: this.toPublicKey(params.virtualPool),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in partnerWithdrawSurplus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create pool
   */
  async createPool(params: types.CreatePoolParam): Promise<types.ApiResponse> {
    try {
      // Generate a new keypair for the baseMint
      const baseMintKeypair = Keypair.generate();
      const baseMintPubkey = baseMintKeypair.publicKey;
      
      console.log('Creating pool with base mint keypair:', baseMintPubkey.toString());
      
      // Cast the parameters to match the SDK's expected types
      const sdkParams = {
        payer: this.toPublicKey(params.payer),
        poolCreator: this.toPublicKey(params.poolCreator),
        config: this.toPublicKey(params.config),
        baseMint: baseMintPubkey,
        quoteMint: this.toPublicKey(params.quoteMint),
        baseTokenType: params.baseTokenType,
        quoteTokenType: params.quoteTokenType,
        name: params.name,
        symbol: params.symbol,
        uri: params.uri,
      };
      
      // Use the pool.createPool method from the SDK
      const transaction = await this.client.pool.createPool(sdkParams as any);

      console.log('Pool created successfully');
      
      // Set the fee payer explicitly
      transaction.feePayer = this.toPublicKey(params.payer);
      
      // Get a recent blockhash before trying to sign
      if (!transaction.recentBlockhash) {
        const { blockhash } = await this.client.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }
      
      // Partial sign the transaction with the baseMint keypair
      transaction.partialSign(baseMintKeypair);

      // Calculate the pool address using the SDK's helper
      const poolAddress = deriveDbcPoolAddress(
        sdkParams.quoteMint,
        sdkParams.baseMint,
        sdkParams.config
      ).toString();

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
        poolAddress: poolAddress,
        baseMintAddress: baseMintPubkey.toString()
      };
    } catch (error) {
      console.error('Error in createPool:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create pool and buy
   */
  async createPoolAndBuy(params: types.CreatePoolAndBuyParam): Promise<types.ApiResponse> {
    try {
      // Create the parameters object and cast it to any
      const sdkParams = {
        createPoolParam: {
          payer: this.toPublicKey(params.createPoolParam.payer),
          poolCreator: this.toPublicKey(params.createPoolParam.poolCreator),
          baseMint: this.toPublicKey(params.createPoolParam.baseMint),
          quoteMint: this.toPublicKey(params.createPoolParam.quoteMint),
          config: this.toPublicKey(params.createPoolParam.config),
          baseTokenType: params.createPoolParam.baseTokenType,
          quoteTokenType: params.createPoolParam.quoteTokenType,
          name: params.createPoolParam.name,
          symbol: params.createPoolParam.symbol,
          uri: params.createPoolParam.uri
        },
        buyAmount: this.toBN(params.buyAmount),
        minimumAmountOut: this.toBN(params.minimumAmountOut),
        referralTokenAccount: params.referralTokenAccount ? this.toPublicKey(params.referralTokenAccount) : null,
      };

      // Cast the object to any to bypass TypeScript's type checking
      const transaction = await this.client.pool.createPoolAndBuy(sdkParams as any);

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createPoolAndBuy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Swap tokens
   */
  async swap(swapParam: types.SwapParam): Promise<types.ApiResponse> {
    try {
      // Create the parameters object and cast it to any
      const sdkParams = {
        owner: this.toPublicKey(swapParam.owner),
        amountIn: this.toBN(swapParam.amountIn),
        minimumAmountOut: this.toBN(swapParam.minimumAmountOut),
        swapBaseForQuote: swapParam.swapBaseForQuote,
        pool: this.toPublicKey(swapParam.pool),
        referralTokenAccount: swapParam.referralTokenAccount ? this.toPublicKey(swapParam.referralTokenAccount) : null,
      };

      // Cast the object to any to bypass TypeScript's type checking
      const transaction = await this.client.pool.swap(sdkParams as any);

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create locker for migration
   */
  async createLocker(params: types.CreateLockerParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.createLocker({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createLocker:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Withdraw leftover tokens
   */
  async withdrawLeftover(params: types.WithdrawLeftoverParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.withdrawLeftover({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in withdrawLeftover:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create DAMM V1 migration metadata
   */
  async createDammV1MigrationMetadata(params: types.CreateDammV1MigrationMetadataParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.createDammV1MigrationMetadata({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
        config: this.toPublicKey(params.config),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createDammV1MigrationMetadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Migrate to DAMM V1
   */
  async migrateToDammV1(params: types.MigrateToDammV1Param): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.migrateToDammV1({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
        dammConfig: this.toPublicKey(params.dammConfig),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in migrateToDammV1:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Lock DAMM V1 LP token
   */
  async lockDammV1LpToken(params: types.DammLpTokenParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.lockDammV1LpToken({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
        dammConfig: this.toPublicKey(params.dammConfig),
        isPartner: params.isPartner,
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in lockDammV1LpToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Claim DAMM V1 LP token
   */
  async claimDammV1LpToken(params: types.DammLpTokenParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.claimDammV1LpToken({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
        dammConfig: this.toPublicKey(params.dammConfig),
        isPartner: params.isPartner,
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in claimDammV1LpToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create DAMM V2 migration metadata
   */
  async createDammV2MigrationMetadata(params: types.CreateDammV2MigrationMetadataParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.migration.createDammV2MigrationMetadata({
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
        config: this.toPublicKey(params.config),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createDammV2MigrationMetadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Migrate to DAMM V2
   */
  async migrateToDammV2(params: types.MigrateToDammV2Param): Promise<types.ApiResponse> {
    try {
      // Create the parameters object and cast it to any
      const sdkParams = {
        payer: this.toPublicKey(params.payer),
        virtualPool: this.toPublicKey(params.virtualPool),
        dammConfig: this.toPublicKey(params.dammConfig),
      };

      // Cast the object to any to bypass TypeScript's type checking
      const response = await this.client.migration.migrateToDammV2(sdkParams as any);

      // Handle the response which may be a Transaction or a response object with a transaction property
      const transaction = typeof response === 'object' && 'transaction' in response 
        ? response.transaction 
        : response;

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in migrateToDammV2:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create pool metadata
   */
  async createPoolMetadata(params: types.CreatePoolMetadataParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.creator.createPoolMetadata({
        virtualPool: this.toPublicKey(params.virtualPool),
        name: params.name,
        website: params.website,
        logo: params.logo,
        creator: this.toPublicKey(params.creator),
        payer: this.toPublicKey(params.payer),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in createPoolMetadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Claim creator trading fee
   */
  async claimCreatorTradingFee(params: types.ClaimCreatorTradingFeeParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.creator.claimCreatorTradingFee({
        creator: this.toPublicKey(params.creator),
        pool: this.toPublicKey(params.pool),
        maxBaseAmount: this.toBN(params.maxBaseAmount),
        maxQuoteAmount: this.toBN(params.maxQuoteAmount),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in claimCreatorTradingFee:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creator withdraw surplus
   */
  async creatorWithdrawSurplus(params: types.CreatorWithdrawSurplusParam): Promise<types.ApiResponse> {
    try {
      const transaction = await this.client.creator.creatorWithdrawSurplus({
        creator: this.toPublicKey(params.creator),
        virtualPool: this.toPublicKey(params.virtualPool),
      });

      // Prepare the transaction with a blockhash and serialize it
      const serializedTransaction = await this.prepareTransaction(transaction);

      return {
        success: true,
        transaction: serializedTransaction,
      };
    } catch (error) {
      console.error('Error in creatorWithdrawSurplus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pool state information
   */
  async getPoolState(poolAddress: string): Promise<types.ApiResponse> {
    try {
      const pool = await this.client.state.getPool(poolAddress);
      
      if (!pool) {
        return {
          success: false,
          error: 'Pool not found',
        };
      }

      return {
        success: true,
        pool,
      };
    } catch (error) {
      console.error('Error in getPoolState:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pool config state information
   */
  async getPoolConfigState(configAddress: string): Promise<types.ApiResponse> {
    try {
      const config = await this.client.state.getPoolConfig(configAddress);
      
      return {
        success: true,
        config,
      };
    } catch (error) {
      console.error('Error in getPoolConfigState:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pool migration progress
   */
  async getPoolCurveProgress(poolAddress: string): Promise<types.ApiResponse> {
    try {
      const progress = await this.client.state.getPoolCurveProgress(poolAddress);
      
      return {
        success: true,
        progress,
      };
    } catch (error) {
      console.error('Error in getPoolCurveProgress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get pool fee metrics
   */
  async getPoolFeeMetrics(poolAddress: string): Promise<types.ApiResponse> {
    try {
      const metrics = await this.client.state.getPoolFeeMetrics(new PublicKey(poolAddress));
      
      return {
        success: true,
        metrics,
      };
    } catch (error) {
      console.error('Error in getPoolFeeMetrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
} 