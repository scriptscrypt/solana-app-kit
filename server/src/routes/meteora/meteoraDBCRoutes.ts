import express, { Request, Response } from 'express';
import { Connection } from '@solana/web3.js';
import { MeteoraDBCService } from '../../service/MeteoraDBC/meteoraDBCService';
import * as types from '../../service/MeteoraDBC/types';
import { getConnection } from '../../utils/connection';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Get connection with confirmed commitment level
const connection = getConnection('confirmed');
const meteoraDBCService = new MeteoraDBCService(connection);

/**
 * Create a new config
 * @route POST /api/meteora/config
 */
router.post('/config', async (req: Request<{}, {}, types.CreateConfigParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createConfig(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createConfig route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Build curve and create config
 * @route POST /api/meteora/build-curve
 */
router.post('/build-curve', async (req: Request<{}, {}, types.BuildCurveAndCreateConfigParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.buildCurveAndCreateConfig(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in buildCurveAndCreateConfig route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Build curve by market cap and create config
 * @route POST /api/meteora/build-curve-by-market-cap
 */
router.post('/build-curve-by-market-cap', async (req: Request<{}, {}, types.BuildCurveAndCreateConfigByMarketCapParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.buildCurveAndCreateConfigByMarketCap(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in buildCurveAndCreateConfigByMarketCap route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create partner metadata
 * @route POST /api/meteora/partner-metadata
 */
router.post('/partner-metadata', async (req: Request<{}, {}, types.CreatePartnerMetadataParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createPartnerMetadata(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createPartnerMetadata route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Claim partner trading fee
 * @route POST /api/meteora/claim-partner-fee
 */
router.post('/claim-partner-fee', async (req: Request<{}, {}, types.ClaimTradingFeeParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.claimPartnerTradingFee(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in claimPartnerTradingFee route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Partner withdraw surplus
 * @route POST /api/meteora/partner-withdraw-surplus
 */
router.post('/partner-withdraw-surplus', async (req: Request<{}, {}, types.WithdrawSurplusParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.partnerWithdrawSurplus(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in partnerWithdrawSurplus route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create pool
 * @route POST /api/meteora/pool
 */
router.post('/pool', async (req: Request<{}, {}, types.CreatePoolParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createPool(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createPool route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create pool and buy
 * @route POST /api/meteora/pool-and-buy
 */
router.post('/pool-and-buy', async (req: Request<{}, {}, types.CreatePoolAndBuyParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createPoolAndBuy(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createPoolAndBuy route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Swap tokens
 * @route POST /api/meteora/swap
 */
router.post('/swap', async (req: Request<{}, {}, types.SwapParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.swap(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in swap route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create locker
 * @route POST /api/meteora/migration/locker
 */
router.post('/migration/locker', async (req: Request<{}, {}, types.CreateLockerParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createLocker(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createLocker route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Withdraw leftover
 * @route POST /api/meteora/migration/withdraw-leftover
 */
router.post('/migration/withdraw-leftover', async (req: Request<{}, {}, types.WithdrawLeftoverParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.withdrawLeftover(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in withdrawLeftover route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create DAMM V1 migration metadata
 * @route POST /api/meteora/migration/damm-v1-metadata
 */
router.post('/migration/damm-v1-metadata', async (req: Request<{}, {}, types.CreateDammV1MigrationMetadataParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createDammV1MigrationMetadata(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createDammV1MigrationMetadata route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Migrate to DAMM V1
 * @route POST /api/meteora/migration/damm-v1
 */
router.post('/migration/damm-v1', async (req: Request<{}, {}, types.MigrateToDammV1Param>, res: Response) => {
  try {
    const result = await meteoraDBCService.migrateToDammV1(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in migrateToDammV1 route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Lock DAMM V1 LP token
 * @route POST /api/meteora/migration/lock-damm-v1-lp
 */
router.post('/migration/lock-damm-v1-lp', async (req: Request<{}, {}, types.DammLpTokenParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.lockDammV1LpToken(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in lockDammV1LpToken route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Claim DAMM V1 LP token
 * @route POST /api/meteora/migration/claim-damm-v1-lp
 */
router.post('/migration/claim-damm-v1-lp', async (req: Request<{}, {}, types.DammLpTokenParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.claimDammV1LpToken(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in claimDammV1LpToken route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create DAMM V2 migration metadata
 * @route POST /api/meteora/migration/damm-v2-metadata
 */
router.post('/migration/damm-v2-metadata', async (req: Request<{}, {}, types.CreateDammV2MigrationMetadataParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createDammV2MigrationMetadata(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createDammV2MigrationMetadata route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Migrate to DAMM V2
 * @route POST /api/meteora/migration/damm-v2
 */
router.post('/migration/damm-v2', async (req: Request<{}, {}, types.MigrateToDammV2Param>, res: Response) => {
  try {
    const result = await meteoraDBCService.migrateToDammV2(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in migrateToDammV2 route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create pool metadata
 * @route POST /api/meteora/pool-metadata
 */
router.post('/pool-metadata', async (req: Request<{}, {}, types.CreatePoolMetadataParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.createPoolMetadata(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in createPoolMetadata route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Claim creator trading fee
 * @route POST /api/meteora/claim-creator-fee
 */
router.post('/claim-creator-fee', async (req: Request<{}, {}, types.ClaimCreatorTradingFeeParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.claimCreatorTradingFee(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in claimCreatorTradingFee route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Creator withdraw surplus
 * @route POST /api/meteora/creator-withdraw-surplus
 */
router.post('/creator-withdraw-surplus', async (req: Request<{}, {}, types.CreatorWithdrawSurplusParam>, res: Response) => {
  try {
    const result = await meteoraDBCService.creatorWithdrawSurplus(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in creatorWithdrawSurplus route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get pool state
 * @route GET /api/meteora/pool/:poolAddress
 */
router.get('/pool/:poolAddress', async (req: Request, res: Response) => {
  try {
    const { poolAddress } = req.params;
    const result = await meteoraDBCService.getPoolState(poolAddress);
    res.json(result);
  } catch (error) {
    console.error('Error in getPoolState route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get pool config state
 * @route GET /api/meteora/config/:configAddress
 */
router.get('/config/:configAddress', async (req: Request, res: Response) => {
  try {
    const { configAddress } = req.params;
    const result = await meteoraDBCService.getPoolConfigState(configAddress);
    res.json(result);
  } catch (error) {
    console.error('Error in getPoolConfigState route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get pool curve progress
 * @route GET /api/meteora/pool/:poolAddress/progress
 */
router.get('/pool/:poolAddress/progress', async (req: Request, res: Response) => {
  try {
    const { poolAddress } = req.params;
    const result = await meteoraDBCService.getPoolCurveProgress(poolAddress);
    res.json(result);
  } catch (error) {
    console.error('Error in getPoolCurveProgress route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get pool fee metrics
 * @route GET /api/meteora/pool/:poolAddress/fees
 */
router.get('/pool/:poolAddress/fees', async (req: Request, res: Response) => {
  try {
    const { poolAddress } = req.params;
    const result = await meteoraDBCService.getPoolFeeMetrics(poolAddress);
    res.json(result);
  } catch (error) {
    console.error('Error in getPoolFeeMetrics route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router; 