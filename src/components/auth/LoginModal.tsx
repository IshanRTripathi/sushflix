import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from './AuthContext';
import { AlertCircle } from 'lucide-react';
import { signupUser } from '../../services/apiService';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET || '';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<'phone' | 'email'>('email');
  const [isSignup, setIsSignup] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phonePasswordMode, setPhonePasswordMode] = useState(true); // true = password, false = otp
  const [emailPasswordMode, setEmailPasswordMode] = useState(true); // true = password, false = otp
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (tab === 'email') {
        if (emailPasswordMode) {
          await login(emailOrUsername, password);
        } else {
          setError('Email OTP login not implemented');
          setIsLoading(false);
          return;
        }
      } else {
        if (phonePasswordMode) {
          setError('Phone password login not implemented');
        } else {
          setError('Phone OTP login not implemented');
        }
        setIsLoading(false);
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await signupUser({
        email: email.trim(),
        username: username.trim(),
        password,
        isCreator: false
      });
      if (response.data.newUser) {
        await login(username.trim(), password);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailOrUsername('');
    setPhone('');
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
    setPhonePasswordMode(true);
    setEmailPasswordMode(true);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      const { credential } = credentialResponse;
      // Send credential to backend for verification and login
      const res = await axios.post('/api/auth/google', { credential });
      // You may want to update auth context here
      // For example: loginWithGoogle(res.data)
      onClose();
    } catch (err) {
      setError('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="relative max-w-md w-full mx-auto bg-white p-2 overflow-hidden">
          <h2 className="text-2xl font-bold mb-1">Welcome to Sushflix.</h2>
          <p className="text-gray-500 mb-6 text-sm">The future of creator-fan connection.</p>
          <div className="flex justify-center mb-6">
            <button
              className={`px-6 py-2 rounded-t-lg font-medium text-sm focus:outline-none ${tab === 'phone' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
              onClick={() => { setTab('phone'); setIsSignup(false); resetForm(); }}
            >
              Phone
            </button>
            <button
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
            <>
              <div className="mt-2 text-xs text-center">
                <a href="#" className="text-gray-700 font-semibold hover:underline">Forgot Password ?</a>
              </div>
            </>
          )}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-3 text-gray-400 text-xs">Or sign in with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            width="100%"
            shape="rectangular"
            text="signin_with"
            theme="outline"
            size="large"
          />
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
    </GoogleOAuthProvider>
  );
} 