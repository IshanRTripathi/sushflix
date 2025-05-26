import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Custom hook to access the theme context
 * 
 * @returns The theme context with theme-related functions and state
 * @throws {Error} If used outside of a ThemeProvider
 * 
 * @example
 * ```tsx
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     Switch to {isDark ? 'Light' : 'Dark'} Mode
 *   </button>
 * );
 * ```
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
