import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { EditProfileProps, ProfileFormData } from './types';
import { ProfileFormState } from './form/ProfileFormState';
import { ProfileFormUI } from './form/ProfileFormUI';

/**
 * Main profile editing component that coordinates form state and API integration
 */
const EditProfile: React.FC<EditProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const formState = new ProfileFormState(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.validate()) return;

    try {
      const profileService = ProfileService.getInstance();
      const formData = formState.getFormData();
      
      await profileService.updateProfile(user.username, {
        displayName: formData.displayName,
        bio: formData.bio,
        socialLinks: {
          website: formData.website,
          twitter: formData.twitter,
          youtube: formData.youtube
        },
        isCreator: formData.isCreator
      });

      logger.info('Profile updated successfully', { userId: user.username });
      showToast('Profile updated successfully', 'success');
      
      navigate(-1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      logger.error('Profile update failed', { error });
      showToast(errorMessage, 'error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formState.updateField(name as keyof ProfileFormData & string, value);
  };

  const handleCreatorToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    formState.updateField('isCreator', event.target.value === 'creator');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Edit Profile
      </Typography>
      <ProfileFormUI
        formData={formState.getFormData()}
        errors={formState.getErrors()}
        loading={formState.isLoading()}
        onInputChange={handleInputChange}
        onCreatorToggle={handleCreatorToggle}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default EditProfile;
