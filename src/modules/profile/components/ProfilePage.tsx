import { useState, useEffect, useMemo } from 'react';
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
import { useAuth } from '@/modules/auth/context/AuthContext';
import profileService from '../service/profileService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Types } from 'mongoose';
import { IUserProfile } from '@/modules/shared/types/user/user.profile';
import { logger } from '@/modules/shared/utils/logger';
import { useLoadingContext } from '@/modules/ui/contexts/LoadingContext';
import type { UserProfileResponse } from '@/modules/shared/api/profile/profile.api';

// Define the expected user profile type
type UserProfile = UserProfileResponse['data']['user'] & {
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
};

import EditProfile from './profile/EditProfile';
import ProfilePictureUpload from './profile/ProfilePictureUpload';

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

const Bio = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  whiteSpace: 'pre-line',
  maxWidth: '100%',
  wordBreak: 'break-word',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '600px',
  },
}));

interface ProfilePageParams {
  username: string;
}

// Helper function to adapt our UserProfile to IUserProfile
function createUserProfileAdapter(user: UserProfile): IUserProfile {
  const baseProfile = {
    _id: new Types.ObjectId(user.id) as any,
    userId: new Types.ObjectId(user.id) as any,
    displayName: user.displayName || user.username,
    username: user.username,
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
    socialLinks: user.socialLinks || {},
    stats: {
      postCount: user.stats?.posts || 0,
      followerCount: user.stats?.followers || 0,
      followingCount: user.stats?.following || 0,
      subscriberCount: 0
    },
    isCreator: false,
    isVerified: user.isVerified || false,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: user.id,
    // MongoDB document methods
    save: async () => ({} as any),
    // Required methods
    incrementPostCount: async () => {},
    decrementPostCount: async () => {},
    incrementFollowerCount: async () => {},
    decrementFollowerCount: async () => {},
    incrementFollowingCount: async () => {},
    decrementFollowingCount: async () => {},
    incrementSubscriberCount: async () => {},
    decrementSubscriberCount: async () => {}
  };

  // Add MongoDB document methods
  const adaptedProfile: IUserProfile = {
    ...baseProfile,
    toObject: () => ({
      ...baseProfile,
      _id: new Types.ObjectId(user.id),
      userId: new Types.ObjectId(user.id)
    }),
    toJSON: () => ({
      ...baseProfile,
      _id: user.id,
      userId: user.id,
      createdAt: baseProfile.createdAt.toISOString(),
      updatedAt: baseProfile.updatedAt.toISOString()
    })
  } as unknown as IUserProfile; // Type assertion as a last resort

  return adaptedProfile;
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
  const [isLoadingFollow] = useState(false);
  
  // Check if viewing own profile
  const isCurrentUserProfile = currentUser?.username === username;

  // Fetch user profile data
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      logger.debug('Fetching profile for user:', username);
      try {
        const response = await profileService.getUserProfile(username!);
        logger.debug('Profile API response:', response);
        return response as unknown as UserProfileResponse; // Type assertion to match the expected response format
      } catch (error) {
        logger.error('Error in profile queryFn:', error);
        throw error;
      }
    },
    enabled: !!username,
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Extract user data for easier access, with fallback to current user data
  const user = useMemo(() => {
    // If we have user data from the profile API, use that
    if (userProfile?.data?.user) {
      return userProfile.data.user as UserProfile;
    }
    
    // If we have current user data but no profile data, create a basic profile
    if (currentUser) {
      return {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.name || currentUser.username,
        email: currentUser.email,
        bio: '',
        profilePicture: currentUser.profilePicture || '',
        socialLinks: {},
        stats: {
          posts: 0,
          followers: 0,
          following: 0
        },
        isVerified: false,
        isFollowing: false,
        isCreator: currentUser.isCreator || false,
        role: currentUser.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as UserProfile;
    }
    
    return undefined;
  }, [userProfile, currentUser]);

  // Debug log when profile data changes
  useEffect(() => {
    logger.debug('Profile data changed:', { 
      hasUserData: !!userProfile?.data?.user,
      isLoadingProfile, 
      profileError,
      hasUser: !!user,
      currentUsername: currentUser?.username,
      isCurrentUserProfile: currentUser?.username === username,
      userData: {
        id: user?.id,
        username: user?.username,
        hasProfilePicture: !!user?.profilePicture
      }
    });
  }, [userProfile, isLoadingProfile, profileError, user, currentUser, username]);

  // Handle query results
  useEffect(() => {
    if (user) {
      setIsFollowing(user.isFollowing ?? false);
      
      // Update the current user's profile picture if it's their own profile
      if (isCurrentUserProfile && user.profilePicture) {
        updateUser({ ...currentUser, profilePicture: user.profilePicture });
      }
    }
  }, [user, isCurrentUserProfile, currentUser, updateUser]);

  // Handle query errors
  useEffect(() => {
    if (profileError) {
      logger.error('Error fetching user profile:', { error: profileError });
    }
  }, [profileError]);
  
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
  

  // Ensure we have a valid profile picture URL or default to empty string
  const profilePictureUrl = user?.profilePicture || '';
  
  // Show loading state
  if (isLoadingProfile) {
    logger.debug('Showing loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error if no user data is available after loading is complete
  if (!user) {
    logger.error('No user data available after loading completed', { 
      userProfile, 
      profileError,
      currentUser 
    });
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Failed to load profile data
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => refetchProfile()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {profileError.message || 'Error loading profile'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => refetchProfile()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <ProfileHeader>
        <Box sx={{ position: 'relative' }}>
          <ProfilePictureUpload
            currentImageUrl={profilePictureUrl}
            onUpload={handleProfilePictureUpload}
            isUploading={isUploading}
            showEditOnHover={isCurrentUserProfile}
          />
          {uploadSuccess && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: 1,
                px: 1,
                fontSize: '0.75rem',
                zIndex: 1,
              }}
            >
              Updated!
            </Box>
          )}
          {uploadError && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'error.main',
                color: 'white',
                borderRadius: 1,
                px: 1,
                fontSize: '0.75rem',
                zIndex: 1,
              }}
            >
              Error
            </Box>
          )}
        </Box>

        <ProfileInfo>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="h5" component="h1" sx={{ mr: 1, fontWeight: 500 }}>
              {user.username}
            </Typography>
            {user.isVerified && (
              <VerifiedIcon color="primary" fontSize="small" />
            )}
          </Box>

          <Box display="flex" gap={3} mb={2}>
            <Typography variant="body1">
              <strong>{user.stats?.posts || 0}</strong> posts
            </Typography>
            <Typography variant="body1">
              <strong>{user.stats?.followers || 0}</strong> followers
            </Typography>
            <Typography variant="body1">
              <strong>{user.stats?.following || 0}</strong> following
            </Typography>
          </Box>

          <Bio variant="body1" sx={{ mb: 2 }}>
            {user.bio || 'No bio yet.'}
          </Bio>

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {user.socialLinks?.website && (
              <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outlined" size="small">
                  Website
                </Button>
              </a>
            )}
            {user.socialLinks?.twitter && (
              <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outlined" size="small">
                  Twitter
                </Button>
              </a>
            )}
            {user.socialLinks?.instagram && (
              <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outlined" size="small">
                  Instagram
                </Button>
              </a>
            )}
            {user.socialLinks?.youtube && (
              <a href={`https://youtube.com/${user.socialLinks.youtube}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outlined" size="small">
                  YouTube
                </Button>
              </a>
            )}
          </Box>

          {isCurrentUserProfile ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleEditProfile}
              startIcon={<Settings />}
              sx={{ mt: 1 }}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              color="primary"
              size="small"
              onClick={handleFollow}
              disabled={isLoadingFollow}
              sx={{ mt: 1 }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </ProfileInfo>
      </ProfileHeader>

      <Box mt={4}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
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
            sx={{ 
              textTransform: 'none', 
              minHeight: 48,
              display: isCurrentUserProfile ? 'flex' : 'none' 
            }}
          />
        </Tabs>
      </Box>
      
      <Box sx={{ py: 3 }}>
        {activeTab === 0 ? (
          (user?.stats?.posts || 0) > 0 ? (
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
      
      {isEditModalOpen && user && (
        <EditProfile
          user={createUserProfileAdapter(user)}
          onClose={handleCloseEditModal}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </Container>
  );
}
