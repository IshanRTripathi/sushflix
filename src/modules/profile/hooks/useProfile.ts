import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useLoading } from '../../shared/hooks/useLoading';
import { logger } from '../../shared/utils/logger';
import { profileService } from '../service/profileService';
import { UserProfile, UserStats, SocialLinks } from '../../profile/service/models/UserProfile';

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isCurrentUser: boolean;
  isFollowing: boolean;
  isCreator: boolean;
  stats: UserStats;
  socialLinks: SocialLinks;
  refreshProfile: () => Promise<void>;
  followUser: () => Promise<void>;
  unfollowUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  uploadProfilePicture: (file: File) => Promise<string>;
  isUpdating: boolean;
  isUploading: boolean;
}

export const useProfile = (username: string): UseProfileReturn => {
  const { user: currentUser, updateUser } = useAuth();

  const {
    isLoading,
    startLoading,
    stopLoading,
    error,
    setError: setLoadingError,
  } = useLoading();

  const {
    isLoading: isUpdating,
    startLoading: startUpdating,
    stopLoading: stopUpdating,
  } = useLoading();

  const {
    isLoading: isUploading,
    startLoading: startUploading,
    stopLoading: stopUploading,
  } = useLoading();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      startLoading();
      const response = await profileService.getUserProfile(username);
      if (!response?.data?.user) throw new Error('User not found');
      setProfile(response.data.user);
    } catch (err) {
      logger.error('Failed to fetch profile', { err });
      setLoadingError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      stopLoading();
    }
  }, [username, startLoading, stopLoading, setLoadingError]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const followUser = useCallback(async () => {
    if (!currentUser) return;
    try {
      await profileService.followUser(currentUser.username, username);
      await refreshProfile();
    } catch (err) {
      logger.error('Failed to follow user', { err });
    }
  }, [currentUser, username, refreshProfile]);

  const unfollowUser = useCallback(async () => {
    if (!currentUser) return;
    try {
      await profileService.unfollowUser(currentUser.username, username);
      await refreshProfile();
    } catch (err) {
      logger.error('Failed to unfollow user', { err });
    }
  }, [currentUser, username, refreshProfile]);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<UserProfile> => {
      try {
        startUpdating();
        if (!profile) throw new Error('No profile loaded');
        const result = await profileService.updateUserProfile(profile.id, updates);
        if (!result.success) throw new Error(result.error || 'Update failed');
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        return updatedProfile;
      } finally {
        stopUpdating();
      }
    },
    [profile, stopUpdating, startUpdating]
  );

  const uploadProfilePicture = useCallback(
    async (file: File): Promise<string> => {
      try {
        startUploading();
        const response = await profileService.uploadProfilePicture(username, file);
        const url = response.data?.profilePicture;
        if (url) {
          setProfile((prev) => prev ? { ...prev, profilePicture: url } : prev);
          return url;
        }
        throw new Error(response.error || 'Failed to upload image');
      } finally {
        stopUploading();
      }
    },
    [username, startUploading, stopUploading]
  );

  return {
    profile,
    isLoading,
    error,
    isCurrentUser: profile?.username === currentUser?.username,
    isFollowing: profile?.isFollowing ?? false,
    isCreator: profile?.isCreator ?? false,
    stats: profile?.stats || { posts: 0, followers: 0, following: 0 },
    socialLinks: profile?.socialLinks || {},
    refreshProfile,
    followUser,
    unfollowUser,
    updateUserProfile,
    uploadProfilePicture,
    isUpdating,
    isUploading,
  };
};
