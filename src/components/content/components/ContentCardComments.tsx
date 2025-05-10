import React from 'react';
import { Comment } from '../types';
import { Avatar } from '@mui/material';

interface ContentCardCommentsProps {
  comments: Comment[];
  onComment: (text: string) => Promise<void>;
  className?: string;
}

export const ContentCardComments: React.FC<ContentCardCommentsProps> = ({
  comments,
  onComment,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2">
          <Avatar src={comment.userId} alt={comment.username} className="w-8 h-8" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.username}</span>
              <span className="text-sm text-gray-500">{comment.timestamp}</span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
        </div>
      ))}
      <button
        onClick={() => onComment('')}
        className="mt-2 text-sm text-blue-500 hover:underline"
      >
        Add a comment...
      </button>
    </div>
  );
};
