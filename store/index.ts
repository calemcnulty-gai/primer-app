import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { 
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER 
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dummy reducer to fix "Store does not have a valid reducer" error
const dummyReducer = (state = {}, action: any) => {
  return state;
};

// Configure redux-persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['story', 'rtvi', 'voice'] // Persist story, rtvi, and voice state between app sessions
};

// Import reducers
import storyReducer from './slices/storySlice';
import rtviReducer from './slices/rtviSlice';
import voiceReducer from './slices/voiceSlice';

// Combine reducers
const rootReducer = combineReducers({
  // Add your reducers here
  dummy: dummyReducer,
  story: storyReducer,
  rtvi: rtviReducer,
  voice: voiceReducer
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 