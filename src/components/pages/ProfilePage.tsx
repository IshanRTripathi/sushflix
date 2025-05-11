import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import profileService from '../../services/profileService';
import { logger } from '../../utils/logger';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../../types/user';
import { styled } from '@mui/material/styles';
import { 
  Avatar, 
  Button, 
  Typography, 
  Container, 
  Box, 
  CircularProgress, 
  Tabs,
  Tab,
  useTheme,
  IconButton
} from '@mui/material';
import EditProfile from '../profile/EditProfile';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VerifiedIcon from '@mui/icons-material/Verified';
import GridOnIcon from '@mui/icons-material/GridOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const ProfileHeader = styled('div')(({ theme }) => ({
  padding: theme.spacing(4, 2, 2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(4),
  },
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginTop: 0,
  },
}));

const Username = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Bio = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  fontSize: '0.95rem',
  lineHeight: 1.5,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(0.75, 2),
  borderRadius: '8px',
  fontSize: '0.9rem',
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.text.primary,
    },
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
  '&.MuiAvatar-root': {
    fontSize: '3rem',
  },
  [theme.breakpoints.up('sm')]: {
    width: 140,
    height: 140,
  },
  [theme.breakpoints.up('md')]: {
    width: 160,
    height: 160,
  },
}));

const ProfileStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 0),
  margin: theme.spacing(2, 0),
  gap: theme.spacing(1),
  '& > *': {
    flex: 1,
    textAlign: 'center',
  },
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-start',
    gap: theme.spacing(4),
    '& > *': {
      flex: 'none',
      textAlign: 'left',
    },
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    alignItems: 'flex-start',
  },
  '& > span:first-of-type': {
    fontWeight: 600,
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
  },
  '& > span:last-child': {
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  margin: theme.spacing(2, 0),
  '& > *': {
    flex: 1,
  },
  [theme.breakpoints.up('sm')]: {
    '& > *': {
      flex: 'none',
      minWidth: '120px',
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  margin: theme.spacing(3, 0, 2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Grid layout will be implemented when posts are available
// const ProfileGrid = styled(Box)(({ theme }) => ({
//   display: 'grid',
//   gridTemplateColumns: 'repeat(3, 1fr)',
//   gap: theme.spacing(1),
//   marginTop: theme.spacing(2),
// }));

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setLoadingState } = useLoadingState();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const isCurrentUserProfile = currentUser?.username === username;
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    logger.info(`ProfilePage mounted for user: ${username}`);
  }, [username]);

  const { 
    data: userProfile, 
    isLoading: isProfileLoading, 
    error: profileError
  } = useQuery<UserProfile | null>({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      if (!username) {
        logger.warn('No username provided for profile fetch');
        throw new Error('Username is required');
      }
      
      try {
        logger.info('Fetching profile for user', { username });
        const profile = await profileService.getUserProfile(username);
        
        if (!profile) {
          logger.warn('No profile data received for user', { username });
          throw new Error('No profile data received');
        }
        
        logger.info('Fetched profile data', { 
          hasProfile: !!profile,
          profileKeys: profile ? Object.keys(profile) : []
        });
        
        // Ensure the profile has all required fields with defaults
        const defaultProfile: UserProfile = {
          id: profile?.id || `user-${Date.now()}`,
          userId: profile?.userId || `user-${Date.now()}`,
          role: profile?.role || 'user',
          username: username,
          email: profile?.email || '',
          emailVerified: profile?.emailVerified || false,
          displayName: profile?.displayName || username,
          bio: profile?.bio || '',
          profilePicture: profile?.profilePicture || '',
          coverPhoto: profile?.coverPhoto || '',
          socialLinks: profile?.socialLinks || {},
          stats: {
            ...(profile?.stats || {}),
            postCount: profile?.stats?.postCount ?? 0,
            followerCount: profile?.stats?.followerCount ?? 0,
            followingCount: profile?.stats?.followingCount ?? 0,
            subscriberCount: profile?.stats?.subscriberCount ?? 0
          },
          preferences: {
            theme: profile?.preferences?.theme || 'system',
            notifications: {
              email: profile?.preferences?.notifications?.email ?? true,
              push: profile?.preferences?.notifications?.push ?? true,
            },
          },
          isCreator: profile?.isCreator || false,
          isVerified: profile?.isVerified || false,
          createdAt: profile?.createdAt || new Date().toISOString(),
          updatedAt: profile?.updatedAt || new Date().toISOString(),
        };

        // Log the final merged profile for debugging
        logger.debug('Merged profile data', { 
          defaultProfile: Object.keys(defaultProfile),
          hasStats: !!defaultProfile.stats,
          statsKeys: defaultProfile.stats ? Object.keys(defaultProfile.stats) : []
        });
        
        setIsFollowing(defaultProfile.isFollowing ?? false);
        return defaultProfile;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error in profile query', { 
          username,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    enabled: !!username,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFollow = useCallback(async () => {
    if (!currentUser || !username) {
      navigate('/login');
      return;
    }
    
    try {
      setLoadingState({ isLoading: true });
      if (isFollowing) {
        await profileService.unfollowUser(currentUser.username, username);
      } else {
        await profileService.followUser(currentUser.username, username);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      logger.error('Error toggling follow status', { error });
    } finally {
      setLoadingState({ isLoading: false });
    }
  }, [currentUser, isFollowing, username, navigate, setLoadingState]);

  const handleEditProfile = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleProfileUpdate = useCallback(() => {
    // Invalidate the profile query to refetch the updated data
    queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    setIsEditModalOpen(false);
  }, [queryClient, username]);
  
  if (isProfileLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (profileError) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading profile
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {profileError instanceof Error ? profileError.message : 'An unknown error occurred'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => queryClient.refetchQueries({ queryKey: ['userProfile', username] })}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">User not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  if (!username || (!isProfileLoading && !userProfile)) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">User not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {isEditModalOpen && isCurrentUserProfile && userProfile && (
        <EditProfile 
          user={userProfile} 
          onProfileUpdate={handleProfileUpdate}
          onClose={handleCloseEditModal}
        />
      )}
      <ProfileHeader>
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          [theme.breakpoints.up('sm')]: {
            alignItems: 'flex-start',
          },
        }}>
          <ProfileAvatar 
            alt={userProfile.displayName || userProfile.username} 
            src={userProfile.profilePicture || '/default-avatar.png'}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {!userProfile.profilePicture && (userProfile.displayName || userProfile.username).charAt(0).toUpperCase()}
          </ProfileAvatar>
          
          <ActionButtons>
            {isCurrentUserProfile ? (
              <ActionButton
                variant="outlined"
                onClick={handleEditProfile}
                startIcon={<EditIcon fontSize="small" />}
              >
                Edit Profile
              </ActionButton>
            ) : (
              <ActionButton
                variant={isFollowing ? 'outlined' : 'contained'}
                onClick={handleFollow}
                startIcon={isFollowing ? <PersonRemoveIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </ActionButton>
            )}
            {!isCurrentUserProfile && (
              <ActionButton
                variant="outlined"
                startIcon={<MoreHorizIcon />}
                sx={{ minWidth: '40px !important' }}
              />
            )}
          </ActionButtons>
        </Box>
        
        <ProfileInfo>
          <Box>
            <Username variant="h4">
              {userProfile.username}
              {userProfile.isVerified && (
                <VerifiedIcon color="primary" fontSize="small" sx={{ verticalAlign: 'middle' }} />
              )}
            </Username>
            
            <ProfileStats>
              <StatItem>
                <span>{userProfile.stats?.postCount?.toLocaleString() ?? 0}</span>
                <span>Posts</span>
              </StatItem>
              <StatItem>
                <span>{userProfile.stats?.followerCount?.toLocaleString() ?? 0}</span>
                <span>Followers</span>
              </StatItem>
              <StatItem>
                <span>{userProfile.stats?.followingCount?.toLocaleString() ?? 0}</span>
                <span>Following</span>
              </StatItem>
            </ProfileStats>
            
            <Typography variant="subtitle1" fontWeight={600}>
              {userProfile.displayName}
            </Typography>
            {userProfile.bio && <Bio variant="body2">{userProfile.bio}</Bio>}
          </Box>
        </ProfileInfo>
      </ProfileHeader>
      
      <Box sx={{ mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab 
            icon={<GridOnIcon />} 
            label="POSTS" 
            value="posts"
            sx={{ textTransform: 'none', minWidth: '120px' }}
          />
          <Tab 
            icon={<BookmarkBorderIcon />} 
            label="SAVED" 
            value="saved"
            disabled
            sx={{ textTransform: 'none', minWidth: '120px' }}
          />
        </Tabs>
        
        <Box sx={{ mt: 3 }}>
          {activeTab === 'posts' && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No posts yet
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
