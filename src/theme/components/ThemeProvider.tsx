import React, { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContext } from '../context/ThemeContext';
import { themeManager } from '../managers/ThemeManager';
import { lightTheme, darkTheme } from '../themes';

interface ThemeProviderProps {
  children: React.ReactNode;
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
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = themeManager.getTheme();
  const isDark = themeManager.getEffectiveTheme() === 'dark';
  const themeOptions = themeManager.getThemeOptions();

  // Create MUI theme based on dark/light mode
  const muiTheme = useMemo(() => {
    return createTheme(isDark ? darkTheme : lightTheme);
  }, [isDark]);

  // Update theme when it changes
  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = themeManager.getTheme();
      const effectiveTheme = themeManager.getEffectiveTheme();
      
      // Update data-theme attribute for CSS variables
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
      
      // Force re-render
      // Note: The actual state is managed by the theme manager
      // This effect is just for side effects
    };

    // Initial setup
    updateTheme();

    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe(updateTheme);
    return () => unsubscribe();
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    isDark,
    toggleTheme: () => themeManager.toggleTheme(),
    setTheme: (newTheme: string) => themeManager.setTheme(newTheme as any),
    themeOptions,
  }), [theme, isDark, themeOptions]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
