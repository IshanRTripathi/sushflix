import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';

interface CoverPhotoUploadProps {
  isVisible: boolean;
  isUploading?: boolean;
  onUpload: (file: File) => Promise<string>;
}

export const CoverPhotoUpload: React.FC<CoverPhotoUploadProps> = ({
  isVisible,
  isUploading = false,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    handleUpload(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: false,
    noClick: true, // We'll handle the click manually
  });

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    try {
      await onUpload(file);
    } catch (err) {
      setError('Failed to upload cover photo. Please try again.');
      console.error('Upload error:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <Box
      {...getRootProps()}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: isDragActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 1,
        '&:hover': {
          opacity: 1,
        },
      }}
    >
      <input
        {...getInputProps()}
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        accept="image/*"
      />
      <Tooltip title="Upload cover photo">
        <IconButton
          onClick={handleUploadClick}
          disabled={isUploading}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          {isUploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <CloudUploadIcon />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CoverPhotoUpload;
