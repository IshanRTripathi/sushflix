// Content card component with enhanced user interaction and error handling
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { logger } from '../../../utils/logger';
import { Skeleton } from '@mui/material';
import { ContentCardProps } from './types';
import { ContentCardHeader } from './ContentCardHeader';
import { ContentCardMedia } from './ContentCardMedia';
import { ContentCardActions } from './ContentCardActions';import { ContentCardComments } from './ContentCardComments';

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
  comments,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = useCallback(async () => {
    if (!user) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLiked) {
        await fetch(`/api/content/${id}/unlike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setIsLiked(false);
        setLikes((prev: number) => prev - 1);
      } else {
        await fetch(`/api/content/${id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setIsLiked(true);
        setLikes((prev: number) => prev + 1);
      }

      logger.info('Content like/unlike successful', { 
        contentId: id,
        userId: user.userId,
        liked: !isLiked
      });
    } catch (error) {
      logger.error('Failed to like/unlike content', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
      setIsLoading(false);
    }
  }, [id, isLiked, user, navigate]);

  const handleComment = useCallback(async (text: string) => {
    if (!user) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/content/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId: user.userId, username: user.username })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to post comment: ${error}`);
      }

      const commentData: Comment = await response.json();
      logger.info('Comment posted successfully', { 
        contentId: id,
        commentData: commentData,
        userId: user.userId
      });
      onComment(text);
    } catch (error) {
      logger.error('Failed to post comment', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate, onComment]);

  const handleShare = useCallback(async () => {
    if (!user) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      await fetch(`/api/content/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      logger.info('Content shared successfully', { 
        contentId: id,
        userId: user.userId
      });
    } catch (error) {
      logger.error('Failed to share content', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  const handleBookmark = useCallback(async () => {
    if (!user) {
      logger.warn('User not authenticated - redirecting to login');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      await fetch(`/api/content/${id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      logger.info('Content bookmarked successfully', { 
        contentId: id,
        userId: user.userId
      });
    } catch (error) {
      logger.error('Failed to bookmark content', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentId: id
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  if (isLoading) {
    return (
      <div className={`flex flex-col gap-4 p-4 rounded-lg bg-white shadow-md ${className}`} role="article" aria-label="Content card">
        <Skeleton variant="circular" width={40} height={40} className="mb-2" />
        <Skeleton variant="rectangular" height={200} className="mb-2" />
        <Skeleton variant="text" width={100} className="mb-2" />
        <Skeleton variant="text" width="80%" className="mb-2" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 rounded-lg bg-white shadow-md ${className}`} role="article" aria-label="Content card">
      <ContentCardHeader
        creatorProfilePic={creatorProfilePic}
        creatorName={creatorName}
        timestamp={timestamp}
        isSubscribed={isSubscribed}
        onSubscribe={onSubscribe}
      />
      <ContentCardMedia
        thumbnail={thumbnail}
        caption={caption}
        onClick={onClick}
        isLoading={isLoading}
      />
      <ContentCardActions
        initialLikes={likes}
        initialLiked={isLiked}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
        isLoading={isLoading}
      />
      <ContentCardComments
        comments={comments}
        onComment={handleComment}
      />
    </div>
  );
};