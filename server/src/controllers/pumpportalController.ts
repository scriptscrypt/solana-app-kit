// File: server/src/controllers/pumpportalController.ts

import {Request, Response} from 'express';
import {URLSearchParams} from 'url';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import {Keypair, VersionedTransaction} from '@solana/web3.js';
import fetch from 'node-fetch'; // If Node <18. Otherwise, you can use global fetch.

export async function pumpportalLaunchController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      publicKey,
      tokenName,
      tokenSymbol,
      description,
      twitter,
      telegram,
      website,
      showName,
      mode,
    } = req.body;

    if (!publicKey || !tokenName || !tokenSymbol || !description) {
      res.status(400).json({
        success: false,
        error:
          'Missing required fields (publicKey, tokenName, tokenSymbol, description)',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error:
          'Image file is required (multipart/form-data field name: "image")',
      });
      return;
    }

    // Debug logging
    console.log('[pumpportalLaunchController] Multer file info:', req.file);

    // 1) Create ephemeral Keypair for the minted token
    const mintKeypair = Keypair.generate();
    console.log(
      '[pumpportalLaunchController] Ephemeral token mint:',
      mintKeypair.publicKey.toBase58(),
    );

    // 2) Build Pump.fun IPFS metadata from form-data
    const metadataParams = new URLSearchParams();
    metadataParams.append('name', tokenName);
    metadataParams.append('symbol', tokenSymbol);
    metadataParams.append('description', description);
    metadataParams.append('showName', showName === 'true' ? 'true' : 'false');
    if (twitter) metadataParams.append('twitter', twitter);
    if (telegram) metadataParams.append('telegram', telegram);
    if (website) metadataParams.append('website', website);

    const finalFormData = new FormData();
    // Add string fields
    for (const [key, value] of metadataParams.entries()) {
      finalFormData.append(key, value);
    }

    // Read the local file from multer's `req.file.path`
    const absolutePath = path.resolve(req.file.path);
    const fileBuffer = fs.readFileSync(absolutePath);

    // Add the image file
    finalFormData.append('file', fileBuffer, {
      filename: req.file.originalname || 'image.png',
      contentType: req.file.mimetype || 'image/png',
    });

    // 3) Upload metadata to pump.fun (for IPFS storage)
    const ipfsResponse = await fetch('https://pump.fun/api/ipfs', {
      method: 'POST',
      body: finalFormData,
      headers: finalFormData.getHeaders(),
    });

    if (!ipfsResponse.ok) {
      const errText = await ipfsResponse.text().catch(() => 'No body');
      res.status(ipfsResponse.status).json({
        success: false,
        error: `IPFS upload failed. ${ipfsResponse.statusText}`,
        details: errText,
      });
      return;
    }
    const ipfsData = (await ipfsResponse.json()) as {metadataUri?: string};
    if (!ipfsData.metadataUri) {
      res.status(500).json({
        success: false,
        error: 'Pump.fun IPFS response missing metadataUri',
        details: ipfsData,
      });
      return;
    }
    const metadataUri = ipfsData.metadataUri;
    console.log(
      '[pumpportalLaunchController] IPFS metadataUri =>',
      metadataUri,
    );

    // 4) Prepare the JSON payload for pumpportal
    //    Here we reduce dev-buy from "1 SOL" down to "0.01" to avoid the insufficient lamports error.
    const payload = {
      publicKey, // the user's public key
      action: 'create',
      tokenMetadata: {
        name: tokenName,
        symbol: tokenSymbol,
        uri: metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: 'true',
      amount: 0.01, // <-- REDUCED FROM 1 to 0.01 SOL
      slippage: 10,
      priorityFee: 0.0005, // e.g. 0.0005 SOL
      pool: 'pump',
    };

    let pumpportalUrl: string;
    let tradeResult: any;

    // 5) Switch on mode => "local" or "jito"
    if (mode === 'local') {
      // --------------------------------------------------
      // LOCAL Mode => returns a raw partially-signed VersionedTransaction
      // --------------------------------------------------
      pumpportalUrl = 'https://pumpportal.fun/api/trade-local';

      const tradeResponse = await fetch(pumpportalUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (!tradeResponse.ok) {
        res.status(tradeResponse.status).json({
          success: false,
          error: `Pumpportal trade-local error: ${tradeResponse.statusText}`,
        });
        return;
      }

      // The pumpportal in `trade-local` returns the raw transaction bytes, not JSON
      const tradeBuffer = await tradeResponse.arrayBuffer();

      // Convert to VersionedTransaction
      const versionedTx = VersionedTransaction.deserialize(
        Buffer.from(tradeBuffer),
      );

      // Partially sign with the ephemeral mint key
      versionedTx.sign([mintKeypair]);

      // Then re-serialize and pass back to the client
      const localTxBase64 = Buffer.from(versionedTx.serialize()).toString(
        'base64',
      );
      tradeResult = {transaction: localTxBase64};
    } else if (mode === 'jito') {
      // --------------------------------------------------
      // JITO Bundled => standard JSON response from pumpportal
      // --------------------------------------------------
      // Usually you attach `?api-key=YOUR_API_KEY`
      pumpportalUrl = `https://pumpportal.fun/api/trade?api-key=${
        process.env.PUMPPORTAL_API_KEY || ''
      }`;

      const tradeResponse = await fetch(pumpportalUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (!tradeResponse.ok) {
        res.status(tradeResponse.status).json({
          success: false,
          error: `Pumpportal JITO error: ${tradeResponse.statusText}`,
        });
        return;
      }

      // The JITO flow typically returns an object with { success, signature, bundle info, etc. }
      tradeResult = await tradeResponse.json();
    } else {
      // Invalid mode
      res.status(400).json({
        success: false,
        error: 'Invalid mode. Must be "local" or "jito".',
      });
      return;
    }

    // 6) Return final JSON to the client
    res.json({
      success: true,
      mintPublicKey: mintKeypair.publicKey.toBase58(),
      tradeResult,
    });
  } catch (error: any) {
    console.error('[pumpportalLaunchController] ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown server error during token launch.',
    });
  }
}
