import React from 'react';
import { CircularProgress } from '@mui/material';
import { useLoadingContext } from '../contexts/LoadingContext';
import SkeletonLoader from './SkeletonLoader';

interface LoadingProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  className?: string;
  variant?: 'text' | 'rectangular';
  width?: string | number;
  height?: number;
  showSpinner?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 24, 
  color = 'primary', 
  className = '', 
  variant = 'text',
  width = '100%',
  height = 20,
  showSpinner = false
}) => {
  const { isLoading } = useLoadingContext();

  if (!isLoading) return null;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {showSpinner ? (
        <CircularProgress size={size} color={color} />
      ) : (
        <SkeletonLoader 
          variant={variant}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default Loading;
