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
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // login function
  const login = async (username: string, password: string) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail:username, password })
    });
    const data = await response.json();
      if (!response.ok) {
          if (data.errors && data.errors.length > 0) {
              const errorMessage = data.errors[0].msg || 'Invalid credentials';
              throw new Error(errorMessage);
          } else {
              throw new Error(data.message || 'Invalid credentials');
          }
      }
    console.log("Login response data:", data);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    console.log("AuthProvider state after login, user: ", data.user, ", token: ", data.token);
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