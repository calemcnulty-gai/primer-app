import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from '@/components/SplashScreen';
import { PrimerContent } from '@/components/PrimerContent';
import { useTheme } from '@/theme/ThemeProvider';

export default function PrimerApp() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <PrimerContent />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 