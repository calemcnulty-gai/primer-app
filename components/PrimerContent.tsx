import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import api from '@/services/api';

export function PrimerContent() {
  const { colors } = useTheme();
  const [content, setContent] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const data = await api.content.getContent();
        setContent(data);
        setError(null);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load your story. Please try again.');
        // Fallback content in case API fails
        setContent({
          title: "Chapter One",
          content: "Once upon a time, in a land both distant and near, a young girl discovered a most unusual book. The book was not like any other she had encountered before—its pages seemed to know her thoughts before she thought them, and it told stories that unfolded precisely as she needed them to.\n\nThe book was bound in leather that felt warm to the touch, embossed with intricate patterns that seemed to shift when viewed from different angles. Its pages were neither paper nor parchment, but something finer, like silk spun from knowledge itself.\n\n\"Welcome,\" the book seemed to whisper, though no sound emerged from its pages. \"I have been waiting for you.\""
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Opening your primer...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
        <View style={styles.pageContainer}>
          <View style={[styles.pageContent, { backgroundColor: colors.paperTexture }]}>
            {content && (
              <>
                <ThemedText style={styles.title}>{content.title}</ThemedText>
                <View style={styles.decorativeDivider} />
                <ThemedText style={styles.bodyText}>{content.content}</ThemedText>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
  errorContainer: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 4,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  pageContainer: {
    borderWidth: 1,
    borderColor: '#8a7b6b',
    backgroundColor: '#f8f3e8',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  pageContent: {
    padding: 24,
    minHeight: 500,
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
}); 