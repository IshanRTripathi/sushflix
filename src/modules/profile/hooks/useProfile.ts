import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfile, UserStats, SocialLinks } from '../../profile/service/models/UserProfile';
import { profileService } from '../service/profileService';
import { useAuth } from '../../auth/context/AuthContext';
import { useLoading } from '../../shared/hooks/useLoading';
import { logger } from '../../shared/utils/logger';

/**
 * @typedef {Object} UseProfileReturn
 * @property {UserProfile | null} profile - The user profile data
 * @property {boolean} isLoading - Whether the profile is currently loading
 * @property {Error | null} error - Any error that occurred
 * @property {boolean} isCurrentUser - Whether the profile belongs to the current user
 * @property {boolean} isFollowing - Whether the current user is following this profile
 * @property {boolean} isCreator - Whether the profile has creator status
 * @property {UserStats} stats - User statistics (posts, followers, etc.)
 * @property {SocialLinks} socialLinks - User's social media links
 * @property {() => Promise<void>} refreshProfile - Function to refresh profile data
 * @property {() => Promise<void>} followUser - Function to follow the user
 * @property {() => Promise<void>} unfollowUser - Function to unfollow the user
 * @property {(updates: Partial<UserProfile>) => Promise<void>} updateUserProfile - Update profile information
 * @property {(file: File) => Promise<string>} uploadProfilePicture - Upload a new profile picture
 */
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

/**
 * Custom hook to manage user profile data and operations
 * @param {string} [username] - Optional username to fetch. If not provided, will use the username from the URL
 * @returns {UseProfileReturn} Profile data and related methods
 */
export const useProfile = (username?: string): UseProfileReturn => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const targetUsername = username || urlUsername || '';

  // Loading states
  const { 
    isLoading, 
    startLoading, 
    stopLoading, 
    error, 
    setError: setLoadingError 
  } = useLoading({ trackTime: true });
  
  const { 
    isLoading: isUpdating, 
    startLoading: startUpdating, 
    stopLoading: stopUpdating 
  } = useLoading({ trackTime: true });
  
  const { 
    isLoading: isUploading, 
    startLoading: startUploading, 
    stopLoading: stopUploading 
  } = useLoading({ trackTime: true });

  // Derived state
  const isCurrentUser = useMemo(
    () => !username && !urlUsername || currentUser?.username === targetUsername,
    [username, urlUsername, currentUser, targetUsername]
  );

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>({
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    subscriberCount: 0,
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  /**
   * Fetches the user profile data
   * @private
   */
  const fetchProfile = useCallback(async () => {
    if (!targetUsername) return;

    try {
      startLoading();
      
      let profileData: UserProfile;
      
      if (isCurrentUser) {
        const response = await profileService.getCurrentUser();
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load profile');
        }
        profileData = response.data;
      } else {
        const response = await profileService.getUserProfile(targetUsername);
        if (!response) {
          throw new Error('Failed to load profile');
        }
        profileData = response;
      }
      
      // Update all related state in a single batch
      setProfile(profileData);
      setStats({
        postCount: profileData.stats?.postCount || 0,
        followerCount: profileData.stats?.followerCount || 0,
        followingCount: profileData.stats?.followingCount || 0,
        subscriberCount: profileData.stats?.subscriberCount || 0,
      });
      setSocialLinks(profileData.socialLinks || {});
      setIsFollowing(profileData.isFollowing || false);
      setIsCreator(profileData.isCreator || false);
      
      return profileData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load profile');
      logger.error('Failed to fetch profile:', { error });
      setLoadingError(error);
      
      // Redirect to 404 if profile doesn't exist
      if ((err as any)?.status === 404) {
        navigate('/404', { replace: true });
      }
      throw error;
    } finally {
      stopLoading();
    }
  }, [targetUsername, isCurrentUser, navigate, startLoading, stopLoading, setLoadingError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Refreshes the profile data
   * @public
   */
  const refreshProfile = useCallback(async () => {
    try {
      await fetchProfile();
    } catch (error) {
      // Error is already handled in fetchProfile
      logger.error('Failed to refresh profile:', { error });
    }
  }, [fetchProfile]);

  /**
   * Follows the current profile's user
   * @public
   * @throws {Error} If the operation fails
   */
  const followUser = useCallback(async () => {
    if (!profile || !currentUser) {
      throw new Error('Profile or current user not available');
    }

    try {
      startLoading();
      
      await profileService.followUser(currentUser.id, profile.id);
      
      // Optimistically update the UI
      setIsFollowing(true);
      setStats(prev => ({
        ...prev,
        followerCount: prev.followerCount + 1,
      }));
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to follow user');
      logger.error('Failed to follow user:', { error });
      setLoadingError(error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [profile, currentUser, startLoading, stopLoading, setLoadingError]);

  /**
   * Unfollows the current profile's user
   * @public
   * @throws {Error} If the operation fails
   */
  const unfollowUser = useCallback(async () => {
    if (!profile || !currentUser) {
      throw new Error('Profile or current user not available');
    }

    try {
      startLoading();
      
      await profileService.unfollowUser(currentUser.id, profile.id);
      
      // Optimistically update the UI
      setIsFollowing(false);
      setStats(prev => ({
        ...prev,
        followerCount: Math.max(0, prev.followerCount - 1),
      }));
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unfollow user');
      logger.error('Failed to unfollow user:', { error });
      setLoadingError(error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [profile, currentUser, startLoading, stopLoading, setLoadingError]);

  /**
   * Updates the user's profile with the provided updates
   * @public
   * @param {Partial<UserProfile>} updates - The updates to apply to the profile
   * @returns {Promise<UserProfile>} The updated profile
   * @throws {Error} If the operation fails
   */
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!profile) {
      throw new Error('No profile loaded');
    }

    try {
      startUpdating();
      // The updateUserProfile method returns the user object directly
      const updatedProfile = await profileService.updateUserProfile(profile.username, updates);
      
      if (!updatedProfile) {
        throw new Error('Failed to update profile: No data returned');
      }
      
      // Update local state
      setProfile(updatedProfile);
      
      // Update related state if needed
      if (updates.socialLinks) {
        setSocialLinks(updates.socialLinks);
      }
      
      if (updates.isCreator !== undefined) {
        setIsCreator(updates.isCreator);
      }
      
      return updatedProfile;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      logger.error('Failed to update profile:', { error });
      setLoadingError(error);
      throw error;
    } finally {
      stopUpdating();
    }
  }, [profile, startUpdating, stopUpdating, setLoadingError]);

  /**
   * Uploads a new profile picture
   * @public
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} The URL of the uploaded image
   * @throws {Error} If the operation fails
   */
  const uploadProfilePicture = useCallback(async (file: File): Promise<string> => {
    if (!profile) throw new Error('No profile loaded');

    try {
      startUploading();
      
      const response = await profileService.uploadProfilePicture(profile.id, file);
      
      if (!response?.['success'] || !response?.['data']?.profilePicture) {
        throw new Error(response?.['error'] || 'Failed to upload profilePicture');
      }
      
      const profilePicture = response['data'].profilePicture;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, profilePicture } : null);
      
      return profilePicture;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload profilePicture');
      logger.error('Failed to upload profilePicture:', { error });
      setLoadingError(error);
      throw error;
    } finally {
      stopUploading();
    }
  }, [profile, startUploading, stopUploading, setLoadingError]);

  // Create a wrapper to convert Promise<boolean> to Promise<void>
  const followUserWrapper = useCallback(async (): Promise<void> => {
    await followUser();
  }, [followUser]);

  const unfollowUserWrapper = useCallback(async (): Promise<void> => {
    await unfollowUser();
  }, [unfollowUser]);

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
    followUser: followUserWrapper,
    unfollowUser: unfollowUserWrapper,
    updateUserProfile,
    uploadProfilePicture,
    isUpdating,
    isUploading,
  };
};

export default useProfile;
