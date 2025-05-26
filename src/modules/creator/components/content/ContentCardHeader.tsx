import React from 'react';
import { Avatar, Skeleton } from '@mui/material';

interface ContentCardHeaderProps {
  creatorName: string;
  profilePicture: string;
  timestamp: string;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
}

export const ContentCardHeader: React.FC<ContentCardHeaderProps> = ({
  creatorName,
  profilePicture,
  timestamp,
  isSubscribed,
  onSubscribe,
}) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Skeleton variant="circular" width={40} height={40} className="mb-2" />
      <div>
        <Skeleton variant="text" width={100} className="mb-2" />
        <Skeleton variant="text" width={80} />
      </div>
    </div>
  );
};
