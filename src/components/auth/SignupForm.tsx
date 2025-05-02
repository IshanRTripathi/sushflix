import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { AxiosError } from 'axios';
import SubmitButton from '../common/SubmitButton';
import FormField from '../common/FormField'; // Import the new FormField component

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

interface SignupResponse {
  newUser?: {
    isCreator: boolean;
    [key: string]: any;
  };
  errors?: Array<{ param: string; msg: string }>;
  message?: string;
}

export function SignupForm() {
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

  const signup = async (
    username: string,
    password: string,
    email: string
  ): Promise<SignupResponse> => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL; // Get backend URL from environment variable
    console.log('VITE_BACKEND_URL:', backendUrl); // Add this line for logging
    try {
      const response = await axios.post(`${backendUrl}/auth/signup`, {
        username,
        password,
        email,
        isCreator: false
      });

      return response.data as SignupResponse;
    } catch (e: unknown) {
      const error = e as AxiosError;
      if (error.response?.data) {
        return error.response.data as SignupResponse;
      } else {
        return { message: 'No response from server' };
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await signup(
        formData.username.trim(),
        formData.password,
        formData.email.trim()
      );

      if (response.errors) {
        const serverErrors: FormErrors = {};
        response.errors.forEach((err) => {
          serverErrors[err.param as keyof FormErrors] = err.msg;
        });
        setErrors(serverErrors);
      } else if (response.message) {
        if (response.message === 'Email already exists') {
          setErrors({ email: 'Email already exists' });
        } else if (response.message === 'Username already exists') {
          setErrors({ username: 'Username already exists' });
        } else {
          setErrors({ general: response.message });
        }
      } else if (response.newUser) {
        localStorage.setItem('user', JSON.stringify(response.newUser));
        await login(formData.username.trim(), formData.password);
        setSuccess(true);
        navigate(response.newUser.isCreator ? '/creator/dashboard' : '/discover');
      } else {
        setErrors({ general: 'An unexpected error occurred during signup' });
      }
    } catch (error: unknown) {
      setErrors({ general: error instanceof Error ? error.message : 'An error occurred during signup' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
  );
}
