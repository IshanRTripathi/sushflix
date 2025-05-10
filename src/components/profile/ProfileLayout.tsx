/**
 * Main layout component for user profiles
 */
import React, { useCallback, useState } from 'react';
import { Box, Container, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import PostsGrid from './PostsGrid';
import SocialLinks from './SocialLinks';
import EditProfile from './EditProfile';
import { UserProfile, PartialProfileUpdate } from '../../types/user';
import { userProfileService } from '../../services/userProfileService';
import { logger } from '../../utils/logger';
import { useLoadingState } from '../../contexts/LoadingStateContext';

/**
 * Props for ProfileLayout component
 */
interface ProfileLayoutProps {
  initialUser: UserProfile;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onProfileUpdate?: (updates: PartialProfileUpdate) => Promise<void>;
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

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { setLoadingState } = useLoadingState();

  const handleProfileUpdate = useCallback(async (updates: PartialProfileUpdate) => {
    try {
      // Start loading state
      setLoadingState({ isLoading: true });
      
      // Validate updates
      if (Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
      }

      // Update local state with the new values
      const updatedUser = {
        ...user,
        ...updates
      };
      setUser(updatedUser);
      
      // Call the parent update handler if provided
      if (onProfileUpdate) {
        await onProfileUpdate(updates);
      }

      // Log successful update
      logger.info('Profile updated successfully', {
        username: user.username,
        updatedFields: Object.keys(updates)
      });

      // Show success message
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logger.error('Error updating profile', {
        error: {
          message: errorObj.message,
          name: errorObj.name,
          stack: errorObj.stack
        },
        username: user.username,
        updates,
        timestamp: new Date().toISOString()
      });

      // Revert local state on error
      setUser(initialUser);

      // Show error message
      setError(errorObj.message);
      setTimeout(() => setError(''), 3000);

    } finally {
      // End loading state
      setLoadingState({ isLoading: false });
    }
  }, [onProfileUpdate, initialUser, user, setLoadingState]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
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
