// Reusable loading spinner component
import React from 'react';

// Spinner size variants
export const SPINNER_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const;

// Spinner color variants
export const SPINNER_COLORS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GRAY: 'gray'
} as const;

/**
 * Props interface for LoadingSpinner component
 * @param size - Size variant of the spinner
 * @param color - Color variant of the spinner
 * @param className - Additional classes for styling
 */
interface LoadingSpinnerProps {
  size?: typeof SPINNER_SIZES[keyof typeof SPINNER_SIZES];
  color?: typeof SPINNER_COLORS[keyof typeof SPINNER_COLORS];
  className?: string;
}

/**
 * Reusable loading spinner component
 * @param props - LoadingSpinnerProps
 * @returns ReactNode
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = SPINNER_SIZES.MD,
  color = SPINNER_COLORS.GRAY,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    [SPINNER_SIZES.XS]: 'w-2 h-2',
    [SPINNER_SIZES.SM]: 'w-4 h-4',
    [SPINNER_SIZES.MD]: 'w-6 h-6',
    [SPINNER_SIZES.LG]: 'w-8 h-8',
    [SPINNER_SIZES.XL]: 'w-12 h-12'
  };

  // Color classes
  const colorClasses = {
    [SPINNER_COLORS.PRIMARY]: {
      base: 'border-indigo-200 border-t-indigo-600',
      dark: 'border-indigo-700 border-t-indigo-400'
    },
    [SPINNER_COLORS.SECONDARY]: {
      base: 'border-gray-200 border-t-gray-600',
      dark: 'border-gray-700 border-t-gray-400'
    },
    [SPINNER_COLORS.GRAY]: {
      base: 'border-gray-200 border-t-gray-600',
      dark: 'border-gray-700 border-t-gray-400'
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color].base} rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;