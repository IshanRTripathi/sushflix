import { useState, ChangeEvent, useCallback } from 'react';

/**
 * Represents validation rules for a form field
 */
export interface ValidationRule<T> {
  /**
   * Validation function that returns an error message if validation fails
   */
  validator: (value: T[keyof T], values: T) => string | undefined;
  /**
   * Whether to run this validation rule on every change
   */
  validateOnChange?: boolean;
  /**
   * Whether to run this validation rule on blur
   */
  validateOnBlur?: boolean;
}

/**
 * Configuration options for the form
 */
export interface FormConfig<T> {
  /**
   * Initial values for the form
   */
  initialValues: T;
  /**
   * Validation rules for each field
   */
  validationRules?: Partial<{
    [K in keyof T]: ValidationRule<T>[] | ValidationRule<T>;
  }>;
  /**
   * Callback when form is submitted
   */
  onSubmit?: (values: T) => void | Promise<void>;
  /**
   * Whether to validate on submit
   * @default true
   */
  validateOnSubmit?: boolean;
  /**
   * Whether to validate on change
   * @default false
   */
  validateOnChange?: boolean;
  /**
   * Whether to validate on blur
   * @default true
   */
  validateOnBlur?: boolean;
}

/**
 * Form state and handlers
 */
export interface FormState<T> {
  /**
   * Current form values
   */
  values: T;
  /**
   * Form errors
   */
  errors: Partial<Record<keyof T, string>> & { general?: string };
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;
  /**
   * Whether the form has been touched
   */
  isTouched: boolean;
  /**
   * Whether the form is valid
   */
  isValid: boolean;
  /**
   * Fields that have been touched
   */
  touched: Partial<Record<keyof T, boolean>>;
  /**
   * Handle input change
   */
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /**
   * Handle input blur
   */
  handleBlur: (field: keyof T) => void;
  /**
   * Handle form submission
   */
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  /**
   * Reset form to initial values
   */
  resetForm: () => void;
  /**
   * Set a field value
   */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /**
   * Set a field error
   */
  setFieldError: (field: keyof T, error: string | undefined) => void;
  /**
   * Validate the entire form
   */
  validateForm: () => boolean;
}

/**
 * Custom hook for managing form state and validation
 * @template T - The shape of the form values
 * @param config - Form configuration
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, any>>(config: FormConfig<T>): FormState<T> {
  const {
    initialValues,
    validationRules = {},
    onSubmit,
    validateOnSubmit = true,
    validateOnChange = false,
    validateOnBlur = true,
  } = config;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormState<T>['errors']>({});
  const [touched, setTouched] = useState<FormState<T>['touched']>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  /**
   * Validates a single field
   */
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      const rules = (validationRules as any)?.[field];
      if (!rules) return undefined;

      const rulesArray = Array.isArray(rules) ? rules : [rules];

      for (const rule of rulesArray) {
        const error = rule.validator(value, values);
        if (error) return error;
      }

      return undefined;
    },
    [validationRules, values]
  );

  /**
   * Validates all fields in the form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormState<T>['errors'] = {};
    let hasError = false;

    (Object.keys(values) as Array<keyof T>).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        (newErrors as any)[field] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasError);
    return !hasError;
  }, [values, validateField]);

  /**
   * Handles input change events
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;
      const fieldValue = type === 'number' ? Number(value) : value;

      const newValues = {
        ...values,
        [fieldName]: fieldValue,
      };

      setValues(newValues);

      // Update touched state
      if (!touched[fieldName]) {
        setTouched((prev) => ({
          ...prev,
          [fieldName]: true,
        }));
      }

      // Validate on change if enabled
      if (validateOnChange) {
        const rules = (validationRules as any)?.[fieldName];
        if (rules) {
          const rulesArray = Array.isArray(rules) ? rules : [rules];
          const shouldValidate = rulesArray.some((rule: any) => rule.validateOnChange !== false);
          
          if (shouldValidate) {
            const error = validateField(fieldName, fieldValue as T[keyof T]);
            setErrors((prev) => ({
              ...prev,
              [fieldName]: error,
            } as any));
          }
        }
      }
    },
    [values, touched, validateOnChange, validationRules, validateField]
  );

  /**
   * Handles input blur events
   */
  const handleBlur = useCallback(
    (field: keyof T) => {
      if (!touched[field]) {
        setTouched((prev) => ({
          ...prev,
          [field]: true,
        }));
      }

      // Validate on blur if enabled
      if (validateOnBlur) {
        const rules = (validationRules as any)?.[field];
        if (rules) {
          const rulesArray = Array.isArray(rules) ? rules : [rules];
          const shouldValidate = rulesArray.some((rule: any) => rule.validateOnBlur !== false);
          
          if (shouldValidate) {
            const error = validateField(field, values[field]);
            setErrors((prev) => ({
              ...prev,
              [field]: error,
            } as any));
          }
        }
      }
    },
    [touched, validateOnBlur, validationRules, validateField, values]
  );

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate form if enabled
      const shouldSubmit = validateOnSubmit ? validateForm() : true;
      
      if (shouldSubmit && onSubmit) {
        try {
          setIsSubmitting(true);
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
          setErrors((prev) => ({
            ...prev,
            general: 'An error occurred while submitting the form',
          }));
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [onSubmit, validateForm, validateOnSubmit, values]
  );

  /**
   * Resets the form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Sets a field value
   */
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Re-validate if field was touched
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [touched, validateField]
  );

  /**
   * Sets a field error
   */
  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    isTouched: Object.keys(touched).length > 0,
    isValid,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateForm,
  };
}