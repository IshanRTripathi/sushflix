import React from 'react';
import { Modal } from '@/modules/ui/components/feedback/Modal';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { ProfileFormUI } from './ProfileFormUI';
import { ProfileFormData, ProfileErrors } from './types';
import { IUserProfile } from '@/modules/shared/types/user';
import { Box } from '@mui/material';
import { logger } from '@/modules/shared/utils/logger';

// Define the UploadResponse type locally since it's not available in shared types
interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  url?: string;
  error?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProfileFormData;
  errors: ProfileErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreatorToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => Promise<void>;
  onProfilePictureUpdate: (file: File) => Promise<string>;
  loading: boolean;
  error: string; // Changed from error?: string to error: string
  isFormValid: boolean;
  user?: IUserProfile;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  formData,
  errors,
  onInputChange,
  onCreatorToggle,
  onSave,
  onProfilePictureUpdate,
  loading,
  error = '', // Default to empty string if undefined
  isFormValid,
  user
}) => {
  const [isPictureUploading, setIsPictureUploading] = React.useState(false);
  const [pictureError, setPictureError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    try {
      await onSave();
    } catch (err) {
      logger.error('Failed to save profile', { error: err });
    }
  };

  const handleProfilePictureUpload = React.useCallback(async (file: File): Promise<UploadResponse> => {
    try {
      setIsPictureUploading(true);
      setPictureError(undefined);
      
      const imageUrl = await onProfilePictureUpdate(file);
      return { 
        success: true, 
        imageUrl,
        url: imageUrl // For backward compatibility
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      setPictureError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsPictureUploading(false);
    }
  }, [onProfilePictureUpdate]);

  const handleModalClose = () => {
    if (!loading && !isPictureUploading) {
      onClose();
    }
  };

  const errorToShow = React.useMemo(() => {
    return error || pictureError || '';
  }, [error, pictureError]);

  const isLoading = loading || isPictureUploading;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose}
      title="Edit Profile"
      size="lg"
      maxWidth={600}
      closeOnOutsideClick={!loading && !isPictureUploading}
      className="w-full max-w-3xl mx-auto my-4 max-h-[90vh] overflow-y-auto"
      paperClassName="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl"
    >
      <Box>
        {errorToShow && (
          <Box 
            mb={2} 
            p={1.5}
            borderRadius={1}
            bgcolor="error.light"
            color="error.contrastText"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              animation: 'fadeIn 0.3s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box component="span" sx={{ fontSize: '1.25rem' }}>⚠️</Box>
            <Box>{errorToShow}</Box>
          </Box>
        )}
        
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box width={{ xs: '100%', md: '30%' }}>
            <ProfilePictureUpload
              currentImageUrl={user?.profilePicture || ''}
              onUpload={handleProfilePictureUpload}
              isUploading={isPictureUploading}
              showEditOnHover
            />
          </Box>
          
          <Box flex={1}>
            <Box 
              sx={{
                opacity: isLoading ? 0.7 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
                transition: 'opacity 0.2s ease-in-out',
              }}
            >
              <ProfileFormUI
                formData={formData}
                errors={errors}
                loading={isLoading}
                onInputChange={onInputChange}
                onCreatorToggle={onCreatorToggle}
                onSubmit={handleSubmit}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
