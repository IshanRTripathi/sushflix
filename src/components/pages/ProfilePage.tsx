import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { useQuery } from '@tanstack/react-query';
import { UserProfile } from '../../types/user';
import Loading from '../ui/Loading';
import ProfileSection from '../content/ProfileSection';
import PostCard from '../content/PostCard';

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

  // Fetch user's posts
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      setLoadingState({ isLoading: true });
      try {
        const response = await profileService.getUserPosts(username || '');
        setLoadingState({ isLoading: false });
        return response;
      } catch (error) {
        setLoadingState({ isLoading: false });
        throw error;
      }
    },
    enabled: !!username,
    retry: 3
  });

  // Fetch user profile stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ['userStats', username],
    queryFn: async () => {
      setLoadingState({ isLoading: true });
      try {
        const response = await profileService.getUserStats(username || '');
        setLoadingState({ isLoading: false });
        return response;
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
        const response = await profileService.getUserProfile(username || '');
        setLoadingState({ isLoading: false });
        return response;
      } catch (error) {
        setLoadingState({ isLoading: false });
        throw error;
      }
    },
    enabled: !!username,
    retry: 3
  });

  // Handle loading state
  const isLoading = postsLoading || statsLoading || isProfileLoading;
  const hasError = postsError || statsError || profileError;

  // Determine if viewing own profile
  const isOwnProfile = username === currentUser?.username;

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      await profileService.toggleFollow(username || '');
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (isLoading) {
    return <Loading showSpinner={true} />;
  }

  if (hasError) {
    logger.error('Profile page error:', { error: postsError || statsError || profileError });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Profile</h2>
          <p className="text-gray-400">Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Early return if data is not loaded
  if (!userProfile || !stats) {
    return null;
  }

  return currentUser ? (
    <div className="max-w-7xl mx-auto px-4">
      {/* Profile Section */}
      <ProfileSection
        user={userProfile}
        isFollowing={!isOwnProfile}
        onFollow={handleFollow}
        posts={stats?.posts || 0}
        followers={stats?.followers || 0}
        following={stats?.following || 0}
        onProfilePictureUpdate={(newImageUrl) => {
          // Refresh the profile data after successful upload
          if (username) {
            profileService.getUserProfile(username).then((updatedProfile) => {
              // Update the profile data
              if (updatedProfile) {
                // Force a re-render with the updated profile
                window.location.reload();
              }
            });
          }
        }}
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
    </div>
  ): null;
}
