import React, { useCallback, useMemo } from 'react';
import { useToast } from '@/modules/shared/hooks/useToast';
import { ProfileFormData, ProfileErrors } from './types';
import { IUserProfile } from '@/modules/shared/types/user';
import { EditProfileModal } from './EditProfileModal';
import { useProfile } from '../../hooks/useProfile';
import { logger } from '@/modules/shared/utils/logger';

interface EditProfileProps {
  user: IUserProfile;
  onProfileUpdate?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const validateForm = (formData: ProfileFormData): ProfileErrors => {
  const errors: ProfileErrors = {
    displayName: !formData.displayName.trim() ? 'Display name is required' : '',
    bio: formData.bio.length > 500 ? 'Bio must be less than 500 characters' : '',
    website: formData.website && !/^https?:\/\//i.test(formData.website) ? 'Please enter a valid URL' : '',
    twitter: formData.twitter && !/^https?:\/\//i.test(formData.twitter) ? 'Please enter a valid URL' : '',
    youtube: formData.youtube && !/^https?:\/\//i.test(formData.youtube) ? 'Please enter a valid URL' : ''
  };
  return errors;
};

const isFormValid = (errors: ProfileErrors): boolean => {
  return Object.values(errors).every(error => !error);
};

/**
 * Main profile editing component that coordinates form state and API integration
 */
const EditProfile: React.FC<EditProfileProps> = ({ 
  user, 
  onProfileUpdate, 
  onClose, 
  isOpen = true 
}) => {
  const { showToast } = useToast();
  const { 
    updateUserProfile, 
    isUpdating: isLoading,
    error: updateError,
    uploadProfilePicture
  } = useProfile(user.username);

  const [formData, setFormData] = React.useState<ProfileFormData>({
    displayName: user.displayName ?? '',
    bio: user.bio ?? '',
    website: user.socialLinks?.website ?? '',
    twitter: user.socialLinks?.twitter ?? '',
    youtube: user.socialLinks?.youtube ?? '',
    isCreator: user.isCreator ?? false
  });

  const [errors, setErrors] = React.useState<ProfileErrors>({
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    youtube: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pictureError, setPictureError] = React.useState<string | undefined>();

  // Validate form on data change
  React.useEffect(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
  }, [formData]);

  const isValid = useMemo(() => isFormValid(errors), [errors]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCreatorToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isCreator = e.target.value === 'creator';
    setFormData(prev => ({
      ...prev,
      isCreator
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setPictureError(undefined);

      const validationErrors = validateForm(formData);
      if (!isFormValid(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      await updateUserProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        youtube: formData.youtube,
        isCreator: formData.isCreator
      });

      showToast('Profile updated successfully', 'success');
      onProfileUpdate?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      logger.error('Profile update failed:', { error });
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, updateUserProfile, showToast, onProfileUpdate, onClose]);

  const handleProfilePictureUpdate = useCallback(async (file: File) => {
    try {
      setPictureError(undefined);
      const imageUrl = await uploadProfilePicture(file);
      showToast('Profile picture updated successfully', 'success');
      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      setPictureError(errorMessage);
      logger.error('Profile picture update failed:', { error });
      throw error;
    }
  }, [uploadProfilePicture, showToast]);

  const handleClose = useCallback(() => {
    if (!isLoading && !isSubmitting) {
      onClose?.();
    }
  }, [isLoading, isSubmitting, onClose]);

  // Ensure error is a string or undefined
  const errorMessage = updateError?.message || pictureError || '';

  return (
    <EditProfileModal
      isOpen={isOpen}
      onClose={handleClose}
      formData={formData}
      errors={errors}
      onInputChange={handleInputChange}
      onCreatorToggle={handleCreatorToggle}
      onSave={handleSave}
      onProfilePictureUpdate={handleProfilePictureUpdate}
      loading={isLoading || isSubmitting}
      error={errorMessage}
      isFormValid={isValid}
      user={user}
    />
  );
};

export default React.memo(EditProfile);
