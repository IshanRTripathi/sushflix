import { useCallback, useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import profileService from '../service/profileService';
import { logger } from '../../../utils/logger';
import { UserProfile } from '../../../types/user';

export interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  youtube?: string;
  isCreator?: boolean;
  profilePicture?: string;
}

export const useProfileUpdate = (user: UserProfile, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const updateProfile = useCallback(async (updates: ProfileUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
        displayName: updates.displayName || undefined,
        bio: updates.bio || undefined,
        socialLinks: {
          website: updates.website || undefined,
          twitter: updates.twitter || undefined,
          youtube: updates.youtube || undefined
        },
        isCreator: updates.isCreator,
        profilePicture: updates.profilePicture || undefined
      };
      
      await profileService.updateUserProfile(user.username, updateData);
      
      logger.info('Profile updated successfully', { userId: user.username });
      showToast('Profile updated successfully', 'success');
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      logger.error('Profile update failed', { error: err });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, showToast, user.username]);

  const updateProfilePicture = useCallback(async (imageUrl: string) => {
    if (!imageUrl) {
      const errorMsg = 'No image URL provided';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return false;
    }

    setIsLoading(true);
    try {
      logger.info('Updating profile picture', { 
        userId: user.username,
        imageUrl: imageUrl.substring(0, 50) + '...' 
      });
      
      const success = await updateProfile({ profilePicture: imageUrl });
      
      if (success) {
        logger.info('Profile picture updated successfully', {
          userId: user.username,
          imageUrl: imageUrl.substring(0, 50) + '...'
        });
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile picture';
      setError(errorMessage);
      showToast('Failed to update profile picture', 'error');
      logger.error('Profile picture update failed', { 
        error: err,
        userId: user.username 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateProfile, showToast, user.username]);

  return {
    updateProfile,
    updateProfilePicture,
    isLoading,
    error
  } as const;
};
