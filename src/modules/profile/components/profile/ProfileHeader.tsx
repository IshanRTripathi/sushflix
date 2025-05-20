import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
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
import { UserProfile } from '../../../../types/user';
import { useLoading } from '../../../ui/contexts/LoadingContext';
import { ProfilePictureUpload } from './ProfilePictureUpload';

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
  onProfileUpdate,
}) => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  // Use the provided user prop
  const displayProfile = user;

  const handleEditProfile = useCallback(() => {
    navigate('/settings/profile');
  }, [navigate]);

  const handleFollow = useCallback(async () => {
    try {
      startLoading();
      if (isFollowing) {
        onUnfollow?.();
      } else {
        onFollow?.();
      }
      setIsFollowing(!isFollowing);
    } finally {
      stopLoading();
    }
  }, [isFollowing, onFollow, onUnfollow, startLoading, stopLoading]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        // TODO: Implement actual avatar upload
        // const response = await profileService.uploadProfilePicture(displayProfile.userId, file);
        // const url = response.data?.profilePicture;
        
        if (onProfileUpdate && displayProfile) {
          await onProfileUpdate({
            ...displayProfile,
            profilePicture: URL.createObjectURL(file), // Temporary URL for preview
          });
        }
        return { success: true, imageUrl: URL.createObjectURL(file) };
      } catch (error) {
        console.error('Error uploading avatar:', error);
        return { success: false, error: 'Failed to upload avatar' };
      } finally {
        setIsUploading(false);
      }
    },
    [displayProfile, onProfileUpdate]
  );

  const handleCoverPhotoUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        if (onProfileUpdate && displayProfile) {
          await onProfileUpdate({
            ...displayProfile,
            coverPhoto: URL.createObjectURL(file), // Temporary URL for preview
          });
        }
        return { success: true, imageUrl: URL.createObjectURL(file) };
      } catch (error) {
        console.error('Error uploading cover photo:', error);
        return { success: false, error: 'Failed to upload cover photo' };
      } finally {
        setIsUploading(false);
      }
    },
    [displayProfile, onProfileUpdate]
  );

  if (isUploading && !displayProfile) {
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

  // Social links section
  const socialIcons = [
    { 
      key: 'instagram',
      icon: <InstagramIcon />, 
      url: displayProfile.socialLinks?.instagram
    },
    { 
      key: 'twitter',
      icon: <TwitterIcon />, 
      url: displayProfile.socialLinks?.twitter
    },
    { 
      key: 'youtube',
      icon: <YouTubeIcon />, 
      url: displayProfile.socialLinks?.youtube
    },
    { 
      key: 'website',
      icon: <WebsiteIcon />, 
      url: displayProfile.socialLinks?.website
    },
  ].filter(link => link.url);

  const stats = [
    { label: 'Posts', value: displayProfile.postsCount || 0 },
    { label: 'Followers', value: displayProfile.followers || 0 },
    { label: 'Following', value: displayProfile.following || 0 },
  ];

  if (displayProfile.isCreator) {
    stats.push({ label: 'Subscribers', value: displayProfile.subscribers || 0 });
  }

  const renderActionButton = () => {
    if (isOwner) {
      return (
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditProfile}
          disabled={isUploading}
        >
          Edit Profile
        </Button>
      );
    }

    if (isFollowing) {
      return (
        <Button
          variant="outlined"
          startIcon={<PersonRemoveIcon />}
          onClick={handleFollow}
          disabled={isUploading}
        >
          Following
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={handleFollow}
        disabled={isUploading}
      >
        Follow
      </Button>
    );
  };

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
        {isOwner && (
          <ProfilePictureUpload
            isVisible={isHoveringCover}
            onUpload={handleCoverPhotoUpload}
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
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem',
              border: '2px solid blue', // Add border to see the container
            }}
          >
            {profilePicture ? (
              <Box
                component="img"
                src={profilePicture}
                alt={displayName || profileUsername}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  console.log('Profile image loaded:', {
                    src: img.src,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    clientWidth: img.clientWidth,
                    clientHeight: img.clientHeight,
                  });
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('Error loading profile image:', {
                    src: target.src,
                    error: 'Failed to load image',
                  });
                  target.style.display = 'none';
                }}
              />
            ) : (
              <span>{(displayName || profileUsername || '').charAt(0).toUpperCase()}</span>
            )}
          </Box>

          {isOwner && (
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
            {displayProfile.isCreator && (
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
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
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
          {stats.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  '& .stat-value': {
                    color: 'primary.main',
                  },
                },
              }}
              onClick={() => navigate(`/${profileUsername}/${stat.label.toLowerCase()}`)}
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
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Actions */}
        <Box display="flex" gap={2} flexWrap="wrap">
          {renderActionButton()}
          <Button variant="outlined" startIcon={<LinkIcon />}>
            Share
          </Button>
        </Box>
    </Box>
  </Box>
);
};

export { ProfileHeader };
