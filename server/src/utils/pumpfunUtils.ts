// File: server/src/utils/pumpfunUtils.ts

import {
  TransactionInstruction,
  PublicKey,
  Keypair,
  Transaction,
} from '@solana/web3.js';

/**
 * Convert a number (64-bit) to little-endian UInt64 buffer.
 */
export function bufferFromUInt64(num: number): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(num), 0);
  return buf;
}

/**
 * Pump.fun instructions expect "2-byte length prefix + the UTF-8 string".
 */
export function bufferFromString(str: string): Buffer {
  const utf8 = Buffer.from(str, 'utf8');
  const lenBuf = Buffer.alloc(2);
  lenBuf.writeUInt16LE(utf8.length, 0);
  return Buffer.concat([lenBuf, utf8]);
}
