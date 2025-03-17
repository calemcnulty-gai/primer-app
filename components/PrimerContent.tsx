import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';

// Placeholder function for API calls - would be replaced with actual API integration
const fetchContent = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return placeholder content
  return {
    title: "Chapter One",
    content: "Once upon a time, in a land both distant and near, a young girl discovered a most unusual book. The book was not like any other she had encountered before—its pages seemed to know her thoughts before she thought them, and it told stories that unfolded precisely as she needed them to.\n\nThe book was bound in leather that felt warm to the touch, embossed with intricate patterns that seemed to shift when viewed from different angles. Its pages were neither paper nor parchment, but something finer, like silk spun from knowledge itself.\n\n\"Welcome,\" the book seemed to whisper, though no sound emerged from its pages. \"I have been waiting for you.\""
  };
};

export function PrimerContent() {
  const { colors } = useTheme();
  const [content, setContent] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchContent();
        setContent(data);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Loading your story...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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