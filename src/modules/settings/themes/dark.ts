import { createTheme } from '@mui/material/styles';
import { baseTheme } from './base';

export const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#f06292',
    light: '#f8bbd0',
    dark: '#c2185b',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ffab40',
    light: '#ffd180',
    dark: '#ff6f00',
    contrastText: '#000000',
  },
  error: {
    main: '#ef5350',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffa726',
    light: '#ffcc80',
    dark: '#fb8c00',
    contrastText: '#000000',
  },
  info: {
    main: '#4fc3f7',
    light: '#81d4fa',
    dark: '#039be5',
    contrastText: '#ffffff',
  },
  success: {
    main: '#66bb6a',
    light: '#a5d6a7',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.7)',
    disabled: 'rgba(255,255,255,0.5)',
  },
  divider: 'rgba(255,255,255,0.12)',
  action: {
    active: '#ffffff',
    hover: 'rgba(255,255,255,0.08)',
    selected: 'rgba(255,255,255,0.16)',
    disabled: 'rgba(255,255,255,0.3)',
    disabledBackground: 'rgba(255,255,255,0.12)',
  },
};

export const darkTheme = createTheme({
  ...baseTheme,
  palette: darkPalette,
});
