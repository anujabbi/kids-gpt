
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  border: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

const defaultThemes: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#22c55e',
      secondary: '#f3f4f6',
      background: '#ffffff',
      surface: '#f9fafb',
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        accent: '#22c55e',
      },
      border: '#e5e7eb',
      accent: '#22c55e',
    },
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#eff6ff',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        accent: '#3b82f6',
      },
      border: '#e2e8f0',
      accent: '#3b82f6',
    },
  },
  {
    id: 'purple',
    name: 'Purple Rain',
    colors: {
      primary: '#8b5cf6',
      secondary: '#f3f4f6',
      background: '#ffffff',
      surface: '#faf5ff',
      text: {
        primary: '#4c1d95',
        secondary: '#7c3aed',
        accent: '#8b5cf6',
      },
      border: '#e9d5ff',
      accent: '#8b5cf6',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      primary: '#22c55e',
      secondary: '#374151',
      background: '#111827',
      surface: '#1f2937',
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        accent: '#22c55e',
      },
      border: '#374151',
      accent: '#22c55e',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[2]); // Changed from defaultThemes[0] to defaultThemes[2] (Purple Rain)

  useEffect(() => {
    const savedThemeId = localStorage.getItem('theme-id');
    if (savedThemeId) {
      const savedTheme = defaultThemes.find(theme => theme.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = defaultThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('theme-id', themeId);
      
      // Apply CSS variables to root
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-${key}`, value);
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              root.style.setProperty(`--theme-${key}-${subKey}`, subValue);
            }
          });
        }
      });
    }
  };

  // Apply theme on mount
  useEffect(() => {
    setTheme(currentTheme.id);
  }, [currentTheme.id]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themes: defaultThemes, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
