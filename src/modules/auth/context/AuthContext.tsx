/**
 * @module AuthContext
 * Authentication context provider for managing user authentication state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../../shared/config/index';
import { IUserProfile } from '../../profile/service/models/UserProfile';
import { logger } from '@/modules/shared/utils/logger';

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
  user: IUserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<IUserProfile>;
  logout: () => void;
  updateUser: (updates: Partial<IUserProfile>) => void;
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
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [error, setError] = useState<AuthErrorType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<AuthModalType>('login');

  useEffect(() => {
    logger.debug('Checking for stored user session');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        logger.debug('Found stored user session');
        const parsedUser = JSON.parse(storedUser) as IUserProfile;
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

  const login = async (username: string, password: string): Promise<IUserProfile> => {
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
    const userId = user?.user?.toString() || 'unknown';
    logger.info('Logging out user', { userId });
    
    try {
      await fetch(AUTH_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      logger.error('Error during logout', { error });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  const updateUser = (updates: Partial<IUserProfile>) => {
    if (!user) return;
    
    // Create a new object with the updates
    const updatedUser = { ...user.toObject ? user.toObject() : user, ...updates } as IUserProfile;
    logger.debug('Updating user data', { updates });
    
    try {
      const { _id, ...safeUser } = updatedUser as any;
      localStorage.setItem('user', JSON.stringify(safeUser));
      
      // Update state with a new object to trigger re-render
      setUser(updatedUser);
      
      logger.info('User data updated', { 
        userId: updatedUser.user?.toString() || 'unknown', 
        updatedFields: Object.keys(updates) 
      });
    } catch (error) {
      logger.error('Error updating user data', { error });
    }
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