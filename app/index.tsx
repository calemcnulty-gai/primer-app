import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from '@/components/SplashScreen';
import { useTheme } from '@/theme/ThemeProvider';
import { Redirect } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function PrimerApp() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // After splash screen, redirect to the tabbed interface with Story mode
  if (!showSplash) {
    return (
      <ErrorBoundary>
        <Redirect href="/(tabs)" />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" />
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 