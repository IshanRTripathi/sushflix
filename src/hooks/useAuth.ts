import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import type { UserProfile } from '../types/user';

/**
 * Represents the authentication state
 */
interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
}

/**
 * Represents the authentication response from the API
 */
interface AuthResponse {
  token: string;
  user: UserProfile;
}

/**
 * Represents login credentials
 */
interface LoginCredentials {
  identifier: string;
  password: string;
  authMethod: 'password' | 'otp';
}

/**
 * Represents signup data
 */
interface SignupData {
  username: string;
  email: string;
  password: string;
  isCreator: boolean;
  displayName: string;
  profilePic: string;
}

/**
 * Custom hook for handling authentication state and operations
 * @returns Authentication state and methods
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setState(prev => ({ ...prev, isAuthenticated: true, loading: false }));
    } else {
      setState(prev => ({ ...prev, isAuthenticated: false, loading: false }));
    }
  }, []);

  /**
   * Handles user login
   * @param credentials - User login credentials
   * @returns The authenticated user profile
   * @throws {Error} If login fails
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<UserProfile> => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setState({
        isAuthenticated: true,
        user,
        loading: false
      });

      return user;
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || 'Login failed';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      logger.error('[useAuth] Login failed:', { error });
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Handles user signup
   * @param userData - User registration data
   * @returns The newly created user profile
   * @throws {Error} If signup fails
   */
  const signup = useCallback(async (userData: SignupData): Promise<UserProfile> => {
    try {
      const response = await axios.post<{ response: { newUser: UserProfile & { token: string } } }>(
        '/api/auth/signup', 
        userData
      );
      
      const { token, ...user } = response.data.response.newUser;

      localStorage.setItem('token', token);
      setState({
        isAuthenticated: true,
        user,
        loading: false
      });

      return user;
    } catch (error: unknown) {
      let errorMessage = 'Signup failed';
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || 'Signup failed';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      logger.error('[useAuth] Signup failed:', { error });
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Handles user logout
   */
  const logout = useCallback((): void => {
    localStorage.removeItem('token');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }, []);

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    login,
    signup,
    logout
  };
};
