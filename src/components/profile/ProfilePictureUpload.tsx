import React, { useState, useEffect } from 'react';
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface ProfilePictureUploadProps {
  currentImage: string;
  username: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentImage, username, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState(false);
  const profileService = ProfileService.getInstance();

  useEffect(() => {
    const handleExternalFileSelect = (event: Event) => {
      console.log('Received external file selection event');
      const file = (event as CustomEvent).detail?.file;
      if (file) {
        console.log('External file selected:', file.name);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setOpen(true);
      }
    };

    window.addEventListener('externalFileSelect', handleExternalFileSelect);
    return () => window.removeEventListener('externalFileSelect', handleExternalFileSelect);
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
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum allowed size is 5MB.');
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    console.log('File selected successfully, preview URL:', preview);
    setError('');
    setOpen(true);
  };

  // Handle external file selection
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
      console.log('Starting upload process');
      logger.info('Uploading profile picture');
      
      console.log('Using username:', username);
      console.log('File to upload:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      const formData = new FormData();
      formData.append('file', selectedFile);

      logger.info('Sending upload request to server');
      const response = await profileService.uploadProfilePicture(username, selectedFile);
      logger.info('Received server response', { response });

      if (response.success && response.imageUrl) {
        logger.info('Upload successful', { imageUrl: response.imageUrl });
        onUploadSuccess(response.imageUrl);
        setOpen(false);
        setUploading(false);
        setError('');
      } else {
        const errorMessage = response.error || 'Upload failed. Please try again.';
        logger.error('Upload failed', { error: errorMessage });
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'An unexpected error occurred during upload';
      
      logger.error('Error uploading profile picture', { error });
      setError(errorMessage);
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
