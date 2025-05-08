import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types/user';
import { logger } from '../../utils/logger';

// Extend UserProfile type to include ID
interface ExtendedUserProfile extends UserProfile {
  id: string;
}

/**
 * Post interface for content posts
 * @interface Post
 */
interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

/**
 * Props interface for PostCard component
 * @interface PostCardProps
 */
interface PostCardProps {
  user: ExtendedUserProfile;
  post: Post;
  isFollowing: boolean;
  onFollow: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
  className?: string;
}

/**
 * PostCard component for displaying user posts
 * @param {PostCardProps} props - Component props
 * @returns {ReactNode}
 */
const PostCard: React.FC<PostCardProps> = ({
  user,
  post,
  isFollowing,
  onFollow,
  onLike,
  onComment,
  onShare,
  onBookmark,
  className = ''
}) => {
  // Validate props
  if (!user || !post) {
    logger.error('Invalid props provided to PostCard', { user, post });
    return null;
  }

  // Handle button clicks with proper logging
  const handleFollow = useCallback(() => {
    logger.info('Follow button clicked', { postId: post.id });
    onFollow();
  }, [post.id, onFollow]);

  const handleLike = useCallback(() => {
    logger.info('Like button clicked', { postId: post.id, isLiked: post.isLiked });
    onLike();
  }, [post.id, post.isLiked, onLike]);

  const handleComment = useCallback(() => {
    logger.info('Comment button clicked', { postId: post.id });
    onComment();
  }, [post.id, onComment]);

  const handleShare = useCallback(() => {
    logger.info('Share button clicked', { postId: post.id });
    onShare();
  }, [post.id, onShare]);

  const handleBookmark = useCallback(() => {
    logger.info('Bookmark button clicked', { postId: post.id, isBookmarked: post.isBookmarked });
    onBookmark();
  }, [post.id, post.isBookmarked, onBookmark]);
  return (
    <div 
      className={`bg-black rounded-lg p-4 mb-4 ${className}`}
      role="article"
      aria-label={`Post by ${user.displayName}`}
    >
      {/* Profile Section */}
      <div className="flex items-center mb-4">
        <img
          src={user.profilePicture || '/default-avatar.png'}
          alt={user.displayName}
          className="w-10 h-10 rounded-full mr-3"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = '/default-avatar.png';
            logger.warn('Profile picture failed to load', { userId: user.id });
          }}
        />
        <div>
          <h3 className="text-white font-semibold">
            <Link 
              to={`/profile/${user.id}`} 
              className="hover:underline"
              aria-label={`View ${user.displayName}'s profile`}
            >
              {user.displayName}
            </Link>
          </h3>
          <p className="text-gray-400 text-sm">Last seen online</p>
        </div>
        <button
          className={`ml-auto px-4 py-2 rounded-full ${
            isFollowing ? 'bg-gray-600' : 'bg-red-600'
          } text-white text-sm`}
          onClick={handleFollow}
          aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Post Content */}
      <div className="mt-4">
        <p className="text-white mb-4" aria-label="Post caption">
          {post.caption}
        </p>
        <div className="relative">
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full aspect-video rounded-lg"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/images/default-content.png';
              logger.warn('Post media failed to load', { postId: post.id });
            }}
            loading="lazy"
          />
          {post.isLiked && (
            <div className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center mt-4 space-x-4">
        <button
          onClick={handleLike}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
          aria-label="Like post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likes}</span>
        </button>
        <button
          onClick={handleComment}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
          aria-label="Comment on post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comments}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
          aria-label="Share post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button
          onClick={handleBookmark}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
          aria-label="Bookmark post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {post.isBookmarked && (
            <span className="text-yellow-400">✓</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostCard;
