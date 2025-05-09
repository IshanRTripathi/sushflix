/**
 * Main layout component for user profiles
 */
import React, { useCallback, useState } from 'react';
import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import PostsGrid from './PostsGrid';
import SocialLinks from './SocialLinks';
import EditProfile from './EditProfile';
import { UserProfile } from '../../types/user';
import { userProfileService } from '../../services/userProfileService';

/**
 * Props for ProfileLayout component
 */
interface ProfileLayoutProps {
  initialUser: UserProfile;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onProfileUpdate?: (updatedUser: UserProfile) => void;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  initialUser,
  isOwner,
  onFollow,
  onUnfollow,
  onProfileUpdate,
}) => {
  const [user, setUser] = useState(() => {
    return {
      ...initialUser,
      username: initialUser.username || '',
      displayName: initialUser.displayName || '',
      bio: initialUser.bio || '',
      profilePicture: initialUser.profilePicture || '',
      socialLinks: initialUser.socialLinks || {},
      isCreator: initialUser.isCreator || false,
      following: initialUser.following || 0,
      followers: initialUser.followers || 0,
      posts: initialUser.posts || 0
    } as UserProfile;
  });

  const handleProfileUpdate = useCallback((updatedUser: UserProfile) => {
    setUser(updatedUser);
    if (onProfileUpdate) {
      onProfileUpdate(updatedUser);
    }
  }, [onProfileUpdate]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid width="100%">
          <ProfileHeader
            user={user}
            isOwner={isOwner}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onProfileUpdate={handleProfileUpdate}
          />
        </Grid>

        <Grid width={{ xs: '100%', md: '33.33%' }}>
          <Box>
            <StatsSection user={user} />
            <SocialLinks socialLinks={user.socialLinks || {}} />
          </Box>
        </Grid>

        <Grid width={{ xs: '100%', md: '66.66%' }}>
          <Box>
            {isOwner && <EditProfile user={user} />}
            <PostsGrid posts={user.posts || []} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileLayout;
