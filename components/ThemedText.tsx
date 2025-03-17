import { Text, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export type ThemedTextProps = TextProps & {
  customColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  customColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();
  
  // Use provided color, otherwise use theme color
  const textColor = customColor || colors.text;

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: colors.tint }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

// Fonts styled to look good with the e-ink, paper-like theme
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SpaceMono',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'SpaceMono',
  },
});
