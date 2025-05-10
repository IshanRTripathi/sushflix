// Signup form component with enhanced validation and error handling
import React, { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';
import SubmitButton from '../common/SubmitButton';
import FormField from '../common/FormField';
import { API_BASE_URL } from '../../config/index';

// Form field validation rules
const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    message: 'Invalid email format'
  },
  username: {
    required: true,
    minLength: 3,
    message: 'Username must be at least 3 characters'
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters'
  }
} as const;

// API request types
interface SignupRequest {
  email: string;
  username: string;
  password: string;
  isCreator: boolean;
}

interface SignupResponse {
  success: boolean;
  message?: string;
  userId?: string;
}

/**
 * Props interface for SignupForm component
 * @param onClose - Callback to close the signup modal
 * @param openLoginModal - Optional callback to open login modal
 */
interface SignupFormProps {
  onClose: () => void;
  openLoginModal?: () => void;
}

/**
 * Form data interface
 * @property email - User's email address
 * @property username - User's username
 * @property password - User's password
 */
interface FormData {
  email: string;
  username: string;
  password: string;
}

/**
 * Form errors interface
 * @property email - Email validation error
 * @property username - Username validation error
 * @property password - Password validation error
 * @property general - General form submission error
 */
interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  general?: string;
}

/**
 * Signup form component with enhanced validation and error handling
 * @param props - SignupFormProps
 * @returns ReactNode
 */
export function SignupForm({ onClose, openLoginModal }: SignupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form validation with retry logic
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION_RULES.email.pattern.test(formData.email)) {
      newErrors.email = VALIDATION_RULES.email.message;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < VALIDATION_RULES.username.minLength) {
      newErrors.username = VALIDATION_RULES.username.message;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION_RULES.password.minLength) {
      newErrors.password = VALIDATION_RULES.password.message;
    }

    return newErrors;
  }, [formData]);

  // Form submission with retry logic
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug('Signup form submitted');
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      logger.warn('Form validation failed', { errors: validationErrors });
      return;
    }

    setIsLoading(true);
    try {
      logger.info('Attempting signup', { 
        email: formData.email.substring(0, 3) + '***@***',
        username: formData.username 
      });

      const signupData: SignupRequest = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        isCreator: false
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error('Signup failed with status', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorBody: errorBody || 'Empty response body'
        });
        throw new Error(errorBody || 'Signup failed');
      }

      const data: SignupResponse = await response.json();
      logger.info('Signup successful', { 
        username: formData.username,
        userId: data.userId
      });

      await login(formData.username.trim(), formData.password);
      navigate('/');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      logger.error('Signup error details', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        formData: {
          email: formData.email.substring(0, 3) + '***@***',
          username: formData.username.substring(0, 3) + '***'
        },
        retryCount
      });
      
      // Handle specific error cases
      if (errorMessage.includes('already exists')) {
        setErrors({ 
          general: 'An account with this email already exists',
          email: 'This email is already registered'
        });
      } else {
        setErrors({ general: errorMessage });
      }

      // Retry logic
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setErrors(prev => ({ ...prev, general: undefined }));
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, retryCount, login, navigate, onClose]);

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Join Sushflix</h1>
          <p className="text-sm text-gray-500">The future of streaming.</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close signup modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Email"
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          error={errors.email}
          required
        />

        <FormField
          label="Username"
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          error={errors.username}
          minLength={3}
          required
        />

        <FormField
          label="Password"
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          error={errors.password}
          minLength={8}
          required
        />

        {errors.general && (
          <div role="alert" aria-live="assertive" className="mt-4 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
            <span className="text-red-700 text-xs">{errors.general}</span>
          </div>
        )}

        <SubmitButton
          isLoading={isLoading}
          buttonText="Sign Up →"
          loadingText={
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">↻</span>
              Creating account...
            </span>
          }
        />

        <div className="text-center mt-4 text-xs text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => {
              logger.debug('Switching to login form');
              openLoginModal?.();
            }}
            className="text-indigo-600 font-medium"
            aria-label="Switch to login form"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}