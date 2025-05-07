import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface ProfilePictureUploadProps {
  username: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ username, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState(false);
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
      console.log('Received external file selection event');
      const customEvent = event as CustomEvent<{ file: File }>;
      const file = customEvent.detail?.file;
      if (file) {
        console.log('External file selected:', file.name);
        handleFile(file);
      }
    };

    window.addEventListener('externalFileSelect', handleExternalFileSelect as EventListener);
    return () => {
      window.removeEventListener('externalFileSelect', handleExternalFileSelect as EventListener);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('ProfilePictureUpload file picker triggered');
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    } else {
      console.log('No file selected in ProfilePictureUpload');
    }
  };

  const handleFile = (file: File) => {
    console.log('File selected:', {
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
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    try {
      setUploading(true);
      const response = await profileService.uploadProfilePicture(username, selectedFile);

      if (response.success && response.imageUrl) {
        logger.info('Upload successful', { imageUrl: response.imageUrl });
        onUploadSuccess(response.imageUrl);
        setOpen(false);
        setError('');
      } else {
        const errorMessage = response.error || 'Upload failed. Please try again.';
        logger.error('Upload failed', { error: errorMessage });
        setError(errorMessage);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred during upload';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as { message?: string; error?: string }).message || 
                       (error as { message?: string; error?: string }).error || 
                       errorMessage;
      }
      logger.error('Upload error', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
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
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-40 h-40 rounded-full object-cover"
        />
      )}
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
