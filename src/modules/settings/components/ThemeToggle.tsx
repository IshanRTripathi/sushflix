import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  /**
   * Whether to show the theme label next to the icon
   * @default false
   */
  showLabel?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A reusable theme toggle button that switches between light and dark themes.
 * Can be used as a standalone icon or with a label.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
  size = 'md',
  ...props
}) => {
  const { isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const labelText = isDark ? 'Light Mode' : 'Dark Mode';

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${sizeClasses[size]} ${className}`}
      aria-label={`Switch to ${labelText}`}
      title={`Switch to ${labelText}`}
      {...props}
    >
      <svg
        className={`${iconSizes[size]} text-gray-800 dark:text-white`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden={!showLabel}
      >
        {isDark ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        )}
      </svg>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {labelText}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
