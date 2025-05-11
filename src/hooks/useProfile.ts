import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfile, UserStats, SocialLinks } from '../types/user';
import { profileService } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';

type UseProfileReturn = {
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
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  uploadCoverPhoto: (file: File) => Promise<string>;
};

export const useProfile = (username?: string): UseProfileReturn => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const targetUsername = username || urlUsername || '';
  const isCurrentUser = !username && !urlUsername || currentUser?.username === targetUsername;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>({
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    subscriberCount: 0,
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  const fetchProfile = useCallback(async () => {
    if (!targetUsername) return;

    try {
      startLoading();
      setIsLoading(true);
      setError(null);

      const profileData = isCurrentUser
        ? await profileService.getCurrentUser()
        : await profileService.getUserProfile(targetUsername);

      setProfile(profileData);
      setStats(profileData.stats || {
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
        subscriberCount: 0,
      });
      setSocialLinks(profileData.socialLinks || {});
      setIsFollowing(profileData.isFollowing || false);
      setIsCreator(profileData.isCreator || false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      
      // Redirect to 404 if profile doesn't exist
      if ((err as any)?.response?.status === 404) {
        navigate('/404', { replace: true });
      }
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  }, [targetUsername, isCurrentUser, navigate, startLoading, stopLoading]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const followUser = useCallback(async () => {
    if (!profile || !currentUser) return;

    try {
      startLoading();
      await profileService.followUser(currentUser.id, profile.id);
      setIsFollowing(true);
      setStats(prev => ({
        ...prev,
        followerCount: prev.followerCount + 1,
      }));
    } catch (err) {
      console.error('Failed to follow user:', err);
      setError(err instanceof Error ? err : new Error('Failed to follow user'));
    } finally {
      stopLoading();
    }
  }, [profile, currentUser, startLoading, stopLoading]);

  const unfollowUser = useCallback(async () => {
    if (!profile || !currentUser) return;

    try {
      startLoading();
      await profileService.unfollowUser(currentUser.id, profile.id);
      setIsFollowing(false);
      setStats(prev => ({
        ...prev,
        followerCount: Math.max(0, prev.followerCount - 1),
      }));
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      setError(err instanceof Error ? err : new Error('Failed to unfollow user'));
    } finally {
      stopLoading();
    }
  }, [profile, currentUser, startLoading, stopLoading]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      startLoading();
      const updatedProfile = await profileService.updateProfile(profile.id, updates);
      setProfile(updatedProfile);
      
      // Update local state if relevant fields were updated
      if (updates.socialLinks) {
        setSocialLinks(updates.socialLinks);
      }
      
      if (updates.isCreator !== undefined) {
        setIsCreator(updates.isCreator);
      }
      
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      stopLoading();
    }
  }, [profile, startLoading, stopLoading]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!profile) throw new Error('No profile loaded');

    try {
      startLoading();
      const url = await profileService.uploadAvatar(profile.id, file);
      
      // Update local state
      setProfile(prev => prev ? { ...prev, profilePicture: url } : null);
      
      return url;
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err instanceof Error ? err : new Error('Failed to upload avatar'));
      throw err;
    } finally {
      stopLoading();
    }
  }, [profile, startLoading, stopLoading]);

  const uploadCoverPhoto = useCallback(async (file: File): Promise<string> => {
    if (!profile) throw new Error('No profile loaded');

    try {
      startLoading();
      const url = await profileService.uploadCoverPhoto(profile.id, file);
      
      // Update local state
      setProfile(prev => prev ? { ...prev, coverPhoto: url } : null);
      
      return url;
    } catch (err) {
      console.error('Failed to upload cover photo:', err);
      setError(err instanceof Error ? err : new Error('Failed to upload cover photo'));
      throw err;
    } finally {
      stopLoading();
    }
  }, [profile, startLoading, stopLoading]);

  return {
    profile,
    isLoading,
    error,
    isCurrentUser,
    isFollowing,
    isCreator,
    stats,
    socialLinks,
    refreshProfile,
    followUser,
    unfollowUser,
    updateProfile,
    uploadAvatar,
    uploadCoverPhoto,
  };
};

export default useProfile;
