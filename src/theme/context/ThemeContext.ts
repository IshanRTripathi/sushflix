import { createContext } from 'react';
import { ThemeContextType } from '../types';

/**
 * Theme context that provides theme-related functionality throughout the application.
 * This context is used by the useTheme hook.
 * 
 * @see useTheme
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
