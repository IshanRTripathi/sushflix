import React from 'react';
import { Skeleton } from '@mui/material';

export const ContentCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width="100%" height={200} className="mt-2" />
      <Skeleton variant="text" width="80%" className="mt-2" />
      <div className="flex justify-between mt-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  );
};
