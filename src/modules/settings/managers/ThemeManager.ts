import type { ThemeOptions, ThemeMode } from '../types/types';

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

  private currentTheme: ThemeMode = 'light';
  private readonly storageKey = 'sushflix-theme';
  private subscribers: Array<(theme: ThemeMode) => void> = [];
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  /**
   * Log debug messages when debug mode is enabled
   */
  private static log(...args: unknown[]): void {
    if (typeof window !== 'undefined' && localStorage.getItem('theme:debug') === 'true') {
      console.debug('[ThemeManager]', ...args);
    }
  }

  private constructor() {
    ThemeManager.log('Initializing ThemeManager');
    this.initialize();
  }

  private initialize(): void {
    try {
      // Set up media query for system preference changes
      if (typeof window !== 'undefined' && window.matchMedia) {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', this.handleSystemPreferenceChange);
      }

      // Try to get theme from localStorage first
      const savedTheme = this.getThemeFromStorage();
      
      if (savedTheme) {
        this.currentTheme = savedTheme;
        ThemeManager.log('Loaded theme from localStorage:', this.currentTheme);
      } else {
        // Fall back to system preference
        this.currentTheme = this.getSystemPreference();
        ThemeManager.log(`Using system preference: ${this.currentTheme} mode`);
      }
      
      // Apply the theme
      this.applyTheme();
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      this.currentTheme = 'light';
      this.applyTheme();
    }
  }

  private getThemeFromStorage(): ThemeMode | null {
    try {
      const savedTheme = localStorage.getItem(this.storageKey) as ThemeMode | null;
      return savedTheme && this.isValidTheme(savedTheme) ? savedTheme : null;
    } catch (error) {
      ThemeManager.log('Error reading theme from storage:', error);
      return null;
    }
  }

  private getSystemPreference(): ThemeMode {
    return this.mediaQuery?.matches ? 'dark' : 'light';
  }

  private handleSystemPreferenceChange = (event: MediaQueryListEvent): void => {
    try {
      if (!localStorage.getItem(this.storageKey)) {
        // Only update if user hasn't set a preference
        const newTheme = event.matches ? 'dark' : 'light';
        if (this.currentTheme !== newTheme) {
          this.currentTheme = newTheme;
          this.applyTheme();
          this.notifySubscribers();
        }
      }
    } catch (error) {
      ThemeManager.log('Error handling system preference change:', error);
    }
  }

  private applyTheme(): void {
    try {
      if (typeof document === 'undefined') return;
      
      const html = document.documentElement;
      
      // Add transition class for smooth theme changes
      html.classList.add('theme-transition');
      
      // Update theme classes and attributes in the next frame
      requestAnimationFrame(() => {
        // Remove all theme classes and attributes first
        const currentTheme = this.currentTheme;
        
        // Add the new theme class and attributes
        html.classList.remove('light', 'dark');
        html.classList.add(currentTheme);
        html.setAttribute('data-theme', currentTheme);
        
        // Update color scheme
        html.style.colorScheme = currentTheme;
        
        // Remove transition class after animation completes
        const onTransitionEnd = () => {
          html.classList.remove('theme-transition');
          html.removeEventListener('transitionend', onTransitionEnd);
        };
        
        html.addEventListener('transitionend', onTransitionEnd, { once: true });
        
        // Notify subscribers after a small delay to allow for smooth transition
        requestAnimationFrame(() => {
          this.notifySubscribers();
        });
      });
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  }

  /**
   * Get the singleton instance of ThemeManager
   */
  /**
   * Get the singleton instance of ThemeManager
   */
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Enable or disable debug logging
   */
  public static setDebug(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      if (enabled) {
        localStorage.setItem('theme:debug', 'true');
      } else {
        localStorage.removeItem('theme:debug');
      }
    }
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
    try {
      // Clean up event listeners
      if (this.mediaQuery && this.mediaQueryListener) {
        this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
      }
      this.subscribers = [];
    } catch (error) {
      ThemeManager.log('Error during cleanup:', error);
    }
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
