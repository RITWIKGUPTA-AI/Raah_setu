import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  subtitle: string;
  description: string;
  colorSwatch: string; // Color of the swatch dot / pill
  bgAppHex: string; // Main outer canvas color
  surfaceHex: string; // Pure white replacement color
  borderHex: string; // Border color preview
  textHex: string; // Text color preview
  isDark?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'white',
    name: 'Pure White',
    subtitle: 'Standard daylight high-contrast',
    description: 'Crisp bright white canvas with slate accents for standard daytime lighting.',
    colorSwatch: '#FFFFFF',
    bgAppHex: '#F8FAFC',
    surfaceHex: '#FFFFFF',
    borderHex: '#E2E8F0',
    textHex: '#0F172A',
    isDark: false,
  },
  {
    id: 'dark',
    name: 'Dark mode',
    subtitle: 'Tactical nocturnal command',
    description: 'Deep midnight obsidian theme reducing glare for 24/7 ops center vigilance.',
    colorSwatch: '#090D16',
    bgAppHex: '#090D16',
    surfaceHex: '#111827',
    borderHex: '#263347',
    textHex: '#F8FAFC',
    isDark: true,
  },
  {
    id: 'bone',
    name: 'Bone',
    subtitle: 'Warm unbleached ivory finish',
    description: 'Calming organic parchment tone that eliminates blue light glare and eye fatigue.',
    colorSwatch: '#F4EFEA',
    bgAppHex: '#F4EFEA',
    surfaceHex: '#FAF8F5',
    borderHex: '#DDD5C8',
    textHex: '#292524',
    isDark: false,
  },
  {
    id: 'powder',
    name: 'Powder',
    subtitle: 'Cool mist & powder tone',
    description: 'Soft calming pastel blue-gray surface for balanced, modern clarity.',
    colorSwatch: '#EBF1F6',
    bgAppHex: '#EBF1F6',
    surfaceHex: '#F7FAFD',
    borderHex: '#CDDCE9',
    textHex: '#1A2838',
    isDark: false,
  },
  {
    id: 'frost',
    name: 'Frost',
    subtitle: 'Crisp arctic glacier tone',
    description: 'Refreshing cool cyan-tinted frost aesthetic with crisp arctic borders.',
    colorSwatch: '#E8F4F8',
    bgAppHex: '#E8F4F8',
    surfaceHex: '#F5FBFC',
    borderHex: '#C1E0EB',
    textHex: '#112530',
    isDark: false,
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  currentThemeOption: ThemeOption;
  themeOptions: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'vector_ops_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    }
    return 'white';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (err) {
        console.warn('Failed to save theme in localStorage:', err);
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const currentThemeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemeOption,
        themeOptions: THEME_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
