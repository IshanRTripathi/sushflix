import React from 'react';
import { Skeleton } from '@mui/material';

interface ContentCardMediaProps {
  thumbnail: string;
  caption: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const ContentCardMedia: React.FC<ContentCardMediaProps> = ({
  thumbnail,
  caption,
  onClick,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <>
          <Skeleton variant="rectangular" height={200} className="mb-2" />
          <Skeleton variant="text" width="80%" />
        </>
      ) : (
        <>
          <div className="relative aspect-video">
            <img
              src={thumbnail}
              alt="Content thumbnail"
              className="w-full h-full object-cover"
              onClick={onClick}
            />
          </div>
          <p className="text-gray-700">{caption}</p>
        </>
      )}
    </div>
  );
};
