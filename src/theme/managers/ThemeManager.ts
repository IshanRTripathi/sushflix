import type { ThemeOptions } from '../types';

// Base color type for theme colors
type ColorVariant = {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
};

// Type for our internal palette that matches the theme structure
type ThemePalette = {
  mode: 'light' | 'dark';
  primary: ColorVariant;
  secondary: ColorVariant;
  error: { main: string };
  warning: { main: string };
  info: { main: string };
  success: { main: string };
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
  action: {
    active: string;
    hover: string;
    selected: string;
    disabled: string;
    disabledBackground: string;
  };
};

// Extended palette options with required fields for MUI
type CompletePaletteOptions = Omit<ThemePalette, 'error' | 'warning' | 'info' | 'success' | 'action'> & {
  error: ColorVariant;
  warning: ColorVariant;
  info: ColorVariant;
  success: ColorVariant;
};

import { lightPalette } from '../themes/light';
import { darkPalette } from '../themes/dark';

/**
 * Manages theme state and persistence
 */
class ThemeManager {
  // Debug flag - set to false in production
  private static instance: ThemeManager;

  private currentTheme: 'light' | 'dark' = 'light';
  private readonly storageKey = 'theme';
  private subscribers: Array<(theme: 'light' | 'dark') => void> = [];

  private static log(...args: unknown[]): void {
    // Only log if debug mode is enabled in localStorage
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme:debug') === 'true') {
      console.log('[ThemeManager]', ...args);
    }
  }

  private constructor() {
    ThemeManager.log('Initializing ThemeManager');
    this.initialize();
  }

  private initialize(): void {
    try {
      // Try to get theme from localStorage first
      const savedTheme = localStorage.getItem(this.storageKey) as 'light' | 'dark' | null;
      
      if (savedTheme && this.isValidTheme(savedTheme)) {
        this.currentTheme = savedTheme;
        ThemeManager.log('Loaded theme from localStorage:', this.currentTheme);
      } else {
        // Check browser's preferred color scheme
        const prefersDark = typeof window !== 'undefined' && 
          window.matchMedia && 
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.currentTheme = prefersDark ? 'dark' : 'light';
        ThemeManager.log(`Using ${prefersDark ? 'browser dark' : 'default light'} theme`);
      }
      
      // Apply the theme
      this.applyTheme();
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      this.currentTheme = 'light';
      this.applyTheme();
    }
  }

  private applyTheme(): void {
    try {
      // Update document attributes
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        
        // Remove all theme classes first
        html.classList.remove('light', 'dark');
        
        // Add the current theme class
        html.classList.add(this.currentTheme);
        
        // Set data-theme attribute for CSS variables
        html.setAttribute('data-theme', this.currentTheme);
        
        // Set color-scheme for form controls and system UI
        html.style.colorScheme = this.currentTheme;
      }
      
      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  }

  /**
   * Get the singleton instance of ThemeManager
   */
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.log('Creating new ThemeManager instance');
      ThemeManager.instance = new ThemeManager();
    } else {
      ThemeManager.log('Returning existing ThemeManager instance');
    }
    return ThemeManager.instance;
  }

  /**
   * Get current theme setting (light/dark)
   */
  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Get effective theme (light/dark)
   */
  public getEffectiveTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Set the current theme
   */
  public setTheme(theme: 'light' | 'dark'): void {
    if (!this.isValidTheme(theme)) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.notifySubscribers();
  }

  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    ThemeManager.log(`Toggling theme to ${newTheme}`);
    this.setTheme(newTheme);
  }

  /**
   * Get theme options for MUI
   */
  public getThemeOptions(): ThemeOptions {
    const isDark = this.getEffectiveTheme() === 'dark';
    const palette = isDark ? darkPalette : lightPalette;

    // Cast the palette to our theme palette type
    const themePalette = palette as unknown as ThemePalette;

    // Create the MUI theme options with all required properties
    const muiPalette: CompletePaletteOptions = {
      mode: isDark ? 'dark' : 'light',
      primary: themePalette.primary,
      secondary: themePalette.secondary,
      error: {
        main: themePalette.error.main,
        light: themePalette.error.main, // Use main color as fallback
        dark: themePalette.error.main, // Use main color as fallback
        contrastText: '#ffffff', // Default contrast text
      },
      warning: {
        main: themePalette.warning.main,
        light: themePalette.warning.main, // Use main color as fallback
        dark: themePalette.warning.main, // Use main color as fallback
        contrastText: '#000000', // Dark text for better contrast on light colors
      },
      info: {
        main: themePalette.info.main,
        light: themePalette.info.main, // Use main color as fallback
        dark: themePalette.info.main, // Use main color as fallback
        contrastText: '#ffffff', // Default contrast text
      },
      success: {
        main: themePalette.success.main,
        light: themePalette.success.main, // Use main color as fallback
        dark: themePalette.success.main, // Use main color as fallback
        contrastText: '#000000', // Dark text for better contrast on light colors
      },
      background: themePalette.background,
      text: themePalette.text,
      divider: themePalette.divider,
    };

    return {
      palette: muiPalette,
      spacing: (factor: number) => `${0.25 * factor}rem`,
      shape: {
        borderRadius: 4,
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
      },
    };
  }

  /**
   * Subscribe to theme changes
   * @returns Unsubscribe function
   */
  public subscribe(callback: (theme: 'light' | 'dark') => void): () => void {
    // Prevent duplicate subscriptions
    if (this.subscribers.includes(callback)) {
      return () => {}; // Return empty cleanup function if already subscribed
    }

    this.subscribers.push(callback);

    // Initial notification with current theme
    const currentTheme = this.getEffectiveTheme();
    callback(currentTheme);

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Clean up event listeners when the theme is no longer needed
   */
  public cleanup(): void {
    // Clear subscribers
    this.subscribers = [];
  }

  private notifySubscribers(): void {
    const currentTheme = this.getEffectiveTheme();

    if (this.subscribers.length === 0) {
      return;
    }

    // Create a stable reference to subscribers array
    const subscribers = [...this.subscribers];

    // Notify all subscribers
    subscribers.forEach((callback, index) => {
      try {
        callback(currentTheme);
      } catch (error) {
        console.error(`[ThemeManager] Error in subscriber #${index + 1}:`, error);
      }
    });
  }

  private isValidTheme(theme: string): boolean {
    return theme === 'light' || theme === 'dark';
  }
}

// Export the singleton instance
export const themeManager = ThemeManager.getInstance();
