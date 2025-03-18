/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';

/**
 * Simple hook to access theme colors
 */
export function useThemeColor(colorName: keyof typeof Colors) {
  return Colors[colorName];
}
