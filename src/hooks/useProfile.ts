import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfile, UserStats, SocialLinks } from '../types/user';
import { profileService } from '../services/profileService';
import { useAuth } from '../components/auth/AuthContext';
import { useLoading } from '../contexts/LoadingContext';

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
 * @property {(updates: Partial<UserProfile>) => Promise<void>} updateProfile - Update profile information
 * @property {(file: File) => Promise<string>} uploadAvatar - Upload a new profile picture
 * @property {(file: File) => Promise<string>} uploadCoverPhoto - Upload a new cover photo
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
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  uploadAvatar: (file: File) => Promise<string>;
  uploadCoverPhoto: (file: File) => Promise<string>;
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
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const targetUsername = username || urlUsername || '';
  const isCurrentUser = useMemo(
    () => !username && !urlUsername || currentUser?.username === targetUsername,
    [username, urlUsername, currentUser, targetUsername]
  );

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
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

  /**
   * Fetches the user profile data
   * @private
   */
  const fetchProfile = useCallback(async () => {
    if (!targetUsername) return;

    try {
      startLoading();
      setIsLoading(true);
      setError(null);

      let profileData: UserProfile;
      
      if (isCurrentUser) {
        const response = await profileService.getCurrentUser();
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load profile');
        }
        profileData = response.data;
      } else {
        const response = await profileService.getProfileByUsername(targetUsername);
        if (!response) {
          throw new Error('Failed to load profile');
        }
        profileData = response;
      }
      
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load profile');
      console.error('Failed to fetch profile:', error);
      setError(error);
      
      // Redirect to 404 if profile doesn't exist
      if ((err as any)?.status === 404) {
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

  /**
   * Refreshes the profile data
   * @public
   */
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
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
      // The followUser method doesn't return an ApiResponse, so we don't check for response.success
      await profileService.followUser(currentUser.id, profile.id);
      
      setIsFollowing(true);
      setStats(prev => ({
        ...prev,
        followerCount: prev.followerCount + 1,
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to follow user');
      console.error('Failed to follow user:', error);
      setError(error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [profile, currentUser, startLoading, stopLoading]);

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
      // The unfollowUser method doesn't return an ApiResponse, so we don't check for response.success
      await profileService.unfollowUser(currentUser.id, profile.id);
      
      setIsFollowing(false);
      setStats(prev => ({
        ...prev,
        followerCount: Math.max(0, prev.followerCount - 1),
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unfollow user');
      console.error('Failed to unfollow user:', error);
      setError(error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [profile, currentUser, startLoading, stopLoading]);

  /**
   * Updates the user's profile with the provided updates
   * @public
   * @param {Partial<UserProfile>} updates - The updates to apply to the profile
   * @returns {Promise<UserProfile>} The updated profile
   * @throws {Error} If the operation fails
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!profile) {
      throw new Error('No profile loaded');
    }

    try {
      setIsUpdating(true);
      // The updateProfile method returns the updated UserProfile directly
      const updatedProfile = await profileService.updateProfile(profile.id, updates);
      
      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }
      
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
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      console.error('Failed to update profile:', error);
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [profile]);

  /**
   * Uploads a new profile picture
   * @public
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} The URL of the uploaded image
   * @throws {Error} If the operation fails
   */
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!profile) throw new Error('No profile loaded');

    try {
      setIsUploading(true);
      // The uploadProfilePicture method returns the URL directly
      const response = await profileService.uploadProfilePicture(profile.id, file);
      
      if (!response?.data?.profilePicture) {
        throw new Error('Failed to upload avatar');
      }
      
      const { profilePicture } = response.data;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, profilePicture } : null);
      
      return profilePicture;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload avatar');
      console.error('Failed to upload avatar:', error);
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [profile]);

  /**
   * Uploads a new cover photo
   * @public
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} The URL of the uploaded image
   * @throws {Error} If the operation fails
   */
  const uploadCoverPhoto = useCallback(async (file: File): Promise<string> => {
    if (!profile) throw new Error('No profile loaded');

    try {
      setIsUploading(true);
      // The uploadCoverPhoto method returns the URL in the response data
      const response = await profileService.uploadCoverPhoto(profile.id, file);
      
      if (!response?.data?.coverPhoto) {
        throw new Error('Failed to upload cover photo');
      }
      
      const { coverPhoto } = response.data;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, coverPhoto } : null);
      
      return coverPhoto;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload cover photo');
      console.error('Failed to upload cover photo:', error);
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [profile]);

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
    isUpdating,
    isUploading,
  };
};

export default useProfile;
