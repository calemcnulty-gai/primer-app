import { StyleSheet } from 'react-native';
import { RtviChat } from '@/components/RtviChat';
import { ThemedView } from '@/components/ThemedView';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RtviScreen() {
  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        <RtviChat />
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});