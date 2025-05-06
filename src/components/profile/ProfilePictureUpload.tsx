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
      setError('File size must be less than 2MB');
      console.log('File size validation failed');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      console.log('File type validation failed');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    console.log('File selected successfully, preview URL:', previewUrl);
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
      console.log('Current image URL:', currentImage);
      logger.info('Uploading profile picture');
      
      console.log('Using username:', username);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await profileService.uploadProfilePicture(username, selectedFile);
      console.log('Server response:', response);

      if (response.success && response.imageUrl) {
        onUploadSuccess(response.imageUrl);
        setOpen(false);
        setUploading(false);
        setError('');
        logger.info('Profile picture uploaded successfully');
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      logger.error('Error uploading profile picture', { error });
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
