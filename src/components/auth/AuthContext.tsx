import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { UserProfile } from '../../types/user';
import { logger } from '../../utils/logger';

// Centralized endpoint configuration
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}auth/login`,
  LOGOUT: `${API_BASE_URL}auth/logout`,
  PROFILE: `${API_BASE_URL}auth/me`
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalType: 'login' | 'signup';
  openAuthModal: (type: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    logger.debug('Checking for stored user session');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        logger.debug('Found stored user session');
        const parsedUser = JSON.parse(storedUser) as UserProfile;
        setUser(parsedUser);
        logger.info('Successfully restored user session from storage');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid user data';
        logger.error('Failed to parse stored user data', { 
          error: errorMessage,
          storedData: storedUser 
        });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      logger.debug('No stored user session found');
    }
  }, []);

  const login = async (username: string, password: string): Promise<UserProfile> => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    try {
      logger.debug('Attempting login to:', { url: AUTH_ENDPOINTS.LOGIN });
      
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error('Login failed with status', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          errorBody: errorBody || 'Empty response body'
        });
        throw new Error(errorBody || 'Login failed');
      }

      const responseText = await response.text();
      logger.debug('Response content', { responseText });
      
      try {
        const data = responseText ? JSON.parse(responseText) : {};
        
        if (!response.ok) {
          const errorMsg = data.message || `HTTP error! status: ${response.status}`;
          logger.error('Login request failed', { 
            status: response.status,
            error: errorMsg,
            response: data,
            requestUrl: AUTH_ENDPOINTS.LOGIN
          });
          throw new Error(errorMsg);
        }

        const { token, user: userData } = data;
        
        if (!token || !userData) {
          const errorMsg = 'Invalid response from server';
          logger.error(errorMsg, { response: data });
          throw new Error(errorMsg);
        }

        logger.info('Login successful', { userId: userData.id });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setError(null);
        return userData;
      } catch (parseError) {
        logger.error('Failed to parse response', {
          status: response.status,
          responseText,
          error: parseError,
          requestUrl: AUTH_ENDPOINTS.LOGIN
        });
        throw new Error(`Server returned invalid response (status ${response.status})`);
      }
    } catch (error) {
      logger.error('Login process failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        apiBase: API_BASE_URL,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const logout = async () => {
    logger.info('Logging out user', { userId: user?.userId });
    await fetch(AUTH_ENDPOINTS.LOGOUT, { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const openAuthModal = (type: 'login' | 'signup') => {
    logger.debug('Opening auth modal', { modalType: type });
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    logger.debug('Closing auth modal');
    setIsAuthModalOpen(false);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    isAuthModalOpen,
    authModalType,
    openAuthModal,
    closeAuthModal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    logger.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};