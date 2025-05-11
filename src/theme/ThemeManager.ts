import { ThemeMode, ThemeOptions } from './types';

const THEME_STORAGE_KEY = 'theme';

export class ThemeManager {
  private currentTheme: ThemeMode;
  private systemPreference: 'light' | 'dark' = 'light';
  private subscribers: Array<() => void> = [];

  constructor() {
    // Initialize system preference
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      if (this.currentTheme === 'system') {
        this.notifySubscribers();
      }
    });

    // Load saved theme or default to system
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    this.currentTheme = savedTheme || 'system';
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return this.systemPreference;
    }
    return this.currentTheme;
  }

  setTheme(theme: ThemeMode) {
    this.currentTheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme();
    this.notifySubscribers();
  }

  toggleTheme() {
    this.setTheme(this.getEffectiveTheme() === 'dark' ? 'light' : 'dark');
  }

  getThemeOptions(): ThemeOptions {
    const isDark = this.getEffectiveTheme() === 'dark';
    return {
      palette: {
        mode: isDark ? 'dark' as const : 'light' as const,
        primary: {
          main: isDark ? '#90caf9' : '#1976d2',
          light: isDark ? '#e3f2fd' : '#bbdefb',
          dark: isDark ? '#42a5f5' : '#1565c0',
          contrastText: '#fff',
        },
        secondary: {
          main: isDark ? '#f48fb1' : '#9c27b0',
          light: isDark ? '#f8bbd0' : '#ce93d8',
          dark: isDark ? '#f06292' : '#7b1fa2',
          contrastText: '#fff',
        },
        error: {
          main: isDark ? '#f44336' : '#d32f2f',
          light: isDark ? '#e57373' : '#ef5350',
          dark: isDark ? '#d32f2f' : '#c62828',
        },
        warning: {
          main: isDark ? '#ffa726' : '#ed6c02',
        },
        info: {
          main: isDark ? '#29b6f6' : '#0288d1',
        },
        success: {
          main: isDark ? '#66bb6a' : '#2e7d32',
        },
        background: {
          default: isDark ? '#121212' : '#f5f5f5',
          paper: isDark ? '#1e1e1e' : '#ffffff',
        },
        text: {
          primary: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
          secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
      spacing: (factor: number) => `${0.25 * factor}rem`,
      shape: {
        borderRadius: 4,
      },
    };
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  private applyTheme() {
    const theme = this.getEffectiveTheme();
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

// Create a singleton instance
export const themeManager = new ThemeManager();
