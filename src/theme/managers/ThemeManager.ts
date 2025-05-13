import { ThemeMode, ThemeOptions } from '../types';

const THEME_STORAGE_KEY = 'theme';

/**
 * Manages theme state and persistence
 */
export class ThemeManager {
  private currentTheme: ThemeMode;
  private systemPreference: 'light' | 'dark' = 'light';
  private subscribers: Array<() => void> = [];

  constructor() {
    // Initialize system preference
    this.detectSystemPreference();
    
    // Listen for system preference changes
    this.setupSystemPreferenceListener();

    // Load saved theme or default to system
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    this.currentTheme = savedTheme && this.isValidTheme(savedTheme) ? savedTheme : 'system';
  }

  /**
   * Get current theme setting (light/dark/system)
   */
  public getTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * Get effective theme (light/dark) considering system preference
   */
  public getEffectiveTheme(): 'light' | 'dark' {
    return this.currentTheme === 'system' ? this.systemPreference : this.currentTheme;
  }

  /**
   * Set new theme
   */
  public setTheme(theme: ThemeMode): void {
    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.notifySubscribers();
  }

  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    this.setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  }

  /**
   * Get theme options for MUI
   */
  public getThemeOptions(): ThemeOptions {
    const isDark = this.getEffectiveTheme() === 'dark';
    
    return {
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: isDark ? '#90caf9' : '#1976d2',
          light: isDark ? '#e3f2fd' : '#bbdefb',
          dark: isDark ? '#42a5f5' : '#1565c0',
          contrastText: isDark ? 'rgba(0, 0, 0, 0.87)' : '#fff',
        },
        secondary: {
          main: isDark ? '#ce93d8' : '#9c27b0',
          light: isDark ? '#f3e5f5' : '#e1bee7',
          dark: isDark ? '#ab47bc' : '#7b1fa2',
          contrastText: '#fff',
        },
        error: {
          main: isDark ? '#f44336' : '#d32f2f',
          light: isDark ? '#e57373' : '#ef5350',
          dark: isDark ? '#d32f2f' : '#c62828',
          contrastText: '#fff',
        },
        warning: {
          main: isDark ? '#ffa726' : '#ed6c02',
          light: isDark ? '#ffb74d' : '#ff9800',
          dark: isDark ? '#f57c00' : '#e65100',
        },
        info: {
          main: isDark ? '#29b6f6' : '#0288d1',
          light: isDark ? '#4fc3f7' : '#03a9f4',
          dark: isDark ? '#0288d1' : '#01579b',
        },
        success: {
          main: isDark ? '#66bb6a' : '#2e7d32',
          light: isDark ? '#81c784' : '#4caf50',
          dark: isDark ? '#388e3c' : '#1b5e20',
        },
        background: {
          default: isDark ? '#121212' : '#f5f5f5',
          paper: isDark ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
          secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
      spacing: (factor: number) => `${0.25 * factor}rem`,
      shape: {
        borderRadius: 4,
      },
    };
  }

  /**
   * Subscribe to theme changes
   * @returns Unsubscribe function
   */
  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private detectSystemPreference(): void {
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private setupSystemPreferenceListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      if (this.currentTheme === 'system') {
        this.notifySubscribers();
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } 
    // Safari <14
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  private isValidTheme(theme: unknown): theme is ThemeMode {
    return theme === 'light' || theme === 'dark' || theme === 'system';
  }
}

// Create a singleton instance
export const themeManager = new ThemeManager();
