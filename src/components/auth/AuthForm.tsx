import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FormData, FormErrors } from '../../types/auth';
import { logger } from '../../utils/logger';

interface AuthFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: FormErrors;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  title: string;
}

export function AuthForm({ handleSubmit, isLoading, errors, formData, setFormData, title }: AuthFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    logger.debug(`Updating form field: ${id}`, { value: id === 'password' ? '***' : value });
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    logger.info('Auth form submitted', { formType: title });
    handleSubmit(e);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>

      {errors.general && (
        <div 
          role="alert"
          aria-live="assertive"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
          <span className="text-red-700">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500`}
            required
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            autoComplete="off"
            value={formData.username}
            onChange={handleInputChange}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.username ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500`}
            minLength={3}
            required
          />
          {errors.username && (
            <p id="username-error" className="mt-1 text-sm text-red-600">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleInputChange}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500`}
            minLength={8}
            required
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">↻</span>
              Processing...
            </span>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}