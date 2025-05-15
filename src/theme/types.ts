export type ThemeMode = 'light' | 'dark';

export interface PaletteOptions {
  mode?: 'light' | 'dark';
  primary?: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary?: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  error?: {
    main: string;
    light: string;
    dark: string;
  };
  warning?: {
    main: string;
  };
  info?: {
    main: string;
  };
  success?: {
    main: string;
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
}

export interface ThemeOptions {
  palette: PaletteOptions;
  components?: {
    [key: string]: any;
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
  getTheme: () => ThemeMode;
  getEffectiveTheme: () => ThemeMode;
  themeOptions: ThemeOptions;
}
