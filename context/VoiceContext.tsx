import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import VoiceService, { VoiceState } from '@/services/voice';
import { useAppDispatch } from '@/hooks/useRedux';
import { setVoiceState } from '@/store/slices/voiceSlice';

type VoiceContextType = {
  voiceState: VoiceState;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  isInitialized: boolean;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

type VoiceProviderProps = {
  children: ReactNode;
};

export const VoiceProvider = ({ children }: VoiceProviderProps) => {
  const [voiceService] = useState(() => VoiceService.getInstance());
  const [voiceState, setVoiceStateLocal] = useState<VoiceState>(voiceService.state);
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Subscribe to state changes from the voice service
    const unsubscribe = voiceService.subscribe((state) => {
      setVoiceStateLocal(state);
      dispatch(setVoiceState(state));
    });
    
    // Initialize the voice service
    const initializeVoiceService = async () => {
      try {
        await voiceService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize voice service:', error);
      }
    };
    
    initializeVoiceService();
    
    // Clean up when the provider is unmounted
    return () => {
      unsubscribe();
      voiceService.disconnect();
    };
  }, [dispatch]);
  
  const startListening = async () => {
    try {
      await voiceService.startListening();
    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  };
  
  const stopListening = async () => {
    try {
      await voiceService.stopListening();
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  };
  
  return (
    <VoiceContext.Provider
      value={{
        voiceState,
        startListening,
        stopListening,
        isInitialized,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

// Custom hook to use the voice context
export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};