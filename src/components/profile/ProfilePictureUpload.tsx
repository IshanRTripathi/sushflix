import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { logger } from '@/utils/logger';

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;  // Preferred property name
  url?: string;      // Alternative property name for backward compatibility
  error?: string;
}

export interface ProfilePictureUploadProps {
  isVisible?: boolean;
  isUploading?: boolean;
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<UploadResponse>;
  onUploadSuccess?: (data: { imageUrl: string }) => Promise<boolean>;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  isVisible = true,
  isUploading = false,
  currentImageUrl = '',
  onUpload,
  onUploadSuccess,
}) => {
  const theme = useTheme();
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
        setPreviewUrl('');
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

  if (!isVisible) return null;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    logger.debug('Profile picture area clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="profile-picture-upload"
      />
      <div 
        onClick={handleClick}
        className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
      >
        {previewUrl || currentImageUrl ? (
          <img
            src={previewUrl || currentImageUrl}
            alt="Profile preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/128';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <CloudUploadIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <CloudUploadIcon className="text-white w-8 h-8" />
        </div>
      </div>
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
              setPreviewUrl('');
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
    </div>
  );
};

// Export the component as default and named export for flexibility
// Export the component as default and named export for flexibility
export default ProfilePictureUpload;
export { ProfilePictureUpload };
