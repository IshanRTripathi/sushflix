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
import Settings from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../../modules/auth/context/AuthContext';
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

const StatItem = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  '& > span:first-of-type': {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: theme.palette.text.primary,
  },
  '& > span:last-child': {
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[400]
        : theme.palette.grey[600],
    fontSize: '0.875rem',
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
}));


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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
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
  
  /**
   * Handles the profile picture upload process
   * @param file - The file to upload
   * @returns Promise with upload result
   */
  const handleProfilePictureUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);
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
      
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        const errorMsg = 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
        logger.warn(errorMsg, { type: file.type });
        return { success: false, error: errorMsg };
      }
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const errorMsg = 'Image size exceeds 5MB limit. Please choose a smaller file.';
        logger.warn(errorMsg, { size: file.size });
        return { success: false, error: errorMsg };
      }
      
      // Upload the file using the service
      const response = await profileService.uploadProfilePicture(username, file);
      
      if (!response.success) {
        const errorMsg = response.error || 'Failed to upload profile picture';
        logger.error('Upload failed', { error: errorMsg, response });
        return { success: false, error: errorMsg };
      }
      
      // The server returns the URL in response.data.profilePicture
      const imageUrl = response.data?.profilePicture;
      
      if (!imageUrl) {
        const errorMsg = 'No image URL in response from server';
        logger.error(errorMsg, { response });
        return { success: false, error: errorMsg };
      }
      
      logger.info('Successfully uploaded profile picture', { imageUrl });
      
      // Invalidate and refetch profile data
      await queryClient.invalidateQueries({ 
        queryKey: ['userProfile', username],
        refetchType: 'active'
      });
      
      // Update the current user's profile picture in the auth context
      if (isCurrentUserProfile) {
        updateUser({ profilePicture: imageUrl });
      }
      
      // Show success state
      setUploadSuccess(true);
      logger.info('Profile picture updated successfully', { username });
      
      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
      
      return { 
        success: true, 
        imageUrl,
        // For backward compatibility
        url: imageUrl
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const userFriendlyError = 'Failed to upload profile picture. Please try again.';
      setUploadError(userFriendlyError);
      
      logger.error('Error uploading profile picture:', { 
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        username
      });
      
      // Clear error after 5 seconds
      setTimeout(() => setUploadError(null), 5000);
      
      return { 
        success: false,
        error: userFriendlyError
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

  // Ensure we have a valid profile picture URL or default to empty string
  const profilePictureUrl = profile.profilePicture || '';
  
  return (
    <Container maxWidth="md">
      <ProfileHeader>
        <Box sx={{ position: 'relative', mb: 2 }}>
          {isCurrentUserProfile ? (
            <>
              <ProfilePictureUpload
                currentImageUrl={profilePictureUrl}
                onUpload={handleProfilePictureUpload}
                isUploading={isUploading}
                showEditOnHover={true}
                className={uploadSuccess ? 'upload-success' : ''}
              />
              {/* Upload Status Feedback */}
              <Box sx={{ 
                mt: 1,
                minHeight: 24,
                textAlign: 'center'
              }}>
                {isUploading && (
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="textSecondary">
                      Uploading...
                    </Typography>
                  </Box>
                )}
                
                {uploadError && (
                  <Typography variant="caption" color="error">
                    {uploadError}
                  </Typography>
                )}
                
                {uploadSuccess && (
                  <Typography variant="caption" color="success.main">
                    Profile picture updated successfully!
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Box 
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ width: '100%', height: '100%' }}>
                <Box
                  component="img"
                  src={profilePictureUrl || '/default-avatar.png'}
                  alt={profile.displayName || 'Profile'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.png';
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
        
        <ProfileInfo>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h5" component="h1">
              {profile.displayName}
            </Typography>
            {!profile.isVerified && (
              <VerifiedIcon color="primary" fontSize="small" />
            )}
          
          <ActionButtons>
            {isCurrentUserProfile ? (
              <ActionButton 
                size="small"
                onClick={handleEditProfile}
                startIcon={<Settings />}
              >
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
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={400}>
              {"@" + profile.username}
            </Typography>
            {profile.bio && (
              <Bio variant="body2">
                {profile.bio}
              </Bio>
            )}
          </Box>
          
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
