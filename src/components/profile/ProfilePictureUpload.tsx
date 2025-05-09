import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { ProfileService } from '../../services/profileService';
import { UserProfile, PartialProfileUpdate } from '../../types/user';
import { logger } from '../../utils/logger';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface ProfilePictureUploadProps {
  username: string;
  onUploadSuccess: (imageUrl: string) => void;
  onProfileUpdate?: (updates: PartialProfileUpdate) => Promise<void>;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ username, onUploadSuccess, onProfileUpdate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const profileService = ProfileService.getInstance();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const handleExternalFileSelect = (event: Event) => {
      logger.info('Received external file selection event');
      const customEvent = event as CustomEvent<{ file: File }>;
      const file = customEvent.detail?.file;
      if (file) {
        logger.info('External file selected', { name: file.name });
        handleFile(file);
      }
    };

    window.addEventListener('externalFileSelect', handleExternalFileSelect as EventListener);
    return () => {
      window.removeEventListener('externalFileSelect', handleExternalFileSelect as EventListener);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    logger.info('File picker triggered');
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    } else {
      logger.warn('No file selected');
    }
  };

  const handleFile = (file: File) => {
    logger.info('File selected', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        throw new Error('No file selected');
      }

      // Validate file size and type
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        throw new Error('Only JPEG, PNG, and WebP files are allowed');
      }

      const formData = new FormData();
      formData.append('image', selectedFile);

      logger.debug('Uploading profile picture', {
        username,
        filename: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      setUploading(true);
      const response = await profileService.uploadProfilePicture(username, selectedFile);
      
      if (!response?.imageUrl) {
        throw new Error('Failed to get image URL from response');
      }

      logger.info('Profile picture uploaded successfully', { 
        url: response.imageUrl,
        username,
        timestamp: new Date().toISOString()
      });

      // Update profile with new picture URL
      if (onUploadSuccess) {
        await onUploadSuccess(response.imageUrl);
      }

    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logger.error('Error uploading profile picture', {
        error: {
          message: errorObj.message,
          name: errorObj.name,
          stack: errorObj.stack
        },
        username,
        timestamp: new Date().toISOString()
      });

      setError(errorObj.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setProgress(0);
      setSelectedFile(null);
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full rounded-full object-cover absolute inset-0"
        />
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="profilePictureInput"
        onChange={handleFileSelect}
      />
      <label
        htmlFor="profilePictureInput"
        className="absolute bottom-0 right-0 p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors duration-200"
      >
        <CloudUploadIcon className="text-white w-6 h-6" />
      </label>
      {error && (
        <Alert severity="error" className="mt-2">
          {error}
        </Alert>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfilePictureUpload;
