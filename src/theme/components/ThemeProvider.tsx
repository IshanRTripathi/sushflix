import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext, defaultThemeContextValue } from '../context/ThemeContext';
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
  const [theme, setTheme] = useState<ThemeMode>(() => themeManager.getTheme());
  const [isDark, setIsDark] = useState(() => themeManager.getEffectiveTheme() === 'dark');
  const [isMounted, setIsMounted] = useState(false);
  const themeRef = useRef(theme);

  // Initialize theme options
  const themeOptions = useMemo<ThemeOptions>(() => {
    try {
      return themeManager.getThemeOptions();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to get theme options'));
      return defaultThemeContextValue.themeOptions;
    }
  }, [onError]);

  // Create MUI theme based on dark/light mode with error handling
  const muiTheme = useMemo<Theme>(() => {
    try {
      const baseTheme = isDark ? darkTheme : lightTheme;
      return createTheme({
        ...baseTheme,
        ...themeOptions,
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to create theme'));
      return createTheme(lightTheme); // Fallback to light theme
    }
  }, [isDark, themeOptions, onError]);

  // Handle theme changes from the theme manager
  useEffect(() => {
    const handleThemeChange = (newTheme: ThemeMode) => {
      try {
        const isDarkMode = newTheme === 'dark';
        const html = document.documentElement;
        
        // Update DOM classes
        html.classList.toggle('dark', isDarkMode);
        html.classList.toggle('light', !isDarkMode);
        
        // Update state and ref
        setTheme(newTheme);
        setIsDark(isDarkMode);
        themeRef.current = newTheme;
        
        // Update color scheme
        html.style.colorScheme = isDarkMode ? 'dark' : 'light';
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to handle theme change'));
      }
    };

    // Initial theme setup
    handleThemeChange(themeManager.getTheme());
    
    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(handleThemeChange);
    setIsMounted(true);
    
    // Cleanup subscription on unmount
    return () => {
      try {
        unsubscribe();
        themeManager.cleanup();
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to clean up theme subscription'));
      }
    };
  }, [onError]);

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    try {
      themeManager.toggleTheme();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to toggle theme'));
    }
  }, [onError]);

  /**
   * Set a specific theme
   * @param newTheme - The theme to set ('light' or 'dark')
   */
  const setThemeMode = useCallback((newTheme: ThemeMode) => {
    try {
      themeManager.setTheme(newTheme);
    } catch (error) {
      onError(error instanceof Error ? error : new Error(`Failed to set theme to ${newTheme}`));
    }
  }, [onError]);

  // Create context value with proper typing
  const contextValue = useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
    setTheme: setThemeMode,
    getTheme: themeManager.getTheme.bind(themeManager),
    getEffectiveTheme: themeManager.getEffectiveTheme.bind(themeManager),
    themeOptions,
  }), [theme, isDark, toggleTheme, setThemeMode, themeOptions]);

  // Only render children after initial theme is applied
  if (!isMounted) {
    return <div className="theme-loading" />;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        <div className={`theme-${isDark ? 'dark' : 'light'}`}>
          {children}
        </div>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
