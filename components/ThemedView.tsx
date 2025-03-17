import { View, type ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type ThemedViewProps = ViewProps & {
  customColor?: string;
  variant?: 'default' | 'card' | 'paper';
};

export function ThemedView({ 
  style, 
  customColor, 
  variant = 'default',
  ...otherProps 
}: ThemedViewProps) {
  const { colors } = useTheme();
  
  // Use provided color, otherwise use theme color
  const backgroundColor = customColor || colors.background;
  
  // Apply variant-specific styling
  const getVariantStyle = () => {
    switch (variant) {
      case 'card':
        return styles.card;
      case 'paper':
        return styles.paper;
      default:
        return {};
    }
  };

  return (
    <View 
      style={[
        { backgroundColor }, 
        getVariantStyle(),
        variant === 'card' ? { borderColor: colors.separator } : undefined,
        variant === 'paper' ? { borderColor: colors.separator } : undefined,
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paper: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginVertical: 4,
  }
});
