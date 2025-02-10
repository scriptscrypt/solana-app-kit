// File: /src/state/store.ts
import {configureStore} from '@reduxjs/toolkit';
import threadReducer from './thread/reducer';
import authReducer from './auth/reducer';
import tradeReducer from './trade/tradeSlice';

export const store = configureStore({
  reducer: {
    thread: threadReducer,
    auth: authReducer,
    trade: tradeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
