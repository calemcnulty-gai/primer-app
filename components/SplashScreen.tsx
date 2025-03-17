import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(1000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call the onFinish callback when animations complete
      onFinish();
    });
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View style={styles.bookFrame}>
          <View style={[styles.bookCover, { backgroundColor: colors.paperTexture }]}>
            <ThemedText style={styles.title}>The Young Lady's</ThemedText>
            <ThemedText style={styles.subtitle}>Illustrated Primer</ThemedText>
            <View style={styles.decorativeLine} />
            <ThemedText style={styles.edition}>A Digital Edition</ThemedText>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookFrame: {
    width: 280,
    height: 400,
    borderWidth: 2,
    borderColor: '#5b4636',
    padding: 15,
    backgroundColor: '#f8f3e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bookCover: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8a7b6b',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    marginBottom: 30,
  },
  decorativeLine: {
    width: 150,
    height: 2,
    backgroundColor: '#8a7b6b',
    marginBottom: 30,
  },
  edition: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    fontStyle: 'italic',
  },
}); 