// File: src/utils/fetch.ts

export async function fetchWithRetries(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelay = 500,
): Promise<Response> {
  let attempt = 0;
  let lastError: any;

  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        // e.g. 429, 5xx
        const bodyText = await res.text();
        throw new Error(`HTTP status ${res.status}, body=${bodyText}`);
      }
      return res;
    } catch (err: any) {
      lastError = err;
      attempt++;
      if (attempt >= maxRetries) break;

      // Exponential backoff
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.warn(
        `[fetchWithRetries] Attempt ${attempt} failed: ${err.message}.\nRetrying after ${delayMs}ms...`,
      );
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error(
    `[fetchWithRetries] All ${maxRetries} attempts failed. Last error: ${
      lastError?.message ?? lastError
    }`,
  );
}

// File: src/utils/solanaWithRetries.ts
import {Connection, PublicKey} from '@solana/web3.js';

export async function getBalanceWithRetries(
  connection: Connection,
  pubkey: PublicKey,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<number> {
  let attempt = 0;
  let lastError: any;
  while (attempt < maxRetries) {
    try {
      return await connection.getBalance(pubkey);
    } catch (err: any) {
      lastError = err;
      attempt++;
      if (attempt >= maxRetries) break;

      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.warn(
        `[getBalanceWithRetries] Attempt ${attempt} failed: ${err.message}. Retrying after ${delayMs}ms...`,
      );
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error(
    `[getBalanceWithRetries] All ${maxRetries} attempts failed. Last error: ${
      lastError?.message || lastError
    }`,
  );
}
