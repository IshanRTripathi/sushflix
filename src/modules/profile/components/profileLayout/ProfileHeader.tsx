import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Link as LinkIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Language as WebsiteIcon
} from '@mui/icons-material';
import { IUserProfile as UserProfile } from '@/modules/shared/types/user';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { profileService } from '../../service';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onProfileUpdate?: (updates: Partial<UserProfile>) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwner,
  onFollow,
  onUnfollow,
  onProfileUpdate
}) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const [isUploading, setIsUploading] = useState(false);

  const handleEditProfile = () => navigate('/settings/profile');

  const handleFollowToggle = useCallback(async () => {
    if (isFollowing) {
      await onUnfollow?.();
    } else {
      await onFollow?.();
    }
    setIsFollowing(!isFollowing);
  }, [isFollowing, onFollow, onUnfollow]);

  const handleProfilePictureUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        const response = await profileService.uploadProfilePicture(user.userId, file);
        const imageUrl = response.data?.profilePicture;
        if (imageUrl && onProfileUpdate) {
          await onProfileUpdate({ profilePicture: imageUrl });
        }
        return { success: true, imageUrl };
      } catch (err) {
        return { success: false, error: 'Failed to upload profile picture' };
      } finally {
        setIsUploading(false);
      }
    },
    [user.userId, onProfileUpdate]
  );

  const socialLinks = [
    { icon: <InstagramIcon />, url: user.socialLinks?.instagram },
    { icon: <TwitterIcon />, url: user.socialLinks?.twitter },
    { icon: <YouTubeIcon />, url: user.socialLinks?.youtube },
    { icon: <WebsiteIcon />, url: user.socialLinks?.website }
  ].filter(link => link.url);

  return (
    <Box sx={{ position: 'relative', p: 2, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ProfilePictureUpload
          currentImageUrl={user.profilePicture}
          onUpload={handleProfilePictureUpload}
          isUploading={isUploading}
          showEditOnHover={isOwner}
        />

        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5">{user.displayName || user.username}</Typography>
            {user.isVerified && <CheckIcon fontSize="small" color="primary" />}
            {user.isCreator && (
              <Box sx={{ ml: 1, px: 1, py: 0.5, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>Creator</Box>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">@{user.username}</Typography>

          {user.bio && (
            <Typography mt={1} variant="body1">{user.bio}</Typography>
          )}

          {socialLinks.length > 0 && (
            <Box mt={2} display="flex" gap={1}>
              {socialLinks.map(({ icon, url }, index) => (
                <Tooltip key={index} title={url}>
                  <IconButton size="small" href={url} target="_blank" rel="noopener noreferrer">
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}

          <Box mt={2} display="flex" gap={2}>
            {isOwner ? (
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditProfile}>
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outlined' : 'contained'}
                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                onClick={handleFollowToggle}
                disabled={isUploading}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            <Button variant="outlined" startIcon={<LinkIcon />}>Share</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { ProfileHeader };