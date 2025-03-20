/**
 * Below are the colors for the e-ink themed app with a monochrome, sepia feel.
 * The colors are designed to mimic an e-reader experience with a warm, paper-like appearance.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// E-ink sepia tones
const paperLight = '#f8f3e8'; // Light sepia paper color
const paperDark = '#e8e1d9';  // Slightly darker sepia
const inkColor = '#5b4636';   // Dark brown ink color
const accentSepia = '#b38a5b'; // Warm accent color
const errorColor = '#8B3A3A';  // Muted red for error states
const successColor = '#3A623A'; // Muted green for success states

export const Colors = {
  text: inkColor,
  background: paperLight,
  tint: accentSepia,
  icon: '#8a7b6b',
  tabIconDefault: '#8a7b6b',
  tabIconSelected: inkColor,
  paperTexture: paperDark,  // For subtle texture elements
  separator: '#d9d0c1',     // Subtle separator color
  error: errorColor,        // For error states
  primary: accentSepia,     // Primary action color
  success: successColor,    // Success state color
  card: paperDark,          // Card background color
};
