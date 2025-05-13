import express from 'express';
import {PublicKey, Keypair, Transaction, VersionedTransaction} from '@solana/web3.js';
import {RaydiumLaunchpadService} from '../../service/raydium/launchpadService';
import {txToBase64} from '@raydium-io/raydium-sdk-v2';
import {Buffer} from 'buffer';

const router = express.Router();

/**
 * @route   POST /api/raydium/launchpad/get-parameters
 * @desc    Get token launch parameters for client-side tx creation
 * @access  Public
 */
router.post('/get-parameters', async (req: any, res: any) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      decimals,
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
      mode,
    } = req.body;

    // Validate required fields
    if (
      !tokenName ||
      !tokenSymbol ||
      !quoteTokenMint ||
      !tokenSupply ||
      !userPublicKey
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
    }

    // Validate user public key
    try {
      // Check if the public key is valid
      const pubKey = new PublicKey(userPublicKey);
      
      // Verify the public key is on the ed25519 curve
      if (!PublicKey.isOnCurve(pubKey)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user public key: not on ed25519 curve',
        });
      }
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        error: `Invalid user public key: ${e.message}`,
      });
    }

    // Create metadata URI if needed
    const metadataUri =
      uri ||
      (await RaydiumLaunchpadService.generateMetadataUri({
        name: tokenName,
        symbol: tokenSymbol,
        description,
        image: imageData,
        external_url: website,
        twitter,
        telegram,
      }));

    try {
      // Generate launch parameters
      const launchParams = await RaydiumLaunchpadService.generateLaunchParameters({
        tokenName,
        tokenSymbol,
        decimals: 9, // Always use 9 decimals for Solana tokens
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
        mode: mode || 'justSendIt',
      });

      // Return parameters to the client
      return res.json({
        success: true,
        parameters: launchParams,
      });
    } catch (error: any) {
      console.error('[LaunchpadRoutes] Error generating parameters:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate launch parameters',
      });
    }
  } catch (error: any) {
    console.error('[LaunchpadRoutes] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred',
    });
  }
});

/**
 * @route   POST /api/raydium/launchpad/sign-transaction
 * @desc    Signs a transaction with server-side keypair for launchpad operations
 * @access  Public
 */
router.post('/sign-transaction', async (req: any, res: any) => {
  try {
    const {tx} = req.body;
    
    if (!tx) {
      return res.status(400).json({
        success: false,
        error: 'Missing transaction data',
      });
    }
    
    try {
      // Use the dedicated method for signing transactions
      const signedTx = await RaydiumLaunchpadService.signTransaction(tx);
      
      // Return the signed transaction
      return res.json({
        success: true,
        tx: signedTx,
      });
    } catch (error: any) {
      console.error('[LaunchpadRoutes] Error signing transaction:', error);
      return res.status(400).json({
        success: false,
        error: `Failed to sign transaction: ${error.message}`,
      });
    }
  } catch (error: any) {
    console.error('[LaunchpadRoutes] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while signing the transaction',
    });
  }
});

/**
 * @route   POST /api/raydium/launchpad/create
 * @desc    Create and launch a token on Raydium (legacy endpoint)
 * @access  Public
 */
router.post('/create', async (req: any, res: any) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      decimals,
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
      mode,
    } = req.body;

    // Validate required fields
    if (
      !tokenName ||
      !tokenSymbol ||
      !quoteTokenMint ||
      !tokenSupply ||
      !userPublicKey
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
    }

    // Validate user public key
    try {
      // Check if the public key is valid
      const pubKey = new PublicKey(userPublicKey);
      
      // Verify the public key is on the ed25519 curve
      if (!PublicKey.isOnCurve(pubKey)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user public key: not on ed25519 curve',
        });
      }
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        error: `Invalid user public key: ${e.message}`,
      });
    }

    // Create metadata URI if needed
    const metadataUri =
      uri ||
      (await RaydiumLaunchpadService.generateMetadataUri({
        name: tokenName,
        symbol: tokenSymbol,
        description,
        image: imageData,
        external_url: website,
        twitter,
        telegram,
      }));

    // Note: This endpoint is now mainly for backward compatibility
    // We recommend using the new get-parameters and sign-transaction endpoints
    console.log('[LaunchpadRoutes] Warning: Using legacy /create endpoint. Consider using the new flow.');

    try {
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
        mode: mode || 'justSendIt', // Default to justSendIt if not specified
      });

      // Return the result to the client
      return res.json({
        success: true,
        transaction: result.transaction,
        mintAddress: result.mintAddress,
        poolId: result.poolId,
      });
    } catch (error: any) {
      // Check for specific error about user's public key not being in transaction
      if (error.message?.includes('does not contain user\'s public key')) {
        console.error('[LaunchpadRoutes] User public key error:', error.message);
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'USER_KEY_NOT_IN_TX',
        });
      }
      
      // Other errors
      throw error;
    }
  } catch (error: any) {
    console.error('[LaunchpadRoutes] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while creating the token',
    });
  }
});

export default router;
