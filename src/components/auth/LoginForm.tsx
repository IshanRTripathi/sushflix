import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import SubmitButton from '../common/SubmitButton';
import FormField from '../common/FormField'; // Import FormField
import { useAuth } from './AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate(); // Initialize useNavigate

  const validateForm = (): boolean => {
    console.log("Validating LoginForm with data:", formData); // Log form data before validation
    const newErrors: FormErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username or Email is required'; // Updated message
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username/Email should be >= 3 characters'; // Updated message
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    console.log("Validation errors:", newErrors); // Log validation errors
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("LoginForm handleSubmit triggered"); // Log submit trigger

    if (!validateForm()) {
        console.log("LoginForm validation failed");
        return;
    }
    console.log("LoginForm validation successful");

    setIsLoading(true);
    try {
      console.log(`Calling context login with username: ${formData.username}`);
      // Call the login function from AuthContext
      const user = await login(formData.username, formData.password);

      // If login is successful (user object is returned), navigate
      if (user) {
        console.log("Login successful, navigating...");
        const redirectPath = user.isCreator ? '/creator/dashboard' : '/discover';
        navigate(redirectPath); // Use navigate for SPA redirection
      }
      // If login fails, the login function in AuthContext should throw an error

    } catch (error: unknown) {
      console.error("Login error caught in component:", error);
      // Catch errors thrown by the login function (e.g., invalid credentials)
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred during login'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>

          {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500"/>
                <span className="text-red-700">{errors.general}</span>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
                label="Username or Email"
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                error={errors.username}
            />

            <FormField
                label="Password"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                error={errors.password}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <SubmitButton
              isLoading={isLoading}
              buttonText="Sign in"
              loadingText="Signing in..."
            />
          </form>
        </div>
      </div>
  );
}