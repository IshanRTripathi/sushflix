export const API_BASE_URL = 'https://sushflix-backend-796527544626.us-central1.run.app';

// Theme configuration
export { ThemeProvider, ThemeContext } from '../theme/ThemeProvider';
export { useTheme } from '../theme/useTheme';
export type { ThemeMode, ThemeOptions, ThemeContextType } from '../theme/types';
export { lightTheme, darkTheme } from '../theme/theme';
export { themeManager } from '../theme/ThemeManager';

export const DEFAULT_THEME = 'dark';

// Authentication configuration
export const AUTH_TOKEN_KEY = 'sushflix_auth_token';
export const USER_PROFILE_KEY = 'sushflix_user_profile';

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this resource',
  NETWORK_ERROR: 'Network error occurred. Please check your connection',
  TIMEOUT: 'Request timed out. Please try again',
  BAD_REQUEST: 'Invalid request. Please check your inputs',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'An unexpected server error occurred',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  PROFILE_UPDATED: 'Profile updated successfully',
  POST_CREATED: 'Post created successfully',
  POST_DELETED: 'Post deleted successfully',
};
