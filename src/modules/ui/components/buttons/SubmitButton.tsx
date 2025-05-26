// Reusable submit button component with loading state
import React from 'react';
import LoadingSpinner from '@/modules/ui/components/feedback/LoadingSpinner';

// Button size variants
export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline'
} as const;

/**
 * Props interface for SubmitButton component
 * @param isLoading - Whether the button is in loading state
 * @param buttonText - Text to display when not loading
 * @param loadingText - Text or component to display during loading
 * @param size - Size variant of the button
 * @param variant - Visual variant of the button
 * @param className - Additional classes for styling
 */
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  buttonText: string;
  loadingText: React.ReactNode;
  size?: typeof BUTTON_SIZES[keyof typeof BUTTON_SIZES];
  variant?: typeof BUTTON_VARIANTS[keyof typeof BUTTON_VARIANTS];
}

/**
 * Reusable submit button component with loading state
 * @param props - SubmitButtonProps
 * @returns ReactNode
 */
const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  buttonText,
  loadingText,
  disabled,
  size = BUTTON_SIZES.MD,
  variant = BUTTON_VARIANTS.PRIMARY,
  className = '',
  ...rest
}) => {
  // Validate required props
  if (!buttonText) {
    throw new Error('SubmitButton requires buttonText prop');
  }

  // Generate appropriate button classes based on variant and size
  const buttonClasses = {
    [BUTTON_VARIANTS.PRIMARY]: {
      base: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      disabled: 'bg-indigo-400'
    },
    [BUTTON_VARIANTS.SECONDARY]: {
      base: 'text-gray-900 bg-white hover:bg-gray-50 focus:ring-gray-500',
      disabled: 'bg-gray-100'
    },
    [BUTTON_VARIANTS.OUTLINE]: {
      base: 'text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
      disabled: 'text-gray-400 border-gray-300'
    }
  };

  const sizeClasses = {
    [BUTTON_SIZES.SM]: 'py-1.5 px-3 text-sm',
    [BUTTON_SIZES.MD]: 'py-2 px-4 text-sm',
    [BUTTON_SIZES.LG]: 'py-3 px-6 text-base'
  };

  const baseClasses = 'w-full flex justify-center rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200';

  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${buttonClasses[variant].base} ${
        disabled ? buttonClasses[variant].disabled : ''
      } ${className}`}
      aria-disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" className="text-white" />
          {loadingText}
        </div>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default SubmitButton;
