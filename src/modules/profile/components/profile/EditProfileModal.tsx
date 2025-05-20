import React from 'react';
import { Modal } from '../../../../components/common/Modal';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { ProfileFormUI } from './form/ProfileFormUI';
import { ProfileFormData, ProfileErrors } from './types';
import { UserProfile } from '../../../../types/user';
import { Box, CircularProgress } from '@mui/material';
import { logger } from '../../../../utils/logger';
import profileService from '../../service/profileService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updates: ProfileFormData) => Promise<void>;
  onProfilePictureUpdate: (imageUrl: string) => Promise<boolean>;
  loading: boolean;
  error?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onProfilePictureUpdate,
  loading,
  error
}) => {
  const [formData, setFormData] = React.useState<ProfileFormData>({
    displayName: user.displayName ?? '',
    bio: user.bio ?? '',
    website: user.socialLinks?.website ?? '',
    twitter: user.socialLinks?.twitter ?? '',
    youtube: user.socialLinks?.youtube ?? '',
    isCreator: user.isCreator ?? false
  });

  const [errors, setErrors] = React.useState<Omit<ProfileErrors, 'isCreator'>>({
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    youtube: ''
  });
  
  const [isPictureUploading, setIsPictureUploading] = React.useState(false);
  const [pictureError, setPictureError] = React.useState<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Type guard to ensure name is a valid key
    if (!(name in formData)) return;
    
    // Enforce max length for bio
    if (name === 'bio' && value.length > 200) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      logger.error('Failed to save profile', { error: err });
    }
  };

  // Removed handleProfilePictureUpdate as it's no longer needed

  const handleModalClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose}
      title="Edit Profile"
      size="lg"
      maxWidth={600}
      closeOnOutsideClick={!loading}
      className="w-full max-w-3xl mx-auto my-4 max-h-[90vh] overflow-y-auto"
      paperClassName="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl"
      sx = {{position: 'absolute'}}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        p: 0,
        top: 10,
        maxWidth: '100%',
        margin: 0,
        width: '100%',
        bgcolor: 'transparent',
        position: 'relative',
        color: 'text.primary'
      }}>
        {(error || pictureError) && (
          <Box
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4 text-sm"
            sx={{
              '&:not(:empty)': {
                display: 'block',
                width: '100%',
                textAlign: 'center',
              }
            }}
          >
            {error || pictureError}
          </Box>
        )}
        <Box className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md mb-4">
          <Box sx={{ position: 'relative',textAlign: 'center', }}>
            <ProfilePictureUpload
              currentImageUrl={user.profilePicture}
              onUpload={async (file) => {
                try {
                  // Create a temporary URL for preview (not used in this implementation)
                  URL.createObjectURL(file);
                  
                  // Upload the file using the profile service
                  const response = await profileService.uploadProfilePicture(user.username, file);
                  
                  if (!response.success || !response.data?.profilePicture) {
                    throw new Error(response.error || 'Failed to upload profile picture');
                  }
                  
                  // Update the profile with the new picture URL
                  const success = await onProfilePictureUpdate(response.data.profilePicture);
                  
                  if (success) {
                    // Update the form data with the new picture URL
                    setFormData(prev => ({
                      ...prev,
                      profilePicture: response.data!.profilePicture
                    }));
                    
                    logger.info('Profile picture updated successfully', { 
                      username: user.username,
                      imageUrl: response.data.profilePicture.substring(0, 50) + '...' 
                    });
                  }
                  
                  return { 
                    success, 
                    imageUrl: response.data.profilePicture,
                    url: response.data.profilePicture // For backward compatibility
                  };
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
                  setPictureError(errorMessage);
                  logger.error('Profile picture update failed', { 
                    error: errorMessage,
                    username: user.username,
                    stack: error instanceof Error ? error.stack : undefined
                  });
                  return { 
                    success: false, 
                    error: errorMessage 
                  };
                } finally {
                  setIsPictureUploading(false);
                }
              }}
              onUploadSuccess={async ({ imageUrl }) => {
                setFormData(prev => ({
                  ...prev,
                  profilePicture: imageUrl
                }));
                return true;
              }}
            />
            {isPictureUploading && (
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '50%'
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}
          </Box>
        </Box>


        <Box className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <ProfileFormUI
            formData={formData}
            errors={errors}
            loading={loading}
            onInputChange={handleInputChange}
            onCreatorToggle={(e) => {
              setFormData(prev => ({
                ...prev,
                isCreator: e.target.value === 'creator'
              }));
            }}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Modal>
  );
};
