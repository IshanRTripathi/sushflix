import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import profileService from '../../services/profileService';
import { logger } from '../../utils/logger';
import { ProfileFormData } from './types';
import { UserProfile } from '../../types/user';

interface EditProfileProps {
  user: UserProfile;
  onProfileUpdate?: () => void;
  onClose?: () => void;
}
import { EditProfileModal } from './EditProfileModal';

/**
 * Main profile editing component that coordinates form state and API integration
 */
const EditProfile: React.FC<EditProfileProps> = ({ user, onProfileUpdate, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleSave = async (formData: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updateData = {
        displayName: formData.displayName || undefined, // Convert empty string to undefined
        bio: formData.bio || undefined, // Convert empty string to undefined
        socialLinks: {
          website: formData.website || undefined,
          twitter: formData.twitter || undefined,
          youtube: formData.youtube || undefined
        },
        isCreator: formData.isCreator
      };
      
      await profileService.updateProfile(user.username, updateData);

      logger.info('Profile updated successfully', { userId: user.username });
      showToast('Profile updated successfully', 'success');
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        setIsModalOpen(false);
        if (onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      logger.error('Profile update failed', { error });
      showToast(errorMessage, 'error');
      throw error; // Re-throw to be handled by the modal
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the profile picture update process
   * @param imageUrl - The URL of the newly uploaded profile picture
   * @returns Promise that resolves to true if the update was successful, false otherwise
   */
  const handleProfilePictureUpdate = async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl) {
      logger.warn('Empty image URL provided for profile picture update', {
        userId: user.username
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      logger.info('Starting profile picture update', { 
        userId: user.username,
        imageUrl: imageUrl.substring(0, 50) + '...' // Log partial URL to avoid logging sensitive data
      });
      
      // Update the user's profile with the new picture URL
      const updatedProfile = await profileService.updateProfile(user.username, {
        profilePicture: imageUrl
      });
      
      if (!updatedProfile?.profilePicture) {
        throw new Error('Profile update response did not contain a profile picture URL');
      }
      
      logger.info('Profile picture update completed successfully', { 
        userId: user.username,
        returnedImageUrl: updatedProfile.profilePicture.substring(0, 50) + '...',
        urlMatches: updatedProfile.profilePicture === imageUrl ? 'yes' : 'no'
      });
      
      // Verify the URL is accessible
      try {
        const response = await fetch(updatedProfile.profilePicture, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Failed to verify image accessibility: ${response.status} ${response.statusText}`);
        }
        logger.debug('Profile picture URL verified and accessible');
      } catch (verifyError) {
        logger.warn('Profile picture URL verification failed', {
          error: verifyError instanceof Error ? verifyError.message : String(verifyError),
          imageUrl: updatedProfile.profilePicture.substring(0, 100) + '...'
        });
        // Don't fail the update if verification fails, just log it
      }
      
      showToast('Profile picture updated successfully', 'success');
      
      // Refresh the profile data in the parent component
      if (onProfileUpdate) {
        try {
          await onProfileUpdate();
          logger.debug('Successfully refreshed parent profile data');
        } catch (refreshError) {
          logger.error('Failed to refresh parent profile data', {
            error: refreshError instanceof Error ? refreshError.message : String(refreshError)
          });
          // Continue even if refresh fails
        }
      }
      
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile picture';
      const errorDetails = error instanceof Error ? error.stack : undefined;
      
      logger.error('Failed to update profile picture', { 
        error: errorMessage,
        userId: user.username,
        stack: errorDetails,
        timestamp: new Date().toISOString()
      });
      
      showToast('Failed to update profile picture. Please try again.', 'error');
      return false;
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <EditProfileModal
      isOpen={isModalOpen}
      onClose={handleClose}
      user={user}
      onSave={handleSave}
      onProfilePictureUpdate={handleProfilePictureUpdate}
      loading={isLoading}
    />
  );
};

export default EditProfile;
