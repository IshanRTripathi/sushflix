import React from 'react';
import { useToast } from '@/hooks/useToast';
import { ProfileFormData } from './types';
import { UserProfile } from '../../types/user';
import { EditProfileModal } from './EditProfileModal';
import { useProfileUpdate } from '../../hooks/useProfileUpdate';

interface EditProfileProps {
  user: UserProfile;
  onProfileUpdate?: () => void;
  onClose?: () => void;
}

/**
 * Main profile editing component that coordinates form state and API integration
 */
const EditProfile: React.FC<EditProfileProps> = ({ user, onProfileUpdate, onClose }) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const { 
    updateProfile, 
    updateProfilePicture, 
    isLoading, 
    error: updateError 
  } = useProfileUpdate(user, onProfileUpdate);

  const handleSave = async (formData: ProfileFormData) => {
    try {
      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        youtube: formData.youtube,
        isCreator: formData.isCreator
      };
      
      const success = await updateProfile(updateData);
      
      if (success) {
        showToast('Profile updated successfully', 'success');
        // Close the modal after a short delay to show the success message
        setTimeout(() => {
          setIsModalOpen(false);
          onClose?.();
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      showToast(errorMessage, 'error');
      // Error is already handled by the hook, just re-throw to be handled by the modal
      throw error;
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      onClose?.();
    }
  };

  return (
    <EditProfileModal
      isOpen={isModalOpen}
      onClose={handleClose}
      user={user}
      onSave={handleSave}
      onProfilePictureUpdate={updateProfilePicture}
      loading={isLoading}
      error={updateError || undefined}
    />
  );
};

export default React.memo(EditProfile);
