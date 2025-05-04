import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { UserProfile } from '../../types/user';
import { logger } from '../../utils/logger';

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
        logger.error('Error parsing stored user', { error: errorMessage });
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<UserProfile> => {
    logger.debug('Attempting login with credentials');
    try {
      const response = await fetch(`${API_BASE_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      const { token, user: userData } = data;
      logger.info('Login successful');

      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      logger.error('Login failed:', { error: errorMessage });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    logger.info('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const openAuthModal = (type: 'login' | 'signup') => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};