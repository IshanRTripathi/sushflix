// Protected route component for authentication and role-based access control
import React from 'react';
import { Navigate, useLocation, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../../../utils/logger';

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

// Type for user roles
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Props interface for ProtectedRoute component
 * @param children - The protected content to render
 * @param requiredRole - Optional role required to access the route
 * @param fallbackRoute - Optional custom fallback route (defaults to '/login')
 * @param publicPath - Optional path pattern that should be publicly accessible
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackRoute?: string;
  publicPath?: string;
}

/**
 * Protected route component that handles authentication and role-based access control
 * @param props - ProtectedRouteProps
 * @returns ReactNode
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole,
  fallbackRoute = '/login',
  publicPath
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const match = useMatch(publicPath || '');
  const isPublicPath = publicPath ? !!match : false;

  // Allow access to public paths without authentication
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Check authentication status for protected routes
  if (!isAuthenticated) {
    logger.debug('Unauthenticated access attempt', { 
      path: location.pathname,
      redirectTo: fallbackRoute,
      requiredRole
    });
    
    return <Navigate to={fallbackRoute} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    logger.debug('Unauthorized access attempt', { 
      path: location.pathname,
      userRole: user?.role,
      requiredRole
    });
    
    return <Navigate to={fallbackRoute} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};