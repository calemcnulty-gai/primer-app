import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define state type
interface CounterState {
  value: number;
}

// Define initial state
const initialState: CounterState = {
  value: 0,
};

// Create slice
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    reset: (state) => {
      state.value = 0;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// Export actions
export const { increment, decrement, reset, incrementByAmount } = counterSlice.actions;

// Export selectors
export const selectCount = (state: RootState) => state.counter.value;

// Export reducer
export default counterSlice.reducer; 