// Content card component with enhanced user interaction and error handling
import React, { useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { logger } from '../../utils/logger';
import { Skeleton } from '@mui/material';

import { useNavigate } from 'react-router-dom';

// Comment interface with proper typing
export interface Comment {
  username: string;
  text: string;
  timestamp: string;
  userId: string;
}

// ContentCardProps interface with proper typing
export interface ContentCardProps {
  /** Unique identifier for the content */
  id: string;
  /** Thumbnail image URL */
  thumbnail: string;
  /** Creator's profile picture URL */
  creatorProfilePic: string;
  /** Creator's display name */
  creatorName: string;
  /** Timestamp of content creation */
  timestamp: string;
  /** Content caption/description */
  caption: string;
  /** Whether the user is subscribed */
  isSubscribed: boolean;
  /** Callback to handle subscription */
  onSubscribe: () => void;
  /** Callback when content is clicked */
  onClick: () => void;
  /** Initial number of likes */
  initialLikes: number;
  /** Callback when a comment is added */
  onComment: () => void;
  /** Initial like state */
  initialLiked: boolean;
  /** Array of comments */
  comments: Comment[];
  /** Optional class name for styling */
  className?: string;
}

/**
 * Content card component with enhanced user interaction and error handling
 * @param props - ContentCardProps
 * @returns ReactNode
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  thumbnail,
  creatorProfilePic,
  creatorName,
  timestamp,
  caption,
  isSubscribed,
  onSubscribe,
  onClick,
  initialLikes,
  onComment,
  initialLiked,
  comments: initialComments,
  className = ''
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState({
    like: false,
    comment: false,
    follow: false
  });

  // Handle like with proper error handling and loading state
  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, like: true }));
      
      if (isLiked) {
        await fetch(`/api/content/${id}/unlike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setLikes(prevLikes => prevLikes - 1);
      } else {
        await fetch(`/api/content/${id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setLikes(prevLikes => prevLikes + 1);
      }
      
      setIsLiked(!isLiked);
      logger.info('Like status updated', { 
        contentId: id,
        userId: user?.userId,
        action: isLiked ? 'unlike' : 'like'
      });
    } catch (error) {
      logger.error('Failed to update like status', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
      // Rollback state on error
      setIsLiked(prev => !prev);
    } finally {
      setIsLoading(prev => ({ ...prev, like: false }));
    }
  }, [isAuthenticated, navigate, id, isLiked, user?.userId]);

  // Handle comment with proper error handling and loading state
  const handleAddComment = useCallback(async () => {
    if (!isAuthenticated) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    try {
      setIsLoading(prev => ({ ...prev, comment: true }));
      
      const response = await fetch(`/api/content/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedComment,
          userId: user?.userId,
          username: user?.username
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const commentData: Comment = await response.json();
      setComments(prev => [...prev, commentData]);
      setNewComment('');
      onComment();
      
      logger.info('Comment added successfully', { 
        contentId: id,
        commentId: commentData.userId,
        userId: user?.userId
      });
    } catch (error) {
      logger.error('Failed to add comment', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
    } finally {
      setIsLoading(prev => ({ ...prev, comment: false }));
    }
  }, [isAuthenticated, navigate, id, newComment, onComment, user]);

  // Handle follow with proper error handling and loading state
  const handleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, follow: true }));
      
      if (isFollowing) {
        await fetch(`/api/users/unfollow/${creatorName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        await fetch(`/api/users/follow/${creatorName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      setIsFollowing(prev => !prev);
      logger.info('Follow status updated', { 
        creatorName,
        userId: user?.userId,
        action: isFollowing ? 'unfollow' : 'follow'
      });
    } catch (error) {
      logger.error('Failed to update follow status', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        creatorName
      });
      // Rollback state on error
      setIsFollowing(prev => !prev);
    } finally {
      setIsLoading(prev => ({ ...prev, follow: false }));
    }
  }, [isAuthenticated, navigate, creatorName, isFollowing, user?.userId]);

  return (
    <div className={`border border-gray-300 rounded-lg shadow-md p-4 bg-white mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={creatorProfilePic}
            alt={`${creatorName}'s profile`}
            className="w-10 h-10 rounded-full mr-3"
            loading="lazy"
          />
          <div>
            <div className="font-bold">{creatorName}</div>
            <div className="text-sm text-gray-500">
              {new Date(timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleFollow}
            disabled={isLoading.follow}
            className={`text-sm font-semibold px-4 py-1 rounded-full transition-colors duration-200 ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            aria-label={isFollowing ? 'Unfollow' : 'Follow'}
          >
            {isLoading.follow ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">↻</span>
                {isFollowing ? 'Unfollowing...' : 'Following...'}
              </span>
            ) : (
              isFollowing ? 'Following' : 'Follow'
            )}
          </button>
        </div>
      </div>

      <div className="mb-4 text-gray-800 line-clamp-3">{caption}</div>

      <img
        src={thumbnail}
        alt="Post content"
        className="w-full rounded-lg cursor-pointer"
        onClick={onClick}
        loading="lazy"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = '';
          return (
            <Skeleton
              variant="rectangular"
              width={300}
              height={200}
              sx={{ borderRadius: 1 }}
            />
          );
        }}
      />

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLoading.like}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likes}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        {comments.map((comment, index) => (
          <div key={comment.userId} className="mb-2">
            <div className="flex items-start">
              <span className="font-bold mr-2">{comment.username}</span>
              <span className="text-gray-700 line-clamp-3">{comment.text}</span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(comment.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}

        {isAuthenticated && (
          <div className="mt-4 flex items-center">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border rounded-lg p-2 mr-2"
              disabled={isLoading.comment}
              aria-label="Add comment"
            />
            <button
              onClick={handleAddComment}
              disabled={isLoading.comment || !newComment.trim()}
              className={`bg-indigo-600 text-white rounded-lg px-4 py-2 transition-colors duration-200 ${
                isLoading.comment || !newComment.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-indigo-700'
              }`}
              aria-label="Post comment"
            >
              {isLoading.comment ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">↻</span>
                  Posting...
                </span>
              ) : (
                'Post'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};