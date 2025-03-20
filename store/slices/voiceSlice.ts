import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VoiceState } from '@/services/voice';

export interface VoiceInteraction {
  id: string;
  timestamp: number;
  text?: string;
  isUser: boolean;
}

interface VoiceSliceState extends VoiceState {
  recentInteractions: VoiceInteraction[];
}

const initialState: VoiceSliceState = {
  isConnected: false,
  isListening: false,
  isSpeaking: false,
  error: null,
  recentInteractions: [],
};

export const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    setVoiceState: (state, action: PayloadAction<VoiceState>) => {
      const { isConnected, isListening, isSpeaking, error } = action.payload;
      state.isConnected = isConnected;
      state.isListening = isListening;
      state.isSpeaking = isSpeaking;
      state.error = error;
    },
    addVoiceInteraction: (state, action: PayloadAction<VoiceInteraction>) => {
      state.recentInteractions.push(action.payload);
      // Keep only the last 10 interactions
      if (state.recentInteractions.length > 10) {
        state.recentInteractions.shift();
      }
    },
    clearVoiceInteractions: (state) => {
      state.recentInteractions = [];
    },
  },
});

export const {
  setVoiceState,
  addVoiceInteraction,
  clearVoiceInteractions,
} = voiceSlice.actions;

export default voiceSlice.reducer;