import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, RtviMessage, RtviResponse } from '@/services/api';

// Define the initial state
interface RtviState {
  conversation: RtviMessage[];
  isLoading: boolean;
  error: string | null;
  isListening: boolean;
}

const initialState: RtviState = {
  conversation: [],
  isLoading: false,
  error: null,
  isListening: false,
};

// Async thunks
export const fetchConversation = createAsyncThunk(
  'rtvi/fetchConversation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.rtvi.getConversation();
      
      if (!response.success) {
        return rejectWithValue('Failed to fetch conversation');
      }
      
      return response.conversation;
    } catch (error) {
      console.error('Error fetching RTVI conversation:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch RTVI conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'rtvi/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      const response = await api.rtvi.sendMessage(message);
      
      if (!response.success) {
        return rejectWithValue('Failed to send message');
      }
      
      return response;
    } catch (error) {
      console.error('Error sending RTVI message:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to send RTVI message');
    }
  }
);

export const startNewConversation = createAsyncThunk(
  'rtvi/startNewConversation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.rtvi.startNewConversation();
      
      if (!response.success) {
        return rejectWithValue('Failed to start new conversation');
      }
      
      return response.conversation;
    } catch (error) {
      console.error('Error starting new RTVI conversation:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to start new RTVI conversation');
    }
  }
);

// Create the slice
const rtviSlice = createSlice({
  name: 'rtvi',
  initialState,
  reducers: {
    setListening: (state, action: PayloadAction<boolean>) => {
      state.isListening = action.payload;
    },
    addLocalMessage: (state, action: PayloadAction<Omit<RtviMessage, 'id'>>) => {
      const newMessage = {
        ...action.payload,
        id: `local-${Date.now()}`,
      };
      state.conversation.push(newMessage);
    },
  },
  extraReducers: (builder) => {
    // Handle fetchConversation
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Handle sendMessage
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversation = action.payload.conversation;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Handle startNewConversation
    builder
      .addCase(startNewConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startNewConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversation = action.payload;
      })
      .addCase(startNewConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setListening, addLocalMessage } = rtviSlice.actions;
export default rtviSlice.reducer;
