import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { useVoice } from '@/context/VoiceContext';
import { useTheme } from '@/theme/ThemeProvider';

const { width } = Dimensions.get('window');

export default function VoiceIndicator() {
  const { voiceState, startListening, stopListening } = useVoice();
  const { colors } = useTheme();
  const animation = useRef(new Animated.Value(0)).current;
  
  // Animate dots when listening or speaking
  useEffect(() => {
    if (voiceState.isListening || voiceState.isSpeaking) {
      // Create continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation when not listening/speaking
      animation.stopAnimation();
      animation.setValue(0);
    }
  }, [voiceState.isListening, voiceState.isSpeaking, animation]);
  
  // Scale interpolation for dots
  const firstDotScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5]
  });
  
  const secondDotScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8]
  });
  
  const thirdDotScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5]
  });
  
  // Toggle voice listening
  const toggleVoice = async () => {
    if (voiceState.isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };
  
  // Determine indicator color based on state
  const getIndicatorColor = () => {
    if (voiceState.error) return colors.error;
    if (voiceState.isSpeaking) return colors.primary;
    if (voiceState.isListening) return colors.success;
    return colors.text;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card }
      ]}
      onPress={toggleVoice}
      activeOpacity={0.7}
    >
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: getIndicatorColor(), transform: [{ scale: firstDotScale }] }
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: getIndicatorColor(), transform: [{ scale: secondDotScale }] }
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: getIndicatorColor(), transform: [{ scale: thirdDotScale }] }
          ]}
        />
      </View>
      
      {voiceState.error && (
        <ThemedText style={styles.errorText}>
          Error: {voiceState.error}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 50,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  errorText: {
    fontSize: 10,
    marginTop: 4,
    maxWidth: width * 0.3,
  },
});