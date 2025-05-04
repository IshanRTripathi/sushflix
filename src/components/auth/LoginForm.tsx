import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';

const countryCodes = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
];

export const LoginForm: React.FC<{ isOpen: boolean; onClose: () => void; openSignupModal: () => void }> = ({ isOpen, onClose, openSignupModal }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'phone' | 'email'>('email');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState('');
  const [credentials, setCredentials] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(true);
  const [emailPasswordMode, setEmailPasswordMode] = useState(true);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginIdentifier = tab === 'phone' ? phone : credentials;
      const isPasswordMode = tab === 'phone' ? phonePasswordMode : emailPasswordMode;

      if (!loginIdentifier.trim()) {
        setError(tab === 'phone' ? 'Please enter your phone number' : 'Please enter your email or username');
        return;
      }

      if (isPasswordMode) {
        if (!password.trim()) {
          setError('Please enter your password');
          return;
        }

        await login(loginIdentifier, password);
        navigate('/explore');
        onClose();
      } else {
        setError(`${tab === 'phone' ? 'Phone' : 'Email'} OTP login coming soon`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative max-w-md w-full mx-auto bg-white p-6 overflow-hidden rounded-lg shadow">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome to Bingeme.</h2>
        <p className="text-sm text-gray-500 mb-6">The future of creator-fan connection.</p>

        {/* Tabs */}
        <div className="flex mb-4 rounded-lg overflow-hidden bg-gray-100">
          <button
            className={`flex-1 py-2 text-sm font-medium ${tab === 'phone' ? 'bg-white text-black' : 'text-gray-500'}`}
            onClick={() => setTab('phone')}
          >
            Phone
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${tab === 'email' ? 'bg-white text-black' : 'text-gray-500'}`}
            onClick={() => setTab('email')}
          >
            Email/Username
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input fields */}
          {tab === 'phone' ? (
            <>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                <select
                  className="px-2 py-2 bg-gray-50 text-sm outline-none"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
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
                />
              </div>
              {phonePasswordMode && (
                <input
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              <button
                type="button"
                className="w-full border border-gray-300 rounded-lg py-2 font-medium hover:bg-gray-50 transition"
                onClick={() => setPhonePasswordMode(!phonePasswordMode)}
              >
                {phonePasswordMode ? 'Login via OTP' : 'Login via password'}
              </button>
            </>
          ) : (
            <>
              <input
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
                type="text"
                placeholder="Username or email"
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
              />
              {emailPasswordMode && (
                <input
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              <button
                type="button"
                className="w-full border border-gray-300 rounded-lg py-2 font-medium hover:bg-gray-50 transition"
                onClick={() => setEmailPasswordMode(!emailPasswordMode)}
              >
                {emailPasswordMode ? 'Login via OTP' : 'Login via password'}
              </button>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-xs">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        {/* Social login */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-xs text-gray-400">Or sign in with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 font-medium bg-white">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        {/* Redirect to Signup */}
        <div className="text-center mt-4 text-xs text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={() => {
              onClose();
              openSignupModal();
            }}
            className="text-indigo-600 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </Modal>
  );
};
