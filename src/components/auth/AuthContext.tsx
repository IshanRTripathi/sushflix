import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (username: string, password: string) => Promise<void>;
  signupAndLogin: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user and token from localStorage on component mount
  useEffect(() => {
    console.log("AuthProvider useEffect triggered");

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    console.log("Stored Token:", storedToken);
    console.log("Stored User:", storedUser);

    if (storedToken && storedToken !== 'undefined') {
      setToken(storedToken);
    } else {
      console.log("No valid token found in localStorage");
    }

    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed User:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    } else {
      console.log("No valid user found in localStorage");
    }

    // Log final state for debugging
    console.log("AuthProvider useEffect, user: ", user, ", token: ", token);
  }, []);

  // login function
  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid credentials');

    console.log("Login response data:", data);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    console.log("AuthProvider state after login, user: ", data.user, ", token: ", data.token);
  };

  // signupAndLogin function
  const signupAndLogin = async (username: string, password: string, email: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });
    try {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');

      console.log("Signup response data:", data);

      // Automatically log in the user
      await login(username, password);
    } catch (error) {
      console.error("Signup failed: ", error);
      throw error;
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
        signupAndLogin,
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