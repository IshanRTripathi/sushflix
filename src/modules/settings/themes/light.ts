import { createTheme } from '@mui/material/styles';
import { baseTheme } from './base';

export const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#e91e63', // bold pink
    light: '#f06292',
    dark: '#c2185b',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffb300',
    light: '#ffe082',
    dark: '#ffa000',
    contrastText: '#000000',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fff8f9',
    paper: '#ffffff',
  },
  text: {
    primary: '#2a2a2a',
    secondary: '#5f5f5f',
    disabled: '#9e9e9e',
  },
  divider: '#e0e0e0',
  action: {
    active: '#000000',
    hover: 'rgba(0, 0, 0, 0.05)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: lightPalette,
});
