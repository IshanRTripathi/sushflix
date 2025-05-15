import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from '../context/ThemeContext';
import { themeManager } from '../managers/ThemeManager';
import { lightTheme } from '../themes/light';
import { darkTheme } from '../themes/dark';
import type { ThemeOptions } from '../types';

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
  // Use ref to store the current theme to avoid stale closures
  const themeRef = useRef(themeManager.getTheme());
  const [theme, setThemeState] = useState(themeManager.getTheme());
  const [isDark, setIsDark] = useState(themeManager.getEffectiveTheme() === 'dark');
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

  // Memoize the theme update function with stable references
  const updateTheme = useCallback(() => {
    try {
      const currentTheme = themeManager.getTheme();
      const newIsDark = currentTheme === 'dark';
      
      // Update ref and state if theme changed
      if (themeRef.current !== currentTheme) {
        themeRef.current = currentTheme;
        
        // Batch state updates
        setThemeState(currentTheme);
        setIsDark(newIsDark);
        
        // Update DOM attributes
        const html = document.documentElement;
        if (html.getAttribute('data-theme') !== currentTheme) {
          html.setAttribute('data-theme', currentTheme);
        }
        
        // Toggle classes only if needed
        if (newIsDark) {
          html.classList.add('dark');
          html.classList.remove('light');
        } else {
          html.classList.add('light');
          html.classList.remove('dark');
        }
        
        // Update color scheme
        html.style.colorScheme = newIsDark ? 'dark' : 'light';
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [onError]);

  // Set up theme change subscription with stable reference
  useEffect(() => {
    let mounted = true;
    
    const safeUpdate = () => {
      if (mounted) {
        updateTheme();
      }
    };
    
    // Initial setup
    safeUpdate();
    
    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(safeUpdate);

    // Cleanup function
    return () => {
      mounted = false;
      try {
        unsubscribe();
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    };
  }, [updateTheme, onError]);

  const contextValue = useMemo(() => {
    const toggleTheme = () => {
      try {
        themeManager.toggleTheme();
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    const setTheme = (newTheme: 'light' | 'dark') => {
      try {
        themeManager.setTheme(newTheme);
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    const getTheme = () => themeManager.getTheme();
    const getEffectiveTheme = () => themeManager.getEffectiveTheme();

    return {
      theme,
      isDark,
      toggleTheme,
      setTheme,
      getTheme,
      getEffectiveTheme,
      themeOptions: themeOptions as ThemeOptions,
    };
  }, [theme, isDark, themeOptions, onError]);

  // Apply theme class to body
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('dark-theme', isDark);
    body.classList.toggle('light-theme', !isDark);
    
    return () => {
      body.classList.remove('dark-theme', 'light-theme');
    };
  }, [isDark]);

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
