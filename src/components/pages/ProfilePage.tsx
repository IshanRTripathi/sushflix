import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import ErrorBoundary from '../ui/ErrorBoundary';
import Loading from '../ui/Loading';
import { useQuery } from '@tanstack/react-query';
import { UserProfile } from '../../types/user';

interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
}
import ProfileSection from '../content/ProfileSection';
import PostCard from '../content/PostCard';

const profileService = ProfileService.getInstance();

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    logger.info(`ProfilePage mounted for user: ${username}`);
  }, [username]);

  // Early return if user is not authenticated
  if (!currentUser) {
    logger.warn('Unauthenticated user trying to access profile page');
    return null;
  }

  const { setLoadingState } = useLoadingState();
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: Error | string) => {
    logger.error('Profile page error:', { error: err });
    setError(err instanceof Error ? err.message : err);
  };

  // Determine if viewing own profile
  const isOwnProfile = username === currentUser?.username;

  // Fetch user's posts
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      setLoadingState({ isLoading: true });
      try {
        const data = await profileService.getUserPosts(username || '');
        setLoadingState({ isLoading: false });
        return data;
      } catch (error) {
        setLoadingState({ isLoading: false });
        throw error;
      }
    },
    enabled: !!username
  });

  // Fetch user profile stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ['userStats', username],
    queryFn: async () => {
      setLoadingState({ isLoading: true });
      try {
        const data = await profileService.getUserStats(username || '');
        setLoadingState({ isLoading: false });
        return data;
      } catch (error) {
        setLoadingState({ isLoading: false });
        throw error;
      }
    },
    enabled: !!username
  });

  // Fetch user profile
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      setLoadingState({ isLoading: true });
      try {
        const data = await profileService.getUserProfile(username || '');
        setLoadingState({ isLoading: false });
        return data;
      } catch (error) {
        setLoadingState({ isLoading: false });
        throw error;
      }
    },
    enabled: !!username
  });

  // Handle errors
  useEffect(() => {
    if (postsError || statsError) {
      setError('Failed to load profile data. Please try again later.');
    } else {
      setError(null);
    }
  }, [postsError, statsError]);

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const isFollowing = await profileService.toggleFollow(username || '');
        // Update local state
        // setIsFollowing(isFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    if (username && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [username, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      await profileService.toggleFollow(username || '');
    } catch (error) {
      setError('Failed to update follow status. Please try again.');
      console.error('Error following user:', error);
    }
  };

  if (postsLoading || statsLoading) {
    return (
      <Loading showSpinner={true} />
    );
  }

  return currentUser ? (
    <div className="max-w-7xl mx-auto px-4">
      {/* Profile Section */}
      <ProfileSection
        user={currentUser}
        isFollowing={!isOwnProfile}
        onFollow={handleFollow}
        posts={stats?.posts || 0}
        followers={stats?.followers || 0}
        following={stats?.following || 0}
      />

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            user={currentUser}
            post={post}
            isFollowing={!isOwnProfile}
            onFollow={handleFollow}
            onLike={() => console.log('Like')}
            onComment={() => console.log('Comment')}
            onShare={() => console.log('Share')}
            onBookmark={() => console.log('Bookmark')}
          />
        ))}
      </div>

      <ErrorBoundary>
        {error && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-black p-6 rounded-lg text-white">
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  ) : null;
}


