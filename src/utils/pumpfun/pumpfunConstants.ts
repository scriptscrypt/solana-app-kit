/**
 * File: src/services/pumpfun/pumpfunConstants.ts
 *
 * This file contains program IDs, accounts, and other constants
 * needed for interacting with the Pumpfun on-chain program.
 */

import {PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY} from '@solana/web3.js';

/** Pump.fun Program and global references */
export const PUMP_FUN_PROGRAM = new PublicKey(
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
);
export const PUMP_FUN_ACCOUNT = new PublicKey(
  'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1',
);

/** Common system addresses */
export const GLOBAL = new PublicKey(
  '4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf',
);
export const SYSTEM_PROGRAM = SystemProgram.programId;
export const RENT = SYSVAR_RENT_PUBKEY;

/** The program authority that can mint */
export const MINT_AUTHORITY = new PublicKey(
  'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM',
);

/** The on-chain metadata program (Metaplex) */
export const MPL_TOKEN_METADATA = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

/** The Pump.fun "init" or global config account */
export const COMPUTE_BUDGET_PROGRAM_ID = new PublicKey(
  'ComputeBudget111111111111111111111111111111',
);

/** For generating the instruction data, we use this prefix:
 * "181ec828051c0777" is the 8-byte discriminator that Pumpfun's program expects
 * for the "create token" instruction.
 */
export const PUMP_FUN_LAUNCH_DISCRIMINATOR = Buffer.from(
  '181ec828051c0777',
  'hex',
);

/** Default setting for compute units (microLamports) if not overridden */
export const DEFAULT_COMPUTE_MICRO_LAMPORTS = 100000;
