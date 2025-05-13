import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  CircularProgress,
  Tabs,
  Tab,
  styled
} from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../auth/AuthContext';
import profileService from '../../services/profileService';
import { logger } from '../../utils/logger';
import { useLoadingContext } from '../../contexts/LoadingContext';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { ApiResponse, UserProfile } from '../../types/user';
import EditProfile from '../profile/EditProfile';
import ProfilePictureUpload from '../profile/ProfilePictureUpload';

// Styled components
const ProfileHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

const ProfileInfo = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(4),
    textAlign: 'left',
  },
}));

// Username component removed as it's not being used

const Bio = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ProfileStats = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  margin: `${theme.spacing(3)} 0`,
  padding: theme.spacing(2, 0),
  borderTop: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StatItem = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '& > span:first-of-type': {
    fontWeight: 600,
    fontSize: '1.2rem',
  },
  '& > span:last-child': {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '0.875rem',
  },
});

const ActionButtons = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: `${theme.spacing(2)} 0`,
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-start',
  },
}));

interface ProfilePageParams {
  username: string;
}

export default function ProfilePage(): React.ReactElement {
  const { username } = useParams<keyof ProfilePageParams>();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoadingContext();
  
  // Redirect if no username is provided
  if (!username) {
    navigate('/');
    return <></>;
  }
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch user profile data
  const queryOptions: UseQueryOptions<ApiResponse<UserProfile>, Error> = {
    queryKey: ['userProfile', username],
    queryFn: () => profileService.getUserProfile(username),
    enabled: !!username,
  };

  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError 
  } = useQuery<ApiResponse<UserProfile>, Error>(queryOptions);

  // Handle query results
  useEffect(() => {
    if (userProfile?.data) {
      setIsFollowing(userProfile.data.isFollowing ?? false);
    }
  }, [userProfile]);

  // Handle query errors
  useEffect(() => {
    if (profileError) {
      logger.error('Error fetching user profile:', { error: profileError });
    }
  }, [profileError]);
  
  // Check if viewing own profile
  const isCurrentUserProfile = currentUser?.username === username;
  
  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };
  
  const handleProfileUpdate = async () => {
    if (!username) {
      logger.warn('Cannot update profile: missing username');
      return;
    }
    
    startLoading('profile-update');
    try {
      // In a real app, you would update the profile via an API call here
      // For now, we'll just close the modal and show a success message
      logger.info('Profile updated successfully');
      handleCloseEditModal();
      
      // Refresh the profile data
      await queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating profile:', { error: errorMessage });
      throw error;
    } finally {
      stopLoading('profile-update');
    }
  };
  
  const handleFollow = async () => {
    if (!username || !currentUser?.username) {
      logger.warn('Cannot follow/unfollow: missing username or current user');
      return;
    }
    
    const action = isFollowing ? 'unfollow' : 'follow';
    startLoading(`profile-${action}`);
    
    try {
      if (isFollowing) {
        await profileService.unfollowUser(currentUser.username, username);
      } else {
        await profileService.followUser(currentUser.username, username);
      }
      setIsFollowing(!isFollowing);
      await queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error following user:', { error: errorMessage });
      throw error;
    } finally {
      stopLoading(`profile-${action}`);
    }
  };
  
  const handleProfilePictureUpload = async (file: File) => {
    if (!username) {
      const errorMsg = 'Cannot upload profile picture: missing username';
      logger.warn(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setIsUploading(true);
    startLoading('profile-picture-upload');
    
    try {
      // Log the file being uploaded
      logger.info('Starting profile picture upload', {
        filename: file.name,
        size: file.size,
        type: file.type
      });
      
      // Upload the file using the service
      const response = await profileService.uploadProfilePicture(username, file);
      
      if (!response.success) {
        const errorMsg = response.error || 'Failed to upload profile picture';
        throw new Error(errorMsg);
      }
      
      // The server returns the URL in response.data.profilePicture
      const imageUrl = response.data?.profilePicture;
      
      if (!imageUrl) {
        logger.error('No image URL in response', { response });
        throw new Error('No image URL returned from server');
      }
      
      logger.info('Successfully uploaded profile picture', { imageUrl });
      
      // Invalidate and refetch profile data
      await queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      
      // Update the current user's profile picture in the auth context
      if (isCurrentUserProfile) {
        updateUser({ profilePicture: imageUrl });
      }
      
      // Return success with the updated profile picture URL
      // Using both url and imageUrl for maximum compatibility
      return { 
        success: true, 
        url: imageUrl,
        imageUrl: imageUrl
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error uploading profile picture:', { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      return { 
        success: false,
        error: errorMessage
      };
    } finally {
      stopLoading('profile-picture-upload');
      setIsUploading(false);
    }
  };
  

  
  // Show error state if there's an error or no user profile data
  if (isLoadingProfile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (profileError || !userProfile?.data) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {profileError?.message || 'Error loading profile. Please try again.'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  const profile = userProfile.data;

  return (
    <Container maxWidth="md">
      <ProfileHeader>
        <ProfilePictureUpload
          currentImageUrl={profile.profilePicture}
          onUpload={handleProfilePictureUpload}
          isUploading={isUploading}
        />
        
        <ProfileInfo>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h5" component="h1">
              {profile.displayName || profile.username}
            </Typography>
            {profile.isVerified && (
              <VerifiedIcon color="primary" fontSize="small" />
            )}
          </Box>
          
          <ActionButtons>
            {isCurrentUserProfile ? (
              <ActionButton 
                variant="outlined" 
                size="small"
                onClick={handleEditProfile}
                startIcon={<EditIcon />}
              >
                Edit Profile
              </ActionButton>
            ) : (
              <ActionButton 
                variant={isFollowing ? 'outlined' : 'contained'}
                color="primary"
                size="small"
                onClick={handleFollow}
                disabled={!currentUser}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </ActionButton>
            )}
          </ActionButtons>
          
          <ProfileStats>
            <StatItem>
              <span>{profile.stats?.postCount || 0}</span>
              <span>Posts</span>
            </StatItem>
            <StatItem>
              <span>{profile.stats?.followerCount || 0}</span>
              <span>Followers</span>
            </StatItem>
            <StatItem>
              <span>{profile.stats?.followingCount || 0}</span>
              <span>Following</span>
            </StatItem>
          </ProfileStats>
          
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {profile.displayName || profile.username}
            </Typography>
            {profile.bio && (
              <Bio variant="body2">
                {profile.bio}
              </Bio>
            )}
          </Box>
        </ProfileInfo>
      </ProfileHeader>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          aria-label="profile tabs"
        >
          <Tab 
            icon={<GridOnIcon />} 
            label="POSTS" 
            iconPosition="start" 
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
          <Tab 
            icon={<BookmarkBorderIcon />} 
            label="SAVED" 
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
            disabled={!isCurrentUserProfile}
          />
        </Tabs>
      </Box>
      
      <Box sx={{ py: 3 }}>
        {activeTab === 0 ? (
          (profile.stats?.posts || 0) > 0 ? (
            <Box>
              {/* Posts grid will go here */}
              <Typography>User's posts will appear here</Typography>
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary">
                No posts yet
              </Typography>
              {isCurrentUserProfile && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/create-post')}
                >
                  Create your first post
                </Button>
              )}
            </Box>
          )
        ) : (
          <Box>
            {isCurrentUserProfile ? (
              <Typography>Saved posts will appear here</Typography>
            ) : (
              <Typography>Only the account owner can view saved posts</Typography>
            )}
          </Box>
        )}
      </Box>
      
      {isEditModalOpen && (
        <EditProfile
          user={profile}
          onClose={handleCloseEditModal}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </Container>
  );
}
