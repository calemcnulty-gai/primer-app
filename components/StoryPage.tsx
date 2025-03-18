import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCurrentSegment, makeChoice, setTransitioning } from '@/store/slices/storySlice';

export function StoryPage() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { currentSegment, isLoading, error, isTransitioning } = useAppSelector((state) => state.story);
  const spinValue = React.useRef(new Animated.Value(0)).current;

  // Start the page turn animation
  const startPageTurnAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  // Stop the page turn animation
  const stopPageTurnAnimation = () => {
    spinValue.stopAnimation();
    spinValue.setValue(0);
  };

  // Generate the page turn rotation
  const pageTurn = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Load initial story segment
  useEffect(() => {
    dispatch(fetchCurrentSegment());
  }, [dispatch]);

  // Handle animation for loading states
  useEffect(() => {
    if (isLoading || isTransitioning) {
      startPageTurnAnimation();
    } else {
      stopPageTurnAnimation();
    }
  }, [isLoading, isTransitioning]);

  // Handle making a choice
  const handleChoiceSelect = (choiceId: string) => {
    dispatch(setTransitioning(true));
    dispatch(makeChoice(choiceId));
  };

  // Show loading indicator when transitioning between pages
  if (isLoading && !currentSegment) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ rotate: pageTurn }] }}>
          <ThemedView style={styles.loadingIcon} variant="card" />
        </Animated.View>
        <ThemedText style={styles.loadingText}>Loading story from API...</ThemedText>
      </SafeAreaView>
    );
  }
  
  // If there's an error, display it prominently
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.errorTitle}>API Error</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => dispatch(fetchCurrentSegment())}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.pageContent, { backgroundColor: colors.paperTexture }]}>
          {isTransitioning ? (
            <View style={styles.transitionContainer}>
              <Animated.View style={{ transform: [{ rotate: pageTurn }] }}>
                <ThemedView style={styles.loadingIcon} variant="card" />
              </Animated.View>
              <ThemedText style={styles.loadingText}>Turning page...</ThemedText>
            </View>
          ) : currentSegment ? (
            <>
              <ThemedText style={styles.title}>{currentSegment.title}</ThemedText>
              <View style={styles.decorativeDivider} />
              <ThemedText style={styles.bodyText}>{currentSegment.content}</ThemedText>
              
              {currentSegment.choices && currentSegment.choices.length > 0 && (
                <View style={styles.choicesContainer}>
                  <ThemedText style={styles.choiceHeader}>What will you do?</ThemedText>
                  
                  {currentSegment.choices.map((choice) => (
                    <TouchableOpacity
                      key={choice.choiceId}
                      style={styles.choiceButton}
                      onPress={() => handleChoiceSelect(choice.choiceId)}
                    >
                      <ThemedText style={styles.choiceText}>{choice.text}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  loadingIcon: {
    width: 60,
    height: 80,
    borderRadius: 4,
  },
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#721c24',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#343a40',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageContent: {
    flex: 1,
    padding: 24,
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    marginBottom: 16,
  },
  decorativeDivider: {
    height: 1,
    backgroundColor: '#8a7b6b',
    marginVertical: 16,
    width: '100%',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    fontFamily: 'SpaceMono',
  },
  choicesContainer: {
    marginTop: 32,
    gap: 12,
  },
  choiceHeader: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    marginBottom: 8,
  },
  choiceButton: {
    backgroundColor: '#f0e6d2',
    borderWidth: 1,
    borderColor: '#8a7b6b',
    borderRadius: 4,
    padding: 12,
  },
  choiceText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
});