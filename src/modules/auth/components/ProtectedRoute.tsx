// Protected route component for authentication and role-based access control
import React from 'react';
import { Navigate, useLocation, useMatch } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../../shared/utils/logger';
import { UserRole } from '@/modules/shared/types/user';

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
  fallbackRoute = '/',
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