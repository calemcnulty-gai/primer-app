import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from '@/components/SplashScreen';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { Redirect } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';

// import { RNDailyTransport } from '@pipecat-ai/react-native-daily-transport';
// import { RTVIClient } from '@pipecat-ai/client-js';
// import { RTVIClientAudio } from '@pipecat-ai/react-native-daily-transport';

// // Create and configure the client
// let voiceClient = new RTVIClient({
//   // @ts-ignore
//   transport: new RNDailyTransport(),
//   params: {
//     baseUrl: 'http://18.117.223.199:8000',
//     requestData: {
//       apiKey: 'OER0he3w4SKAH12dL7ZVYlSphxeVjfk9',
//       voice: '',
//       //messages: [],
//       //tools: [],
//     },
//   },
// });

// voiceClient.connect();

// Actual app content inside ThemeProvider
function AppContent() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [readyToRedirect, setReadyToRedirect] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
    
    // On Android, add a small delay before redirecting to give the app time to fully initialize
    if (Platform.OS === 'android') {
      setTimeout(() => {
        setReadyToRedirect(true);
      }, 1000);
    } else {
      setReadyToRedirect(true);
    }
  };

  // After splash screen, redirect to the tabbed interface with Story mode
  if (!showSplash && readyToRedirect) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <SplashScreen onFinish={handleSplashFinish} />
    </View>
  );
}

// Main app component with proper providers
export default function PrimerApp() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 