import React, { useState } from 'react';
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';

interface ProfilePictureUploadProps {
  currentImage: string;
  onUploadSuccess?: (newImageUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentImage, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const profileService = ProfileService.getInstance();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.username) return;

    try {
      setUploading(true);
      logger.info('Uploading profile picture', { username: user.username, displayName: user.displayName });
      
      const response = await profileService.uploadProfilePicture(user.username, selectedFile);
      if (response?.success && response?.imageUrl) {
        logger.info('Profile picture uploaded successfully', { imageUrl: response.imageUrl });
        if (onUploadSuccess) {
          onUploadSuccess(response.imageUrl);
        }
        handleClose();
      } else {
        throw new Error(response?.error || 'Failed to upload profile picture');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      setError(errorMessage);
      logger.error('Error uploading profile picture', { error });
    } finally {
      setUploading(false);
    }
  };

  // Early return if user is not logged in
  if (!user?.username) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32">
              <img
                src={previewUrl || currentImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <CircularProgress size={24} color="inherit" />
                </div>
              )}
              <label
                htmlFor="profilePictureInput"
                className="absolute bottom-0 right-0 p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors duration-200"
              >
                <CloudUpload className="text-white w-6 h-6" />
              </label>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profilePictureInput"
                onChange={handleFileSelect}
              />

              {error && (
                <Alert severity="error" className="mt-2">
                  {error}
                </Alert>
              )}
            </div>
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
    </>
  );
};

export default ProfilePictureUpload;
