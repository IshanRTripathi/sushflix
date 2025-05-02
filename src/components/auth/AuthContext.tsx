import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../../services/apiService'; // Import loginUser
import type { AxiosError } from 'axios'; // Import AxiosError

// Define the User interface
interface User {
  id: string;
  username: string;
  name: string;
  isCreator: boolean;
  email: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<User>; // Return user on success
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define expected structure of successful login response data
interface LoginResponseData {
  token: string;
  user: User;
}

// Define expected structure of error response data
interface LoginErrorData {
  message?: string;
  errors?: Array<{ param: string; msg: string }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

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
      const response = await loginUser({ username: usernameOrEmail, password }); // Call apiService
      const data = response.data as LoginResponseData;

      if (!data.token || !data.user) {
        throw new Error('Login response missing token or user data');
      }

      console.log("Login successful, User:", data.user, "Token:", data.token);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data.user; // Return user object on success
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = 'An error occurred during login';

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data as LoginErrorData;
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = axiosError.message || 'Login failed';
        }
      } else {
        errorMessage = axiosError.message || 'Network error or unable to reach server';
      }
      console.error("Login failed:", errorMessage);
      throw new Error(errorMessage); // Throw error to be caught by the component
    }
  };

  // Logout function
  const logout = () => {
    console.log("User logging out");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token
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