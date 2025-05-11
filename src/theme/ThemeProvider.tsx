import React, { createContext, useEffect, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextType, ThemeMode } from './types';
import { themeManager } from './ThemeManager';
import { lightTheme, darkTheme } from './theme';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(themeManager.getTheme());
  const [isDark, setIsDark] = useState(themeManager.getEffectiveTheme() === 'dark');
  const [themeOptions, setThemeOptions] = useState(themeManager.getThemeOptions());

  // Create MUI theme based on dark/light mode
  const muiTheme = useMemo(() => {
    return createTheme(isDark ? darkTheme : lightTheme);
  }, [isDark]);

  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = themeManager.getTheme();
      const effectiveTheme = themeManager.getEffectiveTheme();
      setTheme(currentTheme);
      setIsDark(effectiveTheme === 'dark');
      setThemeOptions(themeManager.getThemeOptions());
      
      // Update data-theme attribute for CSS variables
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    };

    // Initial setup
    updateTheme();

    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(updateTheme);
    return () => unsubscribe();
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    toggleTheme: () => themeManager.toggleTheme(),
    setTheme: (newTheme: ThemeMode) => themeManager.setTheme(newTheme),
    themeOptions,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// useTheme hook is in useTheme.ts
