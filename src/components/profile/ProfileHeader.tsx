import React from 'react';
import { Box, Button, Typography, Avatar, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { Edit as EditIcon } from '@mui/icons-material';

interface ProfileHeaderProps {
  user: any;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwner,
  onFollow,
  onUnfollow,
}) => {
  const navigate = useNavigate();
  const { setLoadingState } = useLoadingState();

  const handleEditClick = async () => {
    try {
      setLoadingState({ isLoading: true });
      navigate(`/profile/${user.username}/edit`);
    } finally {
      setLoadingState({ isLoading: false });
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Avatar
        src={user.profilePicture}
        sx={{ width: 120, height: 120 }}
      />
      <Box sx={{ flex: 1 }}>
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
