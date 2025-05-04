import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios'; // Keep AxiosError type import
import SubmitButton from '../common/SubmitButton';
import FormField from '../common/FormField'; // Import the new FormField component
import { signupUser } from '../../services/apiService'; // Import signupUser from the centralized service

interface FormData {
  email: string;
  username: string;
  password: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  general?: string;
}

interface SignupResponseData { // Renamed to reflect data structure within response
  newUser?: {
    isCreator: boolean;
    [key: string]: any;
  };
  errors?: Array<{ param: string; msg: string }>;
  message?: string;
}

export function SignupForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
  });

  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    const email = formData.email.trim();
    const username = formData.username.trim();
    const password = formData.password;

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one capital letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    return newErrors;
  };

  // Removed the local signup function as it's now in apiService.ts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Use the imported signupUser function from the API service
      const response = await signupUser({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        isCreator: false // Assuming isCreator is always false for signup form
      });

      // Access data from the Axios response object (response.data)
      const responseData = response.data as SignupResponseData;

      if (responseData.errors) {
        const serverErrors: FormErrors = {};
        responseData.errors.forEach((err: { param: string; msg: string }) => {
          serverErrors[err.param as keyof FormErrors] = err.msg;
        });
        setErrors(serverErrors);
      } else if (responseData.message) {
        if (responseData.message === 'Email already exists') {
          setErrors({ email: 'Email already exists' });
        } else if (responseData.message === 'Username already exists') {
          setErrors({ username: 'Username already exists' });
        } else {
          setErrors({ general: responseData.message });
        }
      } else if (responseData.newUser) {
        localStorage.setItem('user', JSON.stringify(responseData.newUser));
        await login(formData.username.trim(), formData.password);
        setSuccess(true);
        // Navigate based on isCreator from the response
        navigate(responseData.newUser.isCreator ? '/creator/dashboard' : '/discover');
      } else {
        // Handle unexpected response structure
        setErrors({ general: responseData.message || 'An unexpected error occurred during signup' });
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        // Handle errors returned with non-2xx status codes
        const errorData = axiosError.response.data as SignupResponseData;
        if (errorData.errors) {
          const serverErrors: FormErrors = {};
          errorData.errors.forEach((err: { param: string; msg: string }) => {
            serverErrors[err.param as keyof FormErrors] = err.msg;
          });
          setErrors(serverErrors);
        } else if (errorData.message) {
          if (errorData.message === 'Email already exists') {
            setErrors({ email: 'Email already exists' });
          }
           else if (errorData.message === 'Username already exists') {
            setErrors({ username: 'Username already exists' });
          }
           else {
            setErrors({ general: errorData.message });
          }
        } else {
           setErrors({ general: errorData.message || axiosError.message || 'An unexpected error occurred during signup' });
        }
      } else {
        // Handle network errors or errors without response data
        setErrors({ general: axiosError.message || 'An error occurred during signup' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              <span className="text-green-700">Account created successfully!</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create your account</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            <FormField
              label="Username"
              id="username"
              type="text"
              autoComplete="off"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
            />

            <FormField
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />

            <SubmitButton
              isLoading={isLoading}
              buttonText="Sign up"
              loadingText="Creating account...">
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
