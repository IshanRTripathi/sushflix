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
import { createUserProfileAdapter } from './utils/adapters';
import { useLoadingContext } from '@/modules/ui/contexts/LoadingContext';
import EditProfile from './profileLayout/EditProfile';
import ProfilePictureUpload from './profileLayout/ProfilePictureUpload';
import StatsSection from './profileLayout/StatsSection';
import SocialLinks from './profileLayout/SocialLinks';

const ProfileHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  }
}));

const ProfileInfo = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(4),
    textAlign: 'left'
  }
}));

const Bio = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  whiteSpace: 'pre-line',
  maxWidth: '100%',
  wordBreak: 'break-word',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '600px'
  }
}));

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoadingContext();

  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isCurrentUserProfile = currentUser?.username === username;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: () => profileService.getUserProfile(username),
    enabled: !!username,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const user = useMemo(() => {
    if (data?.data?.user) return data.data.user;
    if (currentUser) {
      return {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.name || currentUser.username,
        bio: '',
        profilePicture: currentUser.profilePicture || '',
        socialLinks: {},
        stats: { posts: 0, followers: 0, following: 0 },
        isVerified: false,
        isFollowing: false,
        isCreator: currentUser.isCreator || false
      };
    }
    return undefined;
  }, [data, currentUser]);

  useEffect(() => {
    if (user && isCurrentUserProfile && user.profilePicture) {
      updateUser({ ...currentUser, profilePicture: user.profilePicture });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!username) return;
    startLoading('profile-update');
    try {
      await queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      setIsEditModalOpen(false);
    } finally {
      stopLoading('profile-update');
    }
  };

  const handleTabChange = (_e, val) => setActiveTab(val);

  if (isLoading) {
    return <Box display="flex" justifyContent="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Failed to load profile</Typography>
        <Button onClick={refetch}>Retry</Button>
      </Container>
    );
  }

  const adaptedUser = createUserProfileAdapter(user);

  return (
    <Container maxWidth="md">
      <ProfileHeader>
        {/* <Box>
          <ProfilePictureUpload
            currentImageUrl={user.profilePicture || ''}
            onUpload={async (file) => {
              const response = await profileService.uploadProfilePicture(username, file);
              if (response.success) await handleProfileUpdate();
              return { success: response.success, imageUrl: response.data?.profilePicture };
            }}
            isUploading={false}
            showEditOnHover={isCurrentUserProfile}
          />
        </Box> */}

        <ProfileInfo>
          <Box display="flex" alignItems="center">
            <Typography variant="h5">{user.username}</Typography>
            {user.isVerified && <VerifiedIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
          </Box>

          <StatsSection user={user} />

          <Bio variant="body1">{user.bio || 'No bio yet.'}</Bio>

          <SocialLinks socialLinks={user.socialLinks || {}} />

          <Box mt={2}>
            {isCurrentUserProfile ? (
              <Button
                startIcon={<Settings />}
                variant="contained"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            ) : null}
          </Box>
        </ProfileInfo>
      </ProfileHeader>

      <Box mt={4}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<GridOnIcon />} label="Posts" />
          {isCurrentUserProfile && <Tab icon={<BookmarkBorderIcon />} label="Saved" />}
        </Tabs>

        <Box py={3}>
          {activeTab === 0 ? (
            user.stats?.posts > 0 ? <Typography>Posts grid goes here</Typography>
              : <Typography>No posts yet</Typography>
          ) : (
            <Typography>Saved posts placeholder</Typography>
          )}
        </Box>
      </Box>

      {isEditModalOpen && (
        <EditProfile
          user={adaptedUser}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </Container>
  );
}