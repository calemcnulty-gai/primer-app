import { StyleSheet } from 'react-native';
import { StoryPage } from '@/components/StoryPage';
import { ThemedView } from '@/components/ThemedView';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function HomeScreen() {
  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        <StoryPage />
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
