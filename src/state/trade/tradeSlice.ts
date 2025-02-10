// File: src/state/trade/tradeSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionMode = 'jito' | 'priority';
export type FeeTier = 'low' | 'medium' | 'high' | 'very-high';

interface TradeState {
  transactionMode: TransactionMode;
  feeTier: FeeTier;
}

const initialState: TradeState = {
  transactionMode: 'priority',
  feeTier: 'medium',
};

const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    setTransactionMode(state, action: PayloadAction<TransactionMode>) {
      state.transactionMode = action.payload;
    },
    setFeeTier(state, action: PayloadAction<FeeTier>) {
      state.feeTier = action.payload;
    },
  },
});

export const { setTransactionMode, setFeeTier } = tradeSlice.actions;
export default tradeSlice.reducer;
