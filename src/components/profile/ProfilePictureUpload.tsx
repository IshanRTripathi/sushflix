import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  IconButton,
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
  imageUrl?: string;
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
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setIsDialogOpen(true);
    } else {
      logger.warn('No file selected');
    }
    setError('');
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
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

      if (response.success && response.imageUrl) {
        // Notify parent component about successful upload
        if (onUploadSuccess) {
          await onUploadSuccess({ imageUrl: response.imageUrl });
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

  return (
    <div className="relative group">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="profile-picture-upload"
      />
      <label htmlFor="profile-picture-upload" className="cursor-pointer">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
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
        </div>
      </label>
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <CloudUploadIcon className="text-white w-8 h-8" />
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
