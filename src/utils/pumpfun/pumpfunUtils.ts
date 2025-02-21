// File: src/utils/pumpfun/pumpfunUtils.ts

import {
  PublicKey,
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {AnchorProvider} from '@coral-xyz/anchor';
import {
  GLOBAL,
  PUMP_FUN_PROGRAM,
  PUMP_FUN_ACCOUNT,
  MINT_AUTHORITY,
  MPL_TOKEN_METADATA,
  SYSTEM_PROGRAM,
  RENT,
  COMPUTE_BUDGET_PROGRAM_ID,
  PUMP_FUN_LAUNCH_DISCRIMINATOR,
  DEFAULT_COMPUTE_MICRO_LAMPORTS,
} from './pumpfunConstants';

import {Buffer} from 'buffer';

// --- NEW: Pinata for IPFS uploads ---
import {PinataSDK} from 'pinata-web3';

/**
 * Returns an AnchorProvider using a dummy wallet.
 */
export function getProvider(): AnchorProvider {
  const connection = new Connection(
    // Use your chain’s endpoint:
    `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
    'confirmed',
  );
  // Just a dummy signer for AnchorProvider:
  const dummyWallet = {
    publicKey: new PublicKey('11111111111111111111111111111111'),
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };
  return new AnchorProvider(connection, dummyWallet, {
    commitment: 'confirmed',
  });
}

/** Encode a 64-bit integer into a little-endian Buffer. */
export function encodeU64(value: number): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value), 0);
  return buffer;
}

/** Convert a UTF-8 string to a Buffer with 2-byte length prefix (the Pump.fun format). */
export function bufferFromString(str: string): Buffer {
  const utf8 = Buffer.from(str, 'utf8');
  const lenBuffer = Buffer.alloc(2);
  lenBuffer.writeUInt16LE(utf8.length, 0);
  return Buffer.concat([lenBuffer, utf8]);
}

/**
 * Upload metadata to Pinata instead of Pump.fun’s API.
 *
 * We generate a JSON object with your token fields,
 * then upload via Pinata’s `upload.json(...)`.
 */
export async function uploadPinataMetadata(
  tokenName: string,
  tokenSymbol: string,
  description: string,
  imageUrl: string,
  additionalOptions?: Record<string, any>,
): Promise<string> {
  // Initialize Pinata. Replace these with your actual JWT and gateway if needed.
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT || '', // must be set
    pinataGateway:
      process.env.PINATA_GATEWAY || 'example-gateway.mypinata.cloud',
  });

  // Basic JSON structure
  const metadataJson = {
    name: tokenName,
    symbol: tokenSymbol,
    description,
    image: imageUrl,
    // If you want “attributes” or other fields:
    attributes: [],
    ...(additionalOptions || {}),
  };

  // Upload to Pinata as JSON
  const result = await pinata.upload.json(metadataJson);
  if (!result?.IpfsHash) {
    throw new Error(
      `Pinata upload returned invalid data: ${JSON.stringify(result)}`,
    );
  }

  // Return an ipfs:// URI
  return `ipfs://${result.IpfsHash}`;
}

/**
 * Build a "launch token" Transaction for PumpFun.
 * (unchanged from your original code, except for references to the old “uploadPumpfunMetadata.”)
 */
export async function buildPumpfunLaunchTransaction(params: {
  connection: Connection;
  payerPubkey: PublicKey;
  tokenName: string;
  tokenSymbol: string;
  uri: string;
  microLamports?: number;
}): Promise<{
  transaction: Transaction;
  mintKeypair: Keypair;
  mintPubkey: string;
}> {
  const {connection, payerPubkey, tokenName, tokenSymbol, uri, microLamports} =
    params;
  const mintKeypair = Keypair.generate();
  const mintPubkey = mintKeypair.publicKey.toBase58();

  const [bondingCurve] = await PublicKey.findProgramAddress(
    [Buffer.from('bonding-curve'), mintKeypair.publicKey.toBuffer()],
    PUMP_FUN_PROGRAM,
  );
  const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [
      bondingCurve.toBuffer(),
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
  );
  const [metadata] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      MPL_TOKEN_METADATA.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    MPL_TOKEN_METADATA,
  );

  const transaction = new Transaction();

  // Set compute budget
  const finalCompute = microLamports ?? DEFAULT_COMPUTE_MICRO_LAMPORTS;
  const computeData = Buffer.concat([
    Buffer.from(Uint8Array.of(3)), // "SetComputeUnitPrice"
    encodeU64(finalCompute),
  ]);
  const computeBudgetIx = new TransactionInstruction({
    keys: [],
    programId: COMPUTE_BUDGET_PROGRAM_ID,
    data: computeData,
  });
  transaction.add(computeBudgetIx);

  // Pump.fun launch instruction
  const keys = [
    {pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true},
    {pubkey: MINT_AUTHORITY, isSigner: false, isWritable: false},
    {pubkey: bondingCurve, isSigner: false, isWritable: true},
    {pubkey: associatedBondingCurve, isSigner: false, isWritable: true},
    {pubkey: GLOBAL, isSigner: false, isWritable: false},
    {pubkey: MPL_TOKEN_METADATA, isSigner: false, isWritable: false},
    {pubkey: metadata, isSigner: false, isWritable: true},
    {pubkey: payerPubkey, isSigner: true, isWritable: true},
    {pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false},
    {
      pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
      isSigner: false,
      isWritable: false,
    },
    {pubkey: RENT, isSigner: false, isWritable: false},
    {pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false},
    {pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false},
  ];

  // Our name, symbol, URI -> 2-byte-length strings
  const nameBuffer = bufferFromString(tokenName);
  const symbolBuffer = bufferFromString(tokenSymbol);
  const uriBuffer = bufferFromString(uri);

  const data = Buffer.concat([
    PUMP_FUN_LAUNCH_DISCRIMINATOR,
    nameBuffer,
    symbolBuffer,
    uriBuffer,
  ]);

  const launchIx = new TransactionInstruction({
    keys,
    programId: PUMP_FUN_PROGRAM,
    data,
  });
  transaction.add(launchIx);

  const blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashObj.blockhash;
  transaction.feePayer = payerPubkey;
  transaction.sign(mintKeypair);

  return {transaction, mintKeypair, mintPubkey};
}
