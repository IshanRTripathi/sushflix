/**
 * @module AuthContext
 * Authentication context provider for managing user authentication state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/index';
import { UserProfile } from '../../types/user';
import { logger } from '../../utils/logger';

// Authentication endpoints
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`
} as const;

export type AuthErrorType = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type AuthModalType = 'login' | 'signup';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  error: AuthErrorType | null;
  isAuthModalOpen: boolean;
  authModalType: AuthModalType;
  openAuthModal: (type: AuthModalType) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<AuthErrorType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<AuthModalType>('login');

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
      logger.debug('Attempting login with:', { 
        url: AUTH_ENDPOINTS.LOGIN,
        usernameOrEmail: username,
        passwordLength: password.length
      });
      
      const loginData = { 
        usernameOrEmail: username.trim(),
        password: password
      };

      logger.debug('Sending login request with data:', loginData);
      
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        logger.error('Failed to parse response', {
          status: response.status,
          error: parseError,
          requestUrl: AUTH_ENDPOINTS.LOGIN
        });
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        const errorMessage = responseData?.message || `Login failed with status ${response.status}`;
        logger.error('Login failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          response: responseData,
          requestUrl: AUTH_ENDPOINTS.LOGIN,
          requestData: { ...loginData, password: '***' } // Mask password in logs
        });
        throw new Error(errorMessage);
      }

      const { token, user: userData } = responseData;
      
      if (!token || !userData) {
        const errorMsg = 'Invalid response from server: missing token or user data';
        logger.error(errorMsg, { response: responseData });
        throw new Error(errorMsg);
      }

      logger.info('Login successful', { userId: userData.id });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      return userData;
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

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    logger.debug('Updating user data', { updates });
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Force a state update by creating a new object reference
    setUser(prevUser => ({
      ...(prevUser || {}),
      ...updatedUser
    }));
    
    logger.info('User data updated', { userId: user.userId, updatedFields: Object.keys(updates) });
  };

  const openAuthModal = (type: AuthModalType) => {
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
    updateUser,
    error,
    isAuthModalOpen,
    authModalType,
    openAuthModal,
    closeAuthModal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};