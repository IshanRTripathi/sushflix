// Reusable modal component with enhanced accessibility and styling
import React from 'react';

// Modal size variants
export const MODAL_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const;

// Modal variants
export const MODAL_VARIANTS = {
  DEFAULT: 'default',
  DIALOG: 'dialog',
  PANEL: 'panel'
} as const;

/**
 * Props interface for Modal component
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @param children - Content to render inside the modal
 * @param size - Size variant of the modal
 * @param variant - Visual variant of the modal
 * @param title - Optional title for the modal
 * @param className - Additional classes for styling
 * @param closeOnOutsideClick - Whether to close on clicking outside
 * @param closeOnEscape - Whether to close on pressing escape key
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: typeof MODAL_SIZES[keyof typeof MODAL_SIZES];
  variant?: typeof MODAL_VARIANTS[keyof typeof MODAL_VARIANTS];
  title?: string;
  className?: string;
  paperClassName?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: string | number;
  sx?: React.CSSProperties;
}

/**
 * Reusable modal component with enhanced accessibility and styling
 * @param props - ModalProps
 * @returns ReactNode
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = MODAL_SIZES.MD,
  variant = MODAL_VARIANTS.DEFAULT,
  title,
  className = '',
  paperClassName = '',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  maxWidth,
  sx = {}
}) => {
  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    [MODAL_SIZES.XS]: 'max-w-sm',
    [MODAL_SIZES.SM]: 'max-w-md',
    [MODAL_SIZES.MD]: 'max-w-lg',
    [MODAL_SIZES.LG]: 'max-w-xl',
    [MODAL_SIZES.XL]: 'max-w-2xl'
  };

  // Variant classes
  const variantClasses = {
    [MODAL_VARIANTS.DEFAULT]: 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl',
    [MODAL_VARIANTS.DIALOG]: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg',
    [MODAL_VARIANTS.PANEL]: 'bg-white dark:bg-gray-800 rounded-lg shadow-md'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4"
      onClick={closeOnOutsideClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      style={sx}
    >
      <div
        className={`relative w-full m-4 ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${paperClassName}`}
        style={{ maxWidth, ...sx }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export { Modal };
