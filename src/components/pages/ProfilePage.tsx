import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { useQuery } from '@tanstack/react-query';
import { UserProfile, PartialProfileUpdate } from '../../types/user';
import Loading from '../ui/Loading';
import ProfileSection from '../content/ProfileSection';

// Removed ProfilePageProps as we're not using any props



interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
}

// This interface is used in the query but not directly in the component
interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

const profileService = ProfileService.getInstance();

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    logger.info(`ProfilePage mounted for user: ${username}`);
  }, [username]);

  if (!currentUser) {
    logger.warn('Unauthenticated user trying to access profile page');
    return null;
  }
  
  // Default values for following state
  const [isFollowing, setIsFollowing] = useState(false);
  // Remove unused state
  // const [isFollowLoading, setIsFollowLoading] = useState(false);

  const { setLoadingState } = useLoadingState();

  // Using _ prefix to indicate intentionally unused variables
  // We'll fetch posts when we implement the posts section
  const { isLoading: postsLoading, error: postsError } = useQuery<Post[]>({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      if (!username) return [];
      setLoadingState({ isLoading: true });
      try {
        const data = await profileService.getUserPosts(username);
        return data;
      } finally {
        setLoadingState({ isLoading: false });
      }
    },
    enabled: !!username,
    retry: 3
  });

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery<UserStats>({
    queryKey: ['userStats', username],
    queryFn: async () => {
      if (!username) return { posts: 0, followers: 0, following: 0 };
      setLoadingState({ isLoading: true });
      try {
        return await profileService.getUserStats(username);
      } finally {
        setLoadingState({ isLoading: false });
      }
    },
    enabled: !!username
  });

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      try {
        return await profileService.getUserProfile(username);
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
  const hasError = Boolean(postsError || statsError || profileError);

  const isOwner = username === currentUser?.username;

  const handleProfileUpdate = async (updatedUser: UserProfile) => {
    if (!username) return;
    try {
      setLoadingState({ isLoading: true });
      // Convert UserProfile to PartialProfileUpdate
      const updateData: PartialProfileUpdate = {
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        socialLinks: updatedUser.socialLinks,
        isCreator: updatedUser.isCreator
      };
      
      // Update the profile
      const updatedProfile = await profileService.updateProfile(username, updateData);
      
      // Return the full updated profile with any server-side updates
      return {
        ...updatedUser,
        ...updatedProfile,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error updating profile', { error });
      throw error;
    } finally {
      setLoadingState({ isLoading: false });
    }
  };

  const handleFollow = async () => {
    if (!username) return;
    
    try {
      // Loading state is handled by LoadingButton in ProfileSection
      await profileService.toggleFollow(username);
      // Toggle the follow state
      setIsFollowing((prev: boolean) => !prev);
      // Invalidate and refetch stats
      await profileService.getUserStats(username);
    } catch (error) {
      logger.error('Error following user', { error });
      // Revert follow state on error
      setIsFollowing((prev: boolean) => !prev);
      throw error;
    } finally {
      // Loading state is handled by LoadingButton in ProfileSection
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading showSpinner={true} />
      </div>
    );
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
            user={userProfile}
            isFollowing={isFollowing}
            isOwner={isOwner}
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
