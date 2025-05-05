import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { logger } from '../../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children 
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    logger.debug('Unauthenticated access attempt', { 
      path: location.pathname,
      redirectTo: '/login'
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};