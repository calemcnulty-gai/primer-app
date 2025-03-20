import { StyleSheet } from 'react-native';
import { PipeCatChat } from '@/components/PipeCatChat';
import { ThemedView } from '@/components/ThemedView';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RtviScreen() {
  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        <PipeCatChat />
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});