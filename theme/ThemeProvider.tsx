import React, { createContext, useContext, ReactNode } from 'react';
import { Colors } from '@/constants/Colors';

// Create context with colors only
type ThemeContextType = {
  colors: typeof Colors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider
      value={{
        colors: Colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 