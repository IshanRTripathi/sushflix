/**
 * Profile header component that displays user information
 */
import React, { useCallback } from 'react';
import { Box, Button, Typography, Avatar, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { Edit as EditIcon } from '@mui/icons-material';
import { EditProfileProps } from './types';
import { UserProfile, PartialProfileUpdate } from '../../types/user';
import ProfilePictureUpload from '../profile/ProfilePictureUpload';

/**
 * Props for ProfileHeader component
 */
interface ProfileHeaderProps {
  user: UserProfile;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onProfileUpdate?: (updates: PartialProfileUpdate) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwner,
  onFollow,
  onUnfollow,
  onProfileUpdate,
}) => {
  const navigate = useNavigate();
  const { setLoadingState } = useLoadingState();

  const handleUploadSuccess = useCallback((newImageUrl: string) => {
    if (onProfileUpdate) {
      onProfileUpdate({ profilePicture: newImageUrl });
    }
  }, [onProfileUpdate]);

  const handleEditClick = () => {
    navigate(`/profile/${user.username}/edit`);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Avatar
        src={user.profilePicture}
        sx={{ width: 120, height: 120 }}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" component="h1">
          {user.displayName || user.username}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          @{user.username}
        </Typography>
        {user.bio && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {user.bio}
          </Typography>
        )}
        
        {user.isCreator && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="primary">
              Creator
            </Typography>
          </Box>
        )}
      </Box>
      <ProfilePictureUpload
        username={user.username}
        onUploadSuccess={handleUploadSuccess}
      />
      <Stack direction="row" spacing={2}>
        {!isOwner && onFollow && onUnfollow && (
          <LoadingButton
            variant="contained"
            onClick={user.following ? onUnfollow : onFollow}
            loading={false}
            color={user.following ? "error" : "primary"}
          >
            {user.following ? 'Unfollow' : 'Follow'}
          </LoadingButton>
        )}
        {isOwner && (
          <Button
            variant="outlined"
            onClick={handleEditClick}
            startIcon={<EditIcon />}
          >
            Edit Profile
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default ProfileHeader;
