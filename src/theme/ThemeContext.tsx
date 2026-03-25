import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import { darkColors, lightColors } from './colors';

type ThemeMode = 'dark' | 'light';

// Create a flexible color scheme type that works with both dark and light colors
export type ColorScheme = {
  [K in keyof typeof darkColors]: string;
};

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'tripnode_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveTheme = async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveTheme(newMode);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveTheme(mode);
  };

  const isDark = themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextType = {
    isDark,
    themeMode,
    colors,
    toggleTheme,
    setTheme,
  };

  // Show loading view while theme is being loaded (instead of returning null)
  // This prevents white screen on app startup
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: darkColors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={darkColors.electricBlue} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
