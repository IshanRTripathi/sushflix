import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  keyframes,
  styled as muiStyled,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { logger } from '@/modules/shared/utils/logger';

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;  // Preferred property name
  url?: string;      // Alternative property name for backward compatibility
  error?: string;
}

export interface ProfilePictureUploadProps {
  /**
   * Whether the upload controls should be visible
   * @default true
   */
  isVisible?: boolean;
  
  /**
   * Whether the upload is in progress
   * @default false
   */
  isUploading?: boolean;
  
  /**
   * The current profile picture URL
   */
  currentImageUrl?: string;
  
  /**
   * Callback function when a file is selected for upload
   * @param file - The file to be uploaded
   * @returns Promise with upload result
   */
  onUpload: (file: File) => Promise<UploadResponse>;
  
  /**
   * Callback function when upload is successful
   * @param data - Object containing the uploaded image URL
   * @returns Promise that resolves when the success handler completes
   */
  onUploadSuccess?: (data: { imageUrl: string }) => Promise<boolean>;
  
  /**
   * Whether to show the edit overlay on hover
   * @default true
   */
  showEditOnHover?: boolean;
  
  /**
   * Additional CSS class name for the root element
   */
  className?: string;
}

/**
 * A component for uploading and displaying a user's profile picture.
 * Handles file selection, validation, and upload process with proper loading states.
 */
const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  isVisible = true,
  isUploading = false,
  currentImageUrl = '',
  onUpload,
  onUploadSuccess,
  showEditOnHover = true,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInternalUploading, setIsInternalUploading] = useState(false);
  const isUploadingState = Boolean(isUploading) || isInternalUploading;

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPEG, PNG, or WebP)';
    }

    // Check specific image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Image size should not exceed 5MB';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    logger.debug('File input changed', { files: event.target.files });
    const file = event.target.files?.[0];
    if (file) {
      logger.debug('File selected', { name: file.name, type: file.type, size: file.size });
      const validationError = validateFile(file);
      if (validationError) {
        logger.warn('File validation failed', { error: validationError });
        setError(validationError);
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      logger.debug('Created object URL for preview', { objectUrl });
      setPreviewUrl(objectUrl);
      setError('');
      setIsDialogOpen(true);
    } else {
      logger.warn('No file selected');
    }
    setError('');
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleUpload = useCallback(async () => {
    logger.debug('Starting file upload', { hasFile: !!selectedFile });
    if (!selectedFile) {
      const errorMsg = 'No file selected for upload';
      logger.warn(errorMsg);
      setError(errorMsg);
      return;
    }

    setError('');
    setIsInternalUploading(true);

    try {
      logger.info('Starting profile picture upload', {
        filename: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });

      // Upload the file using the onUpload callback
      const response = await onUpload(selectedFile);

      // Use either imageUrl or url from the response, with imageUrl taking precedence
      const imageUrl = response.imageUrl || response.url;

      if (response.success && imageUrl) {
        // Notify parent component about successful upload
        if (onUploadSuccess) {
          await onUploadSuccess({ imageUrl });
        }
        
        // Close the dialog
        setIsDialogOpen(false);
        setPreviewUrl(imageUrl);
        setSelectedFile(null);
      } else {
        throw new Error(response.error || 'Failed to upload image');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Profile picture upload failed', { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsInternalUploading(false);
    }
  }, [selectedFile, onUpload, onUploadSuccess]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    logger.debug('Profile picture area clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  if (!isVisible) return null;

  return (
    <Box 
      className={`profile-picture-upload ${className}`}
      sx={{ 
        position: 'relative', 
        display: 'inline-block',
        '&:hover .edit-overlay': {
          opacity: showEditOnHover ? 1 : 0,
        },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="profile-picture-upload"
        aria-label="Upload profile picture"
      />
      <Box 
        onClick={handleClick}
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'border-color 0.3s ease',
          '&:hover .edit-overlay': {
            opacity: showEditOnHover && !isUploading ? 1 : 0,
          }
        }}
        aria-label={isUploading ? 'Uploading profile picture' : 'Change profile picture'}
      >
        {!(previewUrl || currentImageUrl) ? (
          <Box 
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadIcon sx={{ width: 48, height: 48, color: 'grey.400' }} />
          </Box>
        ) : (
          <Box
            component="img"
            src={previewUrl || currentImageUrl}
            alt="Profile preview"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {showEditOnHover && (
          <Box 
            className="edit-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <CloudUploadIcon sx={{ width: 32, height: 32 }} />
          </Box>
        )}
      </Box>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          {previewUrl && (
            <div className="flex justify-center my-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-64 object-contain rounded"
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDialogOpen(false);
              setPreviewUrl(previewUrl);
              setSelectedFile(null);
            }} 
            disabled={isUploadingState}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            color="primary"
            variant="contained"
            disabled={isUploadingState}
            startIcon={isUploadingState ? <CircularProgress size={20} /> : null}
          >
            {isUploadingState ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Export the component as default and named export for flexibility
export default ProfilePictureUpload;
export { ProfilePictureUpload };
