// Content detail page component with enhanced error handling and loading states
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, BookmarkPlus } from 'lucide-react';
import { apiClient } from '@/modules/shared/api/apiClient';
import { logger } from '@/modules/shared/utils/logger';
import { Skeleton } from '@mui/material';
/**
 * Content data interface with proper typing
 * @interface ContentData
 * @property {string} id - Unique identifier for the content
 * @property {string} title - Title of the content
 * @property {string} description - Description of the content
 * @property {string} creatorName - Name of the content creator
 * @property {string} profilePicture - URL of the creator's profilePicture
 * @property {string} mediaUrl - URL of the media content
 * @property {number} likes - Number of likes
 * @property {boolean} isExclusive - Whether the content is exclusive
 * @property {string} thumbnailUrl - URL of the thumbnail image
 */
export interface ContentData {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  profilePicture: string;
  mediaUrl: string;
  likes: number;
  isExclusive: boolean;
  thumbnailUrl: string;
  duration?: string;
  createdAt: string;
  tags?: string[];
}

/**
 * Component props interface
 * @interface ContentDetailProps
 * @property {string} className - Optional class name for styling
 */
interface ContentDetailProps {
  className?: string;
}

/**
 * ContentDetail component that displays detailed view of a content item
 * @param {ContentDetailProps} props - Component props
 * @returns {ReactNode}
 */
export const ContentDetail: React.FC<ContentDetailProps> = ({ className = '' }) => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch content with proper error handling and logging
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('Fetching content details', { contentId: id });
      
      const response = await apiClient.get(`/api/content/${id}`);
      setContent(response.data);
      logger.info('Content details fetched successfully', { contentId: id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      logger.error('Failed to fetch content details', { 
        error: errorMessage,
        contentId: id
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Handle like with proper error handling
  const handleLike = useCallback(async () => {
    if (!content) return;

    try {
      const response = await apiClient.post(`/api/content/${content.id}/like`, {});
      setContent(response.data);
      setIsLiked(prev => !prev);
      logger.info('Like status updated', { 
        contentId: content.id,
        liked: !isLiked
      });
    } catch (err) {
      logger.error('Failed to toggle like', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        contentId: content?.id
      });
    }
  }, [content, isLiked]);

  // Handle bookmark with proper error handling
  const handleBookmark = useCallback(async () => {
    if (!content) return;

    try {
      const response = await apiClient.post(`/api/content/${content.id}/bookmark`, {});
      setIsBookmarked(response.data.isBookmarked);
      logger.info('Bookmark status updated', { 
        contentId: content.id,
        bookmarked: response.data.isBookmarked
      });
    } catch (err) {
      logger.error('Failed to toggle bookmark', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        contentId: content?.id
      });
    }
  }, [content, isBookmarked]);

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id, fetchContent]);

  // Loading state with proper ARIA attributes
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center min-h-screen ${className}`}
        role="status"
        aria-label="Loading content details"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Error state with proper ARIA attributes
  if (error || !content) {
    return (
      <div 
        className={`flex flex-col items-center justify-center min-h-screen ${className}`}
        role="alert"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Unavailable</h2>
        <p className="text-gray-600">{error || 'Content not found'}</p>
        {error && (
          <button
            onClick={fetchContent}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
            aria-label="Retry loading content"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      <div className="bg-black rounded-xl overflow-hidden mb-8">
        {content.mediaUrl ? (
          <video
            className="w-full aspect-video"
            controls
            poster={content.thumbnailUrl}
            preload="metadata"
            onCanPlay={() => logger.info('Media can play', { contentId: content.id })}
            onError={(e) => {
              const videoElement = e.target as HTMLVideoElement;
              logger.error('Media playback error', { 
                error: videoElement.error?.code,
                contentId: content.id
              });
            }}
          >
            <source src={content.mediaUrl} type="video/mp4" />
            <track
              kind="captions"
              srcLang="en"
              label="English"
              default
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full aspect-video object-cover"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '';
              return (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={400}
                  sx={{ borderRadius: 1 }}
                />
              );
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={content.profilePicture}
                alt={content.creatorName}
                className="w-12 h-12 rounded-full"
                loading="lazy"
              />
              <div>
                <h3 className="font-medium text-gray-900">{content.creatorName}</h3>
                <p className="text-sm text-gray-500">Creator</p>
                <p className="text-xs text-gray-400">
                  {new Date(content.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                }`}
                aria-label={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className="w-6 h-6" />
                <span>{content.likes}</span>
              </button>
              <button
                onClick={() => navigator.share({
                  title: content.title,
                  text: content.description,
                  url: window.location.href
                }).catch(() => {}) }
                className="flex items-center space-x-2 text-gray-700 hover:text-indigo-500"
                aria-label="Share content"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-2 ${
                  isBookmarked ? 'text-indigo-500' : 'text-gray-700 hover:text-indigo-500'
                }`}
                aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              >
                <BookmarkPlus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{content.description}</p>
            {content.tags && content.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Related Content</h3>
            {/* Related content will be implemented separately */}
          </div>
        </div>
      </div>
    </div>
  );
};