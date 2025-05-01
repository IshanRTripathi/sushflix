import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FormData, FormErrors } from '../../types/auth';

interface AuthFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: FormErrors;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  title: string;
}

export function AuthForm({ handleSubmit, isLoading, errors, formData, setFormData, title }: AuthFormProps) {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            autoComplete="off"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.username ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500`}
          />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            } focus:border-indigo-500 focus:ring-indigo-500`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}