import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from './AuthContext';
import { AlertCircle } from 'lucide-react';
import { signupUser } from '../../services/apiService';
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<'phone' | 'email'>('email');
  const [isSignup, setIsSignup] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(true); // true = password, false = otp
  const [emailPasswordMode, setEmailPasswordMode] = useState(true); // true = password, false = otp
  const { login } = useAuth();

  // Log user actions
  const logAction = (action: string, data?: any) => {
    console.log('[LoginModal] Action:', action);
    if (data) {
      console.log('[LoginModal] Data:', data);
    }
  };

  // Log API responses
  const logApiResponse = (type: 'success' | 'error', response: any) => {
    console.log(`[LoginModal] API ${type}:`, response);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      logAction('Login attempt', { tab, emailOrUsername, phone, passwordMode: emailPasswordMode ? 'password' : 'otp' });
      
      if (tab === 'phone') {
        if (phonePasswordMode) {
          logAction('Attempting phone password login');
          const response = await login(phone, password);
          logApiResponse('success', response);
        } else {
          logAction('Attempting phone OTP login');
          // TODO: Implement phone OTP login
        }
      } else {
        if (emailPasswordMode) {
          logAction('Attempting email/password login');
          const response = await login(emailOrUsername, password);
          logApiResponse('success', response);
        } else {
          logAction('Attempting email OTP login');
          // TODO: Implement email OTP login
        }
      }
      logAction('Login successful');
      onClose();
    } catch (err: any) {
      logApiResponse('error', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      logAction('Signup attempt', { username, emailOrUsername, password });
      
      if (!username || !emailOrUsername || !password) {
        setError('Please fill in all required fields');
        return;
      }

      const userData = {
        username: username.trim(),
        email: emailOrUsername.trim(),
        password,
        isCreator: false
      };

      const response = await signupUser(userData);
      logApiResponse('success', response);
      logAction('Signup successful');
      onClose();
    } catch (err: any) {
      logApiResponse('error', err);
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    logAction('Form reset');
    setError('');
    setPhone('');
    setEmailOrUsername('');
    setUsername('');
    setPassword('');
    setPhonePasswordMode(true);
    setEmailPasswordMode(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative max-w-md w-full mx-auto bg-white p-2 overflow-hidden">
        <h2 className="text-2xl font-bold mb-1">Welcome to Sushflix.</h2>
        <p className="text-gray-500 mb-6 text-sm">The future of creator-fan connection.</p>
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className={`px-6 py-2 rounded-t-lg font-medium text-sm focus:outline-none ${tab === 'phone' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
            onClick={() => { setTab('phone'); setIsSignup(false); resetForm(); }}
          >
            Phone
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-t-lg font-medium text-sm focus:outline-none ${tab === 'email' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
            onClick={() => { setTab('email'); setIsSignup(false); resetForm(); }}
          >
            Email
          </button>
        </div>
        {tab === 'phone' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={isLoading}
              />
            </div>
            {phonePasswordMode ? (
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
              </div>
            ) : null}
            {error && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded flex items-center text-sm">
                <AlertCircle className="mr-2" size={18} />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign in →'}
            </button>
            <button
              type="button"
              className="w-full border mt-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
              onClick={() => setPhonePasswordMode((prev) => !prev)}
            >
              {phonePasswordMode ? 'Login via OTP' : 'Login via password'}
            </button>
          </form>
        ) : (
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4 text-left">
            {isSignup && (
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">Email or Username</label>
              <input
                type="text"
                placeholder="Enter email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={isLoading}
              />
            </div>
            {emailPasswordMode ? (
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
              </div>
            ) : null}
            {error && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded flex items-center text-sm">
                <AlertCircle className="mr-2" size={18} />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (isSignup ? 'Signing up...' : 'Logging in...') : (isSignup ? 'Sign up' : 'Sign in →')}
            </button>
            <button
              type="button"
              className="w-full border mt-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
              onClick={() => setEmailPasswordMode((prev) => !prev)}
            >
              {emailPasswordMode ? 'Login via OTP' : 'Login via password'}
            </button>
          </form>
        )}
        {!isSignup && tab === 'email' && (
          <div className="mt-2 text-xs text-center">
            <a href="#" className="text-gray-700 font-semibold hover:underline">Forgot Password ?</a>
          </div>
        )}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-3 text-gray-400 text-xs">Or sign in with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <div className="mt-4 text-sm text-center">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setIsSignup(false); resetForm(); }}
                className="text-red-600 hover:underline font-semibold"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              New to Sushflix?{' '}
              <button
                onClick={() => { setIsSignup(true); resetForm(); }}
                className="text-red-600 hover:underline font-semibold"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}