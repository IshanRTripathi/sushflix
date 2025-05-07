// Reusable form field component with enhanced validation and error handling
import React from 'react';

// Input field types
export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number'
} as const;

// Form field validation states
export const VALIDATION_STATES = {
  VALID: 'valid',
  INVALID: 'invalid',
  PENDING: 'pending'
} as const;

/**
 * Props interface for FormField component
 * @param label - The label text for the input field
 * @param id - Unique identifier for the input field
 * @param error - Optional error message to display
 * @param className - Optional additional classes for styling
 * @param type - Type of input field (text, email, password, etc.)
 * @param required - Whether the field is required
 * @param disabled - Whether the field is disabled
 * @param readOnly - Whether the field is read-only
 * @param placeholder - Optional placeholder text
 * @param maxLength - Maximum length for text inputs
 * @param minLength - Minimum length for text inputs
 * @param pattern - Pattern for input validation
 */
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  validationState?: typeof VALIDATION_STATES[keyof typeof VALIDATION_STATES];
  inputType?: typeof INPUT_TYPES[keyof typeof INPUT_TYPES];
}

/**
 * Reusable form field component with enhanced validation and error handling
 * @param props - FormFieldProps
 * @returns ReactNode
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  className,
  validationState = VALIDATION_STATES.VALID,
  inputType = INPUT_TYPES.TEXT,
  ...rest
}) => {
  // Validate required props
  if (!label || !id) {
    throw new Error('FormField requires both label and id props');
  }

  // Generate appropriate input classes based on validation state
  const inputClassName = `mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
    validationState === VALIDATION_STATES.INVALID ? 'border-red-300' : 'border-gray-300'
  } ${className || ''}`;

  return (
    <div className="space-y-1">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700"
        aria-label={label}
      >
        {label}
      </label>
      <input
        id={id}
        type={inputType}
        className={inputClassName}
        aria-invalid={validationState === VALIDATION_STATES.INVALID}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p 
          id={`${id}-error`} 
          className="mt-1 text-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
