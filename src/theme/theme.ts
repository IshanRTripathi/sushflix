import { createTheme, Theme, ThemeOptions, PaletteOptions } from '@mui/material/styles';

// Type for our theme palette
type AppPalette = PaletteOptions & {
  mode: 'light' | 'dark';
  primary: Required<PaletteOptions>['primary'];
  secondary: Required<PaletteOptions>['secondary'];
  error: Required<PaletteOptions>['error'];
  warning: Required<PaletteOptions>['warning'];
  info: Required<PaletteOptions>['info'];
  success: Required<PaletteOptions>['success'];
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
};

// Base theme configuration that doesn't change between light/dark modes
const baseTheme: Omit<ThemeOptions, 'palette'> = {
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: { fontWeight: 600, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 600, fontSize: '2rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
};

// Light theme palette
const lightPalette: AppPalette = {
  mode: 'light',
  primary: {
    main: '#1976d2',
    light: '#bbdefb',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#e1bee7',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
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
};

// Dark theme palette
const darkPalette: AppPalette = {
  mode: 'dark',
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
    contrastText: '#ffffff',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
};

/**
 * Creates a theme instance with the specified color mode
 * @param isDark - Whether to use dark theme
 * @returns A configured theme instance
 */
const createAppTheme = (isDark: boolean): Theme => {
  const palette = isDark ? darkPalette : lightPalette;
  
  return createTheme({
    ...baseTheme,
    palette,
    components: {
      ...baseTheme.components,
      MuiAppBar: {
        ...baseTheme.components?.MuiAppBar,
        styleOverrides: {
          root: {
            backgroundColor: isDark ? darkPalette.background?.paper : lightPalette.background?.paper,
            color: isDark ? darkPalette.text?.primary : lightPalette.text?.primary,
            borderBottom: `1px solid ${isDark ? darkPalette.divider : lightPalette.divider}`,
          },
        },
      },
      MuiCard: {
        ...baseTheme.components?.MuiCard,
        styleOverrides: {
          root: {
            backgroundColor: isDark ? darkPalette.background?.paper : lightPalette.background?.paper,
            color: isDark ? darkPalette.text?.primary : lightPalette.text?.primary,
            boxShadow: isDark 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          },
        }
      }
    }
  });
}

export const lightTheme = createAppTheme(false);
export const darkTheme = createAppTheme(true);
