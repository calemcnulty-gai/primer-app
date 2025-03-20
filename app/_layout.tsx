import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { VoiceProvider } from '@/context/VoiceContext';
import VoiceIndicator from '@/components/VoiceIndicator';
import { store, persistor } from '../store';
import { Colors } from '@/constants/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Component to handle navigation theme
function NavigationTheme({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  
  // Customize navigation theme to match our e-ink theme
  const customNavigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.separator,
      primary: colors.tint,
    },
  };

  return (
    <NavigationThemeProvider value={customNavigationTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <VoiceProvider>
            <NavigationTheme>
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="index" />
              </Stack>
              <StatusBar style="dark" />
              <VoiceIndicator />
            </NavigationTheme>
          </VoiceProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
