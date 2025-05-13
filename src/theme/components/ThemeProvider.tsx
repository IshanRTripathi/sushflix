import React, { useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from '../context/ThemeContext';
import { themeManager } from '../managers/ThemeManager';
import { lightTheme } from '../themes/light';
import { darkTheme } from '../themes/dark';
import type { ThemeMode, ThemeOptions } from '../types';

interface ThemeProviderProps {
  /** Child components that will have access to the theme context */
  children: React.ReactNode;
  
  /** Optional error handler for theme-related errors */
  onError?: (error: Error) => void;
}

/**
 * ThemeProvider component that provides theme context and MUI theme
 * to the entire application.
 * 
 * @component
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  onError = (error) => console.error('Theme Error:', error) 
}) => {
  const theme = themeManager.getTheme();
  const isDark = themeManager.getEffectiveTheme() === 'dark';
  const themeOptions = themeManager.getThemeOptions();

  // Create MUI theme based on dark/light mode with error handling
  const muiTheme = useMemo(() => {
    try {
      const baseTheme = isDark ? darkTheme : lightTheme;
      return createTheme({
        ...baseTheme,
        ...(themeOptions as ThemeOptions), // Apply any additional theme options
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to create theme'));
      return createTheme(lightTheme); // Fallback to light theme
    }
  }, [isDark, themeOptions, onError]);

  // Memoize the theme update function to prevent unnecessary recreations
  const updateTheme = useCallback(() => {
    try {
      const effectiveTheme = themeManager.getEffectiveTheme();
      
      // Update data-theme attribute for CSS variables
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [onError]);

  // Set up theme change subscription
  useEffect(() => {
    // Initial setup
    updateTheme();

    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(updateTheme);
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    };
  }, [updateTheme, onError]);

  const contextValue = useMemo(() => ({
    theme,
    isDark,
    toggleTheme: () => {
      try {
        themeManager.toggleTheme();
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    },
    setTheme: (newTheme: ThemeMode) => {
      try {
        themeManager.setTheme(newTheme);
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    },
    themeOptions: themeOptions as ThemeOptions,
  }), [theme, isDark, themeOptions, onError]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
