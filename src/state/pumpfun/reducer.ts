// File: src/state/pumpfun/reducer.ts
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  launchTokenViaPumpfun,
  buyTokenViaPumpfun,
  sellTokenViaPumpfun,
} from '../../services/pumpfun/pumpfunService';

interface PumpfunState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  transactionSignature: string | null;
  mintedTokenAddress: string | null;
}

const initialState: PumpfunState = {
  status: 'idle',
  error: null,
  transactionSignature: null,
  mintedTokenAddress: null,
};

/**
 * Thunk: Launch a new token on Pumpfun
 */
export const launchTokenThunk = createAsyncThunk<
  {signature: string; mintPK: string},
  {
    privateKey: string;
    tokenName: string;
    tokenTicker: string;
    description: string;
    imageUrl: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  }
>(
  'pumpfun/launchToken',
  async ({
    privateKey,
    tokenName,
    tokenTicker,
    description,
    imageUrl,
    twitter,
    telegram,
    website,
  }) => {
    const {signature, mintPK} = await launchTokenViaPumpfun(
      privateKey,
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      {twitter, telegram, website},
    );
    return {signature, mintPK};
  },
);

/**
 * Thunk: Buy a token on Pumpfun
 */
export const buyTokenThunk = createAsyncThunk<
  {txSignature: string},
  {buyerPublicKey: string; tokenAddress: string; solAmount: number}
>('pumpfun/buyToken', async ({buyerPublicKey, tokenAddress, solAmount}) => {
  const txSignature = await buyTokenViaPumpfun(
    buyerPublicKey,
    tokenAddress,
    solAmount,
  );
  return {txSignature};
});

/**
 * Thunk: Sell a token on Pumpfun
 */
export const sellTokenThunk = createAsyncThunk<
  {txSignature: string},
  {sellerPublicKey: string; tokenAddress: string; tokenAmount: number}
>('pumpfun/sellToken', async ({sellerPublicKey, tokenAddress, tokenAmount}) => {
  const txSignature = await sellTokenViaPumpfun(
    sellerPublicKey,
    tokenAddress,
    tokenAmount,
  );
  return {txSignature};
});

const pumpfunSlice = createSlice({
  name: 'pumpfun',
  initialState,
  reducers: {
    resetPumpfunState: state => {
      state.status = 'idle';
      state.error = null;
      state.transactionSignature = null;
      state.mintedTokenAddress = null;
    },
  },
  extraReducers: builder => {
    // Launch
    builder.addCase(launchTokenThunk.pending, state => {
      state.status = 'loading';
      state.error = null;
      state.transactionSignature = null;
      state.mintedTokenAddress = null;
    });
    builder.addCase(launchTokenThunk.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.transactionSignature = action.payload.signature;
      state.mintedTokenAddress = action.payload.mintPK;
      state.error = null;
    });
    builder.addCase(launchTokenThunk.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Launch token failed';
    });

    // Buy
    builder.addCase(buyTokenThunk.pending, state => {
      state.status = 'loading';
      state.error = null;
      state.transactionSignature = null;
    });
    builder.addCase(buyTokenThunk.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.transactionSignature = action.payload.txSignature;
      state.error = null;
    });
    builder.addCase(buyTokenThunk.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Buy token failed';
    });

    // Sell
    builder.addCase(sellTokenThunk.pending, state => {
      state.status = 'loading';
      state.error = null;
      state.transactionSignature = null;
    });
    builder.addCase(sellTokenThunk.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.transactionSignature = action.payload.txSignature;
      state.error = null;
    });
    builder.addCase(sellTokenThunk.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Sell token failed';
    });
  },
});

export const {resetPumpfunState} = pumpfunSlice.actions;
export default pumpfunSlice.reducer;
