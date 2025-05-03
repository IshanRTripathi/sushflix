import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { User } from '../types/user';
import { loginUser } from '../services/authService';
import { logger } from '../utils/logger';

interface LoginResponseData {
  token: string;
  user: User;
}

interface LoginErrorData {
  message?: string;
  errors?: Array<{ param: string; msg: string }>;
}

// Import UserProfile type
import { UserProfile } from '../../types/user';

// Define the User interface
interface User extends UserProfile {
  id: string;
  isCreator: boolean;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data);
      }
      setLoading(false);
    } catch (error) {
      logger.error('Error checking auth status:', error);
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    logger.info('Auth provider initialized');
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      logger.info(`User authenticated: ${user.username}`);
    } else {
      logger.info('User logged out');
    }
  }, [user]);

  // Initial state setup function
  const initializeAuthState = () => {
    console.log("========== AuthProvider initialization started ==========");

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log("Stored Token:", storedToken, " Type:", typeof storedToken);
    console.log("Stored User:", storedUser, " Type:", typeof storedUser);

    if (storedToken && storedToken !== 'undefined') {
      try {
        setToken(storedToken);
      } catch (error) {
        console.error("Error setting stored token", error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    } else {
      console.log("No valid token found in localStorage or token is 'undefined'");
      localStorage.removeItem('token'); // Clear invalid token
    }

    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed User:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage. Stored User:", storedUser, " Error:", error);
        localStorage.removeItem('user'); // Clear invalid user data
      }
    } else {
      console.log("No valid user found in localStorage or user is 'undefined'");
      localStorage.removeItem('user'); // Clear invalid user data
    }

    // Log final state for debugging
    console.log("========== AuthProvider initialization final state ==========");
    console.log("User:", user);
    console.log("Token:", token);
  };

  // Use useEffect to run only once after mount
  useEffect(() => {
    initializeAuthState();
  }, []); // Empty dependency array to run only once

  // login function using apiService
  const login = async (usernameOrEmail: string, password: string): Promise<User> => {
    try {
      logger.debug('Attempting login with credentials');
      const response = await loginUser({ usernameOrEmail: usernameOrEmail, password });
      const data = response.data as LoginResponseData;
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      logger.info(`User ${data.user.username} logged in successfully`);
      return data.user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Login failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    logger.info('Logging out user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logger.info('User logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}