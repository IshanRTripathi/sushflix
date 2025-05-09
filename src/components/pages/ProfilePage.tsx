import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { useQuery } from '@tanstack/react-query';
import { UserProfile, USER_ROLES, PartialProfileUpdate } from '../../types/user';
import Loading from '../ui/Loading';
import ProfileSection from '../content/ProfileSection';

interface ProfilePageProps {
  isFollowing: boolean;
  onFollow: () => Promise<void>;
}

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

export default function ProfilePage({ isFollowing, onFollow }: ProfilePageProps) {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    logger.info(`ProfilePage mounted for user: ${username}`);
  }, [username]);

  if (!currentUser) {
    logger.warn('Unauthenticated user trying to access profile page');
    return null;
  }

  const { setLoadingState } = useLoadingState();

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
    enabled: !!username,
    retry: 3
  });

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
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

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      try {
        const data = await profileService.getUserProfile(username || '');
        return data;
      } catch (error) {
        logger.error('Error fetching user profile', { error });
        throw error;
      }
    },
    enabled: !!username,
    retry: 3,
    retryDelay: 1000
  });

  const isLoading = postsLoading || statsLoading || isProfileLoading;
  const hasError = postsError || statsError || profileError;

  const isOwnProfile = username === currentUser?.username;

  const handleProfileUpdate = async (updates: PartialProfileUpdate) => {
    try {
      setLoadingState({ isLoading: true });
      const updatedProfile = await profileService.updateProfile(username || '', updates);
      setLoadingState({ isLoading: false });
      return updatedProfile;
    } catch (error) {
      logger.error('Error updating profile', { error });
      setLoadingState({ isLoading: false });
      throw error;
    }
  };

  const handleFollow = async () => {
    try {
      setLoadingState({ isLoading: true });
      await profileService.toggleFollow(username || '');
      // Invalidate and refetch follow status
      await profileService.getUserStats(username || '');
      setLoadingState({ isLoading: false });
    } catch (error) {
      logger.error('Error following user', { error });
      setLoadingState({ isLoading: false });
      throw error;
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

  if (!userProfile || !statsData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <ProfileSection
            user={userProfile || {
              id: '',
              userId: '',
              username: '',
              createdAt: new Date(),
              subscribers: 0,
              posts: 0,
              role: USER_ROLES.USER,
              displayName: '',
              email: '',
              profilePicture: '',
              bio: '',
              socialLinks: {},
              lastUpdated: new Date(),
              isCreator: false
            }}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onProfileUpdate={handleProfileUpdate}
            posts={statsData.posts}
            followers={statsData.followers}
            following={statsData.following}
          />
        </div>
      </div>
    </div>
  );
}
