import { createTheme } from '@mui/material/styles';
import { baseTheme } from './base';

/**
 * Light theme configuration
 */
const lightPalette = {
  mode: 'light' as const,
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

/**
 * Create and export the light theme
 */
export const lightTheme = createTheme({
  ...baseTheme,
  palette: lightPalette,
  components: {
    ...baseTheme.components,
    MuiAppBar: {
      ...baseTheme.components?.MuiAppBar,
      styleOverrides: {
        root: {
          backgroundColor: lightPalette.background.paper,
          color: lightPalette.text.primary,
          borderBottom: `1px solid ${lightPalette.divider}`,
        },
      },
    },
    MuiCard: {
      ...baseTheme.components?.MuiCard,
      styleOverrides: {
        root: {
          backgroundColor: lightPalette.background.paper,
          color: lightPalette.text.primary,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
});

