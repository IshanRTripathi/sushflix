/**
 * Represents the available theme modes
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Color variant with main, light, dark, and contrast text colors
 */
export interface ColorVariant {
  /** Main color */
  main: string;
  /** Lighter shade of the main color */
  light: string;
  /** Darker shade of the main color */
  dark: string;
  /** Text color that contrasts with the main color */
  contrastText: string;
}

/**
 * Extended color palette options
 */
export interface PaletteOptions {
  /** Current theme mode */
  mode: ThemeMode;
  
  /** Primary color palette */
  primary: ColorVariant;
  
  /** Secondary color palette */
  secondary: ColorVariant;
  
  /** Error state color palette */
  error: Pick<ColorVariant, 'main' | 'light' | 'dark'> & { contrastText: string };
  
  /** Warning state color palette */
  warning: Pick<ColorVariant, 'main' | 'light' | 'dark'> & { contrastText: string };
  
  /** Info state color palette */
  info: Pick<ColorVariant, 'main' | 'light' | 'dark'> & { contrastText: string };
  
  /** Success state color palette */
  success: Pick<ColorVariant, 'main' | 'light' | 'dark'> & { contrastText: string };
  
  /** Background colors */
  background: {
    /** Default background color */
    default: string;
    /** Background color for paper/card components */
    paper: string;
  };
  
  /** Text colors */
  text: {
    /** Primary text color */
    primary: string;
    /** Secondary text color */
    secondary: string;
    /** Disabled text color */
    disabled: string;
  };
  
  /** Divider color */
  divider: string;
  
  /** Action colors */
  action?: {
    /** Active state color */
    active: string;
    /** Hover state color */
    hover: string;
    /** Selected state color */
    selected: string;
    /** Disabled state color */
    disabled: string;
    /** Background color for disabled elements */
    disabledBackground: string;
  };
}

/**
 * Theme options that can be extended by specific themes
 */
export interface ThemeOptions {
  /** Color palette configuration */
  palette: PaletteOptions;
  
  /** Component-specific style overrides */
  components?: {
    [key: string]: unknown;
  };
  
  /** Typography configuration */
  typography?: {
    /** Default font family */
    fontFamily?: string;
    [key: string]: unknown;
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
