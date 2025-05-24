import React from 'react';
import { useToast } from '@/modules/shared/hooks/useToast';
import { ProfileFormData } from './types';
import { UserProfile } from '@/modules/profile/components/profile/types';
import { EditProfileModal } from './EditProfileModal';
import { useProfile } from '../../hooks/useProfile';

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
    isUpdating: isLoading,
    error: updateError
  } = useProfile(user.username);

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
      
      await updateProfile(updateData);
      showToast('Profile updated successfully', 'success');
      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        setIsModalOpen(false);
        onClose?.();
        onProfileUpdate?.();
      }, 1000);
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
      onSave={handleSave}
      onProfilePictureUpdate={async () => {
        // TODO: Implement profile picture upload
        return true;
      }}
      loading={isLoading}
      error={updateError?.message || ''}
      user={user}
    />
  );
};

export default React.memo(EditProfile);
