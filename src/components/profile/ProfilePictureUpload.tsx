import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { ProfileService } from '../../services/profileService';
import { logger } from '../../utils/logger';

interface ProfilePictureUploadProps {
  currentImage: string;
  onUploadSuccess?: (newImageUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentImage, onUploadSuccess }) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const profileService = ProfileService.getInstance();

  // Early return if user is not logged in
  if (!user?.username) {
    return null;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File size must be less than 2MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.username) return;

    try {
      setUploading(true);
      setError(null);

      // Upload to Google Cloud Storage (assuming this is implemented in ProfileService)
      const response = await profileService.uploadProfilePicture(user.username, selectedFile);
      
      if (response.success && response.imageUrl) {
        // Update the profile picture URL
        if (onUploadSuccess) {
          onUploadSuccess(response.imageUrl);
        }
        handleClose();
      } else {
        setError(response.error || 'Failed to upload profile picture');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Profile picture upload failed:', { error });
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CloudUpload />}
        onClick={handleOpen}
      >
        Change Profile Picture
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40">
              <img
                src={previewUrl || currentImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <CircularProgress />
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="profilePictureInput"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="profilePictureInput"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select Image
            </label>

            {error && (
              <Alert severity="error" className="mt-4">
                {error}
              </Alert>
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
    </>
  );
};

export default ProfilePictureUpload;
