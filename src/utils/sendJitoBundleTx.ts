import {
    Connection,
    PublicKey,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage,
    ComputeBudgetProgram,
    clusterApiUrl,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { sendJitoBundle } from './jitoBundling';
import { SystemProgram } from '@solana/web3.js';

export async function sendJitoBundleTransaction(
    provider: any,
    feeTier: 'low' | 'medium' | 'high' | 'very-high',
    instructions: TransactionInstruction[],
    walletPublicKey: PublicKey,
): Promise<string> {
    console.log('[sendJitoBundleTransaction] Starting transaction preparation.');

    // IMPORTANT: Use mainnet-beta connection for mainnet transactions.
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    console.log('[sendJitoBundleTransaction] Established connection to mainnet-beta.');

    // Use plain number literals for compatibility.
    const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 2000000 });
    const feeMapping: Record<string, number> = {
        low: 100000,
        medium: 5000000,
        high: 100000000,
        'very-high': 2000000000,
    };
    const microLamports = feeMapping[feeTier];
    const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports });
    console.log(`[sendJitoBundleTransaction] Fee tier: ${feeTier}, MicroLamports: ${microLamports}`);

    // Create a tip instruction. This transfers 0 lamports to a designated tip account.
    // Ensure that the tip account is valid on mainnet.
    const tipAccount = new PublicKey('HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe');
    const tipInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: tipAccount,
        lamports: 1000,
    });

    // IMPORTANT: The tip instruction must be included (and ideally first) so that the bundle write-locks a tip account.
    const allInstructions = [tipInstruction, computeUnitLimitIx, computeUnitPriceIx, ...instructions];
    console.log('[sendJitoBundleTransaction] Combined all instructions.');

    // Fetch the latest blockhash from mainnet-beta.
    const { blockhash } = await connection.getLatestBlockhash();
    console.log(`[sendJitoBundleTransaction] Fetched latest blockhash: ${blockhash}`);

    const messageV0 = new TransactionMessage({
        payerKey: walletPublicKey,
        recentBlockhash: blockhash,
        instructions: allInstructions,
    }).compileToV0Message();
    console.log('[sendJitoBundleTransaction] Compiled TransactionMessage to V0.');

    const transaction = new VersionedTransaction(messageV0);
    console.log('[sendJitoBundleTransaction] Created VersionedTransaction.');

    // Serialize only the TransactionMessage (not the whole transaction)
    const serializedMessage = transaction.message.serialize();
    const base64Message = Buffer.from(serializedMessage).toString('base64');
    console.log('[sendJitoBundleTransaction] Serialized transaction message to base64.');

    // Request the provider to sign the message
    const signResult = await provider.request({
        method: 'signMessage',
        params: {
            message: base64Message,
        },
    });
    console.log('[sendJitoBundleTransaction] Received signResult from provider.');

    if (!signResult || typeof signResult.signature !== 'string') {
        console.error('[sendJitoBundleTransaction] Invalid signResult format:', signResult);
        throw new Error('Provider did not return a valid signature.');
    }

    // Add the signature to the transaction
    const signatureBuffer = Buffer.from(signResult.signature, 'base64');
    transaction.addSignature(walletPublicKey, signatureBuffer);
    console.log('[sendJitoBundleTransaction] Added signature to transaction.');

    // Verify that the transaction is valid
    try {
        VersionedTransaction.deserialize(transaction.serialize());
        console.log('[sendJitoBundleTransaction] Transaction signature is valid.');
    } catch (error) {
        console.error('[sendJitoBundleTransaction] Invalid signature:', error);
        throw new Error('Invalid signature from provider.');
    }

    // Send the signed transaction to Jito’s block engine
    const bundleResponse = await sendJitoBundle([transaction]);
    if (bundleResponse?.result) {
        console.log('[sendJitoBundleTransaction] Bundle sent successfully:', bundleResponse.result);
        return bundleResponse.result;
    } else {
        console.error('[sendJitoBundleTransaction] Jito bundling failed:', bundleResponse);
        throw new Error('Jito bundling failed');
    }
}
