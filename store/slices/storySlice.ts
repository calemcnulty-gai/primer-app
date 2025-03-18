import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, StorySegment } from '@/services/api';

// Define the initial state
interface StoryState {
  currentSegment: StorySegment | null;
  isLoading: boolean;
  error: string | null;
  isTransitioning: boolean;
}

const initialState: StoryState = {
  currentSegment: null,
  isLoading: false,
  error: null,
  isTransitioning: false,
};

// Async thunks
export const fetchCurrentSegment = createAsyncThunk(
  'story/fetchCurrentSegment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.story.getCurrentSegment();
      
      // Handle API response format with success/data fields
      if (response.success === false) {
        return rejectWithValue('Failed to fetch story segment');
      }
      
      if (response.data) {
        return response.data;
      }
      
      // Handle new API response format where segment is at the top level
      if (response.segment) {
        return {
          segmentId: response.segment.id,
          title: response.segment.id.charAt(0).toUpperCase() + response.segment.id.slice(1),
          content: response.segment.content,
          choices: response.segment.choices ? response.segment.choices.map(choice => ({
            choiceId: choice.id,
            text: choice.text
          })) : []
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching story segment:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch story segment');
    }
  }
);

export const makeChoice = createAsyncThunk(
  'story/makeChoice',
  async (choiceId: string, { rejectWithValue }) => {
    try {
      const response = await api.story.makeChoice(choiceId);
      
      // Handle API response format with success/data fields
      if (response.success === false) {
        return rejectWithValue('Failed to make choice');
      }
      
      if (response.data) {
        return response.data;
      }
      
      // Handle new API response format where segment is at the top level
      if (response.segment) {
        return {
          segmentId: response.segment.id,
          title: response.segment.id.charAt(0).toUpperCase() + response.segment.id.slice(1),
          content: response.segment.content,
          choices: response.segment.choices ? response.segment.choices.map(choice => ({
            choiceId: choice.id,
            text: choice.text
          })) : []
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error making choice:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to make choice');
    }
  }
);

export const resetStory = createAsyncThunk(
  'story/resetStory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.story.resetStory();
      if (response.success === false) {
        return rejectWithValue('Failed to reset story');
      }
      
      if (response.data) {
        return response.data;
      }
      
      // Handle new API response format where segment is at the top level
      if (response.segment) {
        return {
          segmentId: response.segment.id,
          title: response.segment.id.charAt(0).toUpperCase() + response.segment.id.slice(1),
          content: response.segment.content,
          choices: response.segment.choices ? response.segment.choices.map(choice => ({
            choiceId: choice.id,
            text: choice.text
          })) : []
        };
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to reset story');
    }
  }
);

// Create the slice
const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setTransitioning: (state, action: PayloadAction<boolean>) => {
      state.isTransitioning = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCurrentSegment
    builder
      .addCase(fetchCurrentSegment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSegment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSegment = action.payload;
      })
      .addCase(fetchCurrentSegment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Handle makeChoice
    builder
      .addCase(makeChoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(makeChoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSegment = action.payload;
        state.isTransitioning = false;
      })
      .addCase(makeChoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isTransitioning = false;
      });
    
    // Handle resetStory
    builder
      .addCase(resetStory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetStory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSegment = action.payload;
      })
      .addCase(resetStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTransitioning } = storySlice.actions;
export default storySlice.reducer;