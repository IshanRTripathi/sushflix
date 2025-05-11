import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Stack,
  Divider,
  useMediaQuery,
  Tooltip,
  CircularProgress,
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
  Language as WebsiteIcon,
} from '@mui/icons-material';
import { UserProfile } from '../../types/user';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { formatNumber } from '../../utils/format';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { CoverPhotoUpload } from './CoverPhotoUpload';

interface ProfileHeaderProps {
  username?: string;
  initialProfile?: UserProfile;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  initialProfile,
  onProfileUpdate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const {
    profile,
    isLoading,
    isCurrentUser,
    isFollowing,
    isCreator,
    stats,
    socialLinks,
    followUser,
    unfollowUser,
    uploadAvatar,
    uploadCoverPhoto,
  } = useProfile(username);

  const [isEditing, setIsEditing] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Use initial profile if provided, otherwise use the one from the hook
  const displayProfile = initialProfile || profile;

  const handleEditProfile = useCallback(() => {
    navigate('/settings/profile');
  }, [navigate]);

  const handleFollow = useCallback(async () => {
    try {
      startLoading();
      if (isFollowing) {
        await unfollowUser();
      } else {
        await followUser();
      }
    } finally {
      stopLoading();
    }
  }, [followUser, isFollowing, startLoading, stopLoading, unfollowUser]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        const url = await uploadAvatar(file);
        
        if (onProfileUpdate && displayProfile) {
          onProfileUpdate({
            ...displayProfile,
            profilePicture: url,
          });
        }
        
        return url;
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [displayProfile, onProfileUpdate, uploadAvatar]
  );

  const handleCoverUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        const url = await uploadCoverPhoto(file);
        
        if (onProfileUpdate && displayProfile) {
          onProfileUpdate({
            ...displayProfile,
            coverPhoto: url,
          });
        }
        
        return url;
      } catch (error) {
        console.error('Failed to upload cover photo:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [displayProfile, onProfileUpdate, uploadCoverPhoto]
  );

  if (isLoading && !displayProfile) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!displayProfile) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6">Profile not found</Typography>
      </Box>
    );
  }

  const {
    displayName,
    username: profileUsername,
    bio,
    profilePicture,
    coverPhoto,
    isVerified,
  } = displayProfile;

  const socialIcons = [
    { key: 'website', icon: <WebsiteIcon />, url: socialLinks?.website },
    { key: 'twitter', icon: <TwitterIcon />, url: socialLinks?.twitter },
    { key: 'instagram', icon: <InstagramIcon />, url: socialLinks?.instagram },
    { key: 'youtube', icon: <YouTubeIcon />, url: socialLinks?.youtube },
  ].filter(({ url }) => !!url);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: 1,
        mb: 3,
      }}
    >
      {/* Cover Photo */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 160, sm: 200, md: 240 },
          bgcolor: 'grey.200',
          backgroundImage: coverPhoto ? `url(${coverPhoto})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&:hover': {
            '& .cover-overlay': {
              opacity: 1,
            },
          },
        }}
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        {isCurrentUser && (
          <CoverPhotoUpload
            isVisible={isHoveringCover}
            onUpload={handleCoverUpload}
            isUploading={isUploading}
          />
        )}
      </Box>

      {/* Profile Info */}
      <Box sx={{ position: 'relative', px: { xs: 2, sm: 4 }, pb: 3 }}>
        {/* Avatar */}
        <Box
          sx={{
            position: 'relative',
            mt: -6,
            mb: 2,
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '4px solid',
            borderColor: 'background.paper',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            '&:hover': {
              '& .avatar-overlay': {
                opacity: 1,
              },
            },
          }}
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
        >
          <Avatar
            src={profilePicture}
            alt={displayName || profileUsername}
            sx={{
              width: '100%',
              height: '100%',
              fontSize: '3rem',
              bgcolor: 'primary.main',
            }}
          >
            {(displayName || profileUsername || '').charAt(0).toUpperCase()}
          </Avatar>

          {isCurrentUser && (
            <ProfilePictureUpload
              isVisible={isHoveringAvatar}
              onUpload={handleAvatarUpload}
              isUploading={isUploading}
            />
          )}
        </Box>

        {/* User Info */}
        <Box sx={{ mt: 1, mb: 2 }}>
          <Box display="flex" alignItems="center" flexWrap="wrap" mb={1}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mr: 1 }}>
              {displayName || profileUsername}
            </Typography>
            {isVerified && (
              <Tooltip title="Verified">
                <CheckIcon color="primary" fontSize="small" />
              </Tooltip>
            )}
            {isCreator && (
              <Box
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}
              >
                Creator
              </Box>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            @{profileUsername}
          </Typography>

          {bio && (
            <Typography variant="body1" paragraph>
              {bio}
            </Typography>
          )}

          {/* Social Links */}
          {socialIcons.length > 0 && (
            <Box display="flex" gap={2} mb={2}>
              {socialIcons.map(({ key, icon, url }) => (
                <Tooltip key={key} title={url}>
                  <IconButton
                    size="small"
                    href={url?.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>

        {/* Stats */}
        <Box display="flex" gap={3} mb={3}>
          <StatItem
            label="Posts"
            value={formatNumber(stats?.postCount || 0)}
            onClick={() => {}}
          />
          <StatItem
            label="Followers"
            value={formatNumber(stats?.followerCount || 0)}
            onClick={() => navigate(`/${profileUsername}/followers`)}
          />
          <StatItem
            label="Following"
            value={formatNumber(stats?.followingCount || 0)}
            onClick={() => navigate(`/${profileUsername}/following`)}
          />
          {isCreator && (
            <StatItem
              label="Subscribers"
              value={formatNumber(stats?.subscriberCount || 0)}
              onClick={() => navigate(`/${profileUsername}/subscribers`)}
            />
          )}
        </Box>

        {/* Actions */}
        <Box display="flex" gap={2} flexWrap="wrap">
          {isCurrentUser ? (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
                disabled={isUploading}
              >
                Edit Profile
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Share Profile'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                onClick={handleFollow}
                disabled={isUploading}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
              <Button variant="outlined" startIcon={<LinkIcon />}>
                Share
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

interface StatItemProps {
  label: string;
  value: string | number;
  onClick?: () => void;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, onClick }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        '& .stat-value': {
          color: 'primary.main',
        },
      },
    }}
    onClick={onClick}
  >
    <Typography
      variant="h6"
      component="span"
      className="stat-value"
      sx={{
        fontWeight: 'bold',
        transition: 'color 0.2s',
      }}
    >
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default ProfileHeader;
