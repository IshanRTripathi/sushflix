import { useState, useEffect } from 'react';
import axios from 'axios';
import { logger } from '../utils/logger';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
}

interface AuthResponse {
  token: string;
  user: any;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setState(prev => ({ ...prev, isAuthenticated: true, loading: false }));
    } else {
      setState(prev => ({ ...prev, isAuthenticated: false, loading: false }));
    }
  }, []);

  const login = async (credentials: {
    identifier: string;
    password: string;
    authMethod: 'password' | 'otp'
  }) => {
    try {
      const response = await axios.post<AuthResponse>('/api/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setState({
        isAuthenticated: true,
        user,
        loading: false
      });

      return user;
    } catch (error: any) {
      logger.error('[useAuth] Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData: {
    username: string;
    email: string;
    password: string;
    isCreator: boolean;
    displayName: string;
    profilePic: string;
  }) => {
    try {
      const response = await axios.post('/api/signup', userData);
      const { token, user } = {
        token: response.data.response.newUser.token || '',
        user: response.data.response.newUser
      };

      localStorage.setItem('token', token);
      setState({
        isAuthenticated: true,
        user,
        loading: false
      });

      return user;
    } catch (error: any) {
      logger.error('[useAuth] Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    login,
    signup,
    logout
  };
};
