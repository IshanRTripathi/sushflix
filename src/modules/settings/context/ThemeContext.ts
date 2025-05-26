import { createContext } from 'react';
import type { ThemeContextType, ThemeMode } from '../types/types';

/**
 * Theme context that provides theme-related functionality throughout the application.
 * This context is used by the useTheme hook.
 * 
 * @example
 * ```tsx
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     Switch to {isDark ? 'Light' : 'Dark'} Mode
 *   </button>
 * );
 * ```
 * 
 * @see useTheme
 * @see ThemeProvider
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Default theme mode
 */
const DEFAULT_THEME: ThemeMode = 'light';

/**
 * Default context value to ensure type safety
 */
export const defaultThemeContextValue: ThemeContextType = {
  theme: DEFAULT_THEME,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  getTheme: () => DEFAULT_THEME,
  getEffectiveTheme: () => DEFAULT_THEME,
  themeOptions: {
    palette: {
      mode: DEFAULT_THEME,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
        contrastText: '#fff',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
        contrastText: '#fff',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
        contrastText: '#fff',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
        contrastText: '#fff',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
        contrastText: '#fff',
      },
      background: {
        default: '#fff',
        paper: '#f5f5f5',
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
      action: {
        active: 'rgba(0, 0, 0, 0.54)',
        hover: 'rgba(0, 0, 0, 0.04)',
        selected: 'rgba(0, 0, 0, 0.08)',
        disabled: 'rgba(0, 0, 0, 0.26)',
        disabledBackground: 'rgba(0, 0, 0, 0.12)',
      },
    },
    spacing: (factor: number) => `${8 * factor}px`,
  },
};
