// Login form component with phone and email authentication options
import React, { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { logger } from '../../utils/logger';

// Configuration constants
const DEFAULT_COUNTRY_CODE = '+91';

// Country codes interface
interface CountryCode {
  code: string;
  flag: string;
  name: string;
}

const COUNTRY_CODES: readonly CountryCode[] = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
] as const;

// Error messages
const ERROR_MESSAGES = {
  PHONE_REQUIRED: 'Please enter your phone number',
  CREDENTIALS_REQUIRED: 'Please enter your email or username',
  PASSWORD_REQUIRED: 'Please enter your password',
} as const;

// Component props interface
interface LoginFormProps {
  onClose: () => void;
  openSignupModal: () => void;
}

// Login modes
type LoginMode = 'phone' | 'email';

/**
 * Login form component with phone and email authentication options
 * @param onClose - Callback to close the modal
 * @param openSignupModal - Callback to open signup modal
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose, openSignupModal }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State management
  const [tab, setTab] = useState<LoginMode>('email');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState('');
  const [credentials, setCredentials] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(true);
  const [emailPasswordMode, setEmailPasswordMode] = useState(true);

  // Form handlers
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    logger.debug('Login form submitted', { loginMethod: tab });

    try {
      const loginIdentifier = tab === 'phone' ? phone : credentials;
      
      if (!loginIdentifier.trim()) {
        const errorMsg = tab === 'phone' 
          ? ERROR_MESSAGES.PHONE_REQUIRED 
          : ERROR_MESSAGES.CREDENTIALS_REQUIRED;
        logger.warn('Validation failed', { error: errorMsg });
        setError(errorMsg);
        return;
      }

      if (!password.trim()) {
        logger.warn('Validation failed', { error: ERROR_MESSAGES.PASSWORD_REQUIRED });
        setError(ERROR_MESSAGES.PASSWORD_REQUIRED);
        return;
      }

      // Mask sensitive information for logging
      const maskedIdentifier = tab === 'phone' 
        ? `${countryCode}${phone.substring(0, 3)}***` 
        : credentials.includes('@') 
          ? credentials.substring(0, 3) + '***@***' 
          : credentials;

      logger.info('Attempting login', { identifier: maskedIdentifier });

      await login(loginIdentifier, password);
      logger.info('Login successful', { identifier: maskedIdentifier });
      navigate('/explore');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      logger.error('Login failed', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        identifier: tab === 'phone' 
          ? `${countryCode}${phone.substring(0, 3)}***` 
          : credentials.includes('@') 
            ? credentials.substring(0, 3) + '***@***' 
            : credentials,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tab, phone, credentials, password, countryCode, login, navigate, onClose]);

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome to Sushflix</h1>
          <p className="text-sm text-gray-500">The future of streaming.</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close login modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex mb-4 rounded-lg overflow-hidden bg-gray-100">
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium ${tab === 'phone' ? 'bg-white text-black' : 'text-gray-500'}`}
          onClick={() => {
            logger.debug('Switched to phone login tab');
            setTab('phone');
          }}
          aria-pressed={tab === 'phone'}
        >
          Phone
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium ${tab === 'email' ? 'bg-white text-black' : 'text-gray-500'}`}
          onClick={() => {
            logger.debug('Switched to email login tab');
            setTab('email');
          }}
          aria-pressed={tab === 'email'}
        >
          Email/Username
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {tab === 'phone' ? (
          <>
            <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
              <select
                className="px-2 py-2 bg-gray-50 text-sm outline-none"
                value={countryCode}
                onChange={(e) => {
                  logger.debug('Country code changed', { code: e.target.value });
                  setCountryCode(e.target.value);
                }}
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} aria-label={`${c.name} (${c.code})`}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 px-3 py-2 bg-gray-50 outline-none text-sm"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Phone number"
                aria-invalid={!!error}
              />
            </div>
            {phonePasswordMode && (
              <input
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
            )}
          </>
        ) : (
          <>
            <input
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
              type="text"
              placeholder="Username or email"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              aria-label="Username or email"
              aria-invalid={!!error}
            />
            {emailPasswordMode && (
              <input
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
            )}
          </>
        )}

        {error && (
          <div 
            role="alert"
            aria-live="assertive"
            className="mt-4 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
            <span id="password-error" className="text-red-700 text-xs">
              {error}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">↻</span>
              Signing in...
            </span>
          ) : (
            'Sign in →'
          )}
        </button>
      </form>

      <div className="text-center mt-4 text-xs text-gray-500">
        Don't have an account?{' '}
        <button 
          onClick={() => {
            logger.debug('Switching to signup form');
            openSignupModal?.();
          }}
          className="text-indigo-600 font-medium"
          aria-label="Switch to signup form"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};