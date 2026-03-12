import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';

const THEME_KEY = '@owner_theme';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  background: string;
  backgroundSoft: string;
  surface: string;
  card: string;
  border: string;
  divider: string;
  green: string;
  greenLight: string;
  text: { primary: string; secondary: string; muted: string; white: string; accent: string };
  status: { success: string; warning: string; error: string; info: string };
  gradient: {
    primary: readonly [string, string];
    warm: readonly [string, string];
    header: readonly [string, string];
    hero: readonly [string, string];
    green: readonly [string, string];
    card: readonly [string, string];
  };
}

const LIGHT_COLORS: ThemeColors = {
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  accent: '#FFA726',
  accentLight: '#FFD180',
  background: '#F9FAFB',
  backgroundSoft: '#E8F5E9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#EDF2F7',
  green: '#388E3C',
  greenLight: '#E8F5E9',
  text: { primary: '#333333', secondary: '#5A6B6A', muted: '#94A3B8', white: '#FFFFFF', accent: '#4CAF50' },
  status: { success: '#388E3C', warning: '#FFA726', error: '#E53935', info: '#1E88E5' },
  gradient: {
    primary: ['#4CAF50', '#66BB6A'] as const,
    warm: ['#81C784', '#66BB6A'] as const,
    header: ['#E8F5E9', '#F1F8F2'] as const,
    hero: ['#388E3C', '#4CAF50'] as const,
    green: ['#4CAF50', '#388E3C'] as const,
    card: ['#FFFFFF', '#F9FAFB'] as const,
  },
};

const DARK_COLORS: ThemeColors = {
  primary: '#66BB6A',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  accent: '#FFB74D',
  accentLight: '#FFD180',
  background: '#121212',
  backgroundSoft: '#1B3A1D',
  surface: '#1E1E1E',
  card: '#1E1E1E',
  border: '#333333',
  divider: '#2A2A2A',
  green: '#66BB6A',
  greenLight: '#1B3A1D',
  text: { primary: '#E0E0E0', secondary: '#A0A0A0', muted: '#666666', white: '#FFFFFF', accent: '#66BB6A' },
  status: { success: '#66BB6A', warning: '#FFB74D', error: '#EF5350', info: '#42A5F5' },
  gradient: {
    primary: ['#2E7D32', '#388E3C'] as const,
    warm: ['#2E7D32', '#1B5E20'] as const,
    header: ['#1A1A1A', '#121212'] as const,
    hero: ['#1B5E20', '#2E7D32'] as const,
    green: ['#2E7D32', '#1B5E20'] as const,
    card: ['#1E1E1E', '#181818'] as const,
  },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: LIGHT_COLORS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    getStoredData<boolean | null>(THEME_KEY, null).then((stored) => {
      if (stored !== null) {
        setIsDark(stored);
      } else {
        setIsDark(systemScheme === 'dark');
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      setStoredData(THEME_KEY, next);
      return next;
    });
  }, []);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo(
    () => ({ isDark, toggleTheme, colors }),
    [isDark, toggleTheme, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
