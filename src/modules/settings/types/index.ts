/**
 * Theme-related type definitions
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PaletteOptions {
  mode?: 'light' | 'dark';
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  error: {
    main: string;
    light: string;
    dark: string;
    contrastText?: string;
  };
  warning: {
    main: string;
    light?: string;
    dark?: string;
    contrastText?: string;
  };
  info: {
    main: string;
    light?: string;
    dark?: string;
    contrastText?: string;
  };
  success: {
    main: string;
    light?: string;
    dark?: string;
    contrastText?: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  divider: string;
  action?: {
    active?: string;
    hover?: string;
    selected?: string;
    disabled?: string;
    disabledBackground?: string;
  };
}

export interface ThemeOptions {
  palette: PaletteOptions;
  components?: {
    [key: string]: any; // TODO: Replace 'any' with proper MUI component overrides
  };
  typography?: {
    fontFamily?: string;
    [key: string]: any;
  };
  spacing: (factor: number) => string;
  shape?: {
    borderRadius: number;
  };
}

export interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  themeOptions: ThemeOptions;
}

// Type guard for ThemeMode
export const isThemeMode = (value: unknown): value is ThemeMode => {
  return value === 'light' || value === 'dark' || value === 'system';
};
