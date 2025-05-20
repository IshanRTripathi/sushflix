import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface SkeletonLoaderProps {
  height?: number;
  width?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
}

const SkeletonBox = styled(Box)({
  backgroundColor: 'rgba(158, 158, 158, 0.2)',
  animation: 'pulse 1.5s infinite ease-in-out',
});

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = 20,
  width = '100%',
  variant = 'text',
  className,
}) => {
  return (
    <SkeletonBox
      sx={{
        width: width,
        height: height,
        borderRadius: variant === 'circular' ? '50%' : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      {variant === 'text' && (
        <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.5 }}>
          Loading...
        </Typography>
      )}
    </SkeletonBox>
  );
};

export default SkeletonLoader;
