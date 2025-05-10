import React from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Skeleton } from '@mui/material';

interface ContentCardActionsProps {
  initialLikes: number;
  initialLiked: boolean;
  onLike: () => Promise<void>;
  onComment: (text: string) => Promise<void>;
  onShare: () => Promise<void>;
  onBookmark: () => Promise<void>;
  isLoading?: boolean;
}

export const ContentCardActions: React.FC<ContentCardActionsProps> = ({
  initialLikes,
  initialLiked,
  onLike,
  onComment,
  onShare,
  onBookmark,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center gap-4">
      {isLoading ? (
        <>
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={100} />
        </>
      ) : (
        <>
          <button
            onClick={onLike}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500"
          >
            <Heart className={`w-5 h-5 ${initialLiked ? 'text-red-500' : ''}`} />
            <span>{initialLikes}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare className="w-5 h-5" />
            <span>Comment</span>
          </div>
          <input
            type="text"
            placeholder="Add a comment..."
            className="ml-4 flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                onComment(e.currentTarget.value.trim());
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            onClick={onShare}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={onBookmark}
            className="flex items-center gap-2 text-gray-600 hover:text-yellow-500"
          >
            <Bookmark className="w-5 h-5" />
            <span>Save</span>
          </button>
        </>
      )}
    </div>
  );
};
