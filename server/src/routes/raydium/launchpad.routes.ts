import express from 'express';
import { RaydiumLaunchpadService } from '../../service/raydium/launchpadService';

const router = express.Router();

/**
 * @route   POST /api/raydium/launchpad/create
 * @desc    Create and launch a token on Raydium
 * @access  Public
 */
router.post('/create', async (req: any, res: any) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      decimals, // We'll override this with 9
      description,
      uri,
      twitter,
      telegram,
      website,
      imageData,
      quoteTokenMint,
      tokenSupply,
      solRaised,
      bondingCurvePercentage,
      poolMigration, 
      vestingPercentage,
      vestingDuration,
      vestingCliff,
      enableFeeSharingPost,
      userPublicKey,
      mode // Extract the mode parameter
    } = req.body;

    // Validate required fields
    if (!tokenName || !tokenSymbol || !quoteTokenMint || !tokenSupply || !userPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Create metadata URI if needed
    const metadataUri = uri || await RaydiumLaunchpadService.generateMetadataUri({
      name: tokenName,
      symbol: tokenSymbol,
      description,
      image: imageData,
      external_url: website,
      twitter,
      telegram
    });

    // Generate and return the transaction
    const result = await RaydiumLaunchpadService.createLaunchpadToken({
      tokenName,
      tokenSymbol,
      decimals: 9, // Always use 9 decimals for Solana tokens regardless of input
      metadataUri,
      quoteTokenMint,
      tokenSupply: tokenSupply.toString(),
      solRaised: solRaised.toString(), 
      bondingCurvePercentage: bondingCurvePercentage.toString(),
      poolMigration: poolMigration.toString(),
      vestingPercentage: vestingPercentage?.toString() || '0',
      vestingDuration: vestingDuration?.toString(),
      vestingCliff: vestingCliff?.toString(),
      enableFeeSharingPost: enableFeeSharingPost === true,
      userPublicKey,
      mode: mode || 'justSendIt' // Default to justSendIt if not specified
    });

    // Return the result to the client
    return res.json({
      success: true,
      transaction: result.transaction,
      mintAddress: result.mintAddress,
      poolId: result.poolId
    });
  } catch (error: any) {
    console.error('[LaunchpadRoutes] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while creating the token'
    });
  }
});

export default router; 