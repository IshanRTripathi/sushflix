/**
 * Main layout component for user profiles
 */
import React, { useCallback, useState } from 'react';
import { Box, Container, Alert } from '@mui/material';
import { ProfileHeader } from './ProfileHeader';
import StatsSection from './StatsSection';
import PostsGrid from './PostsGrid';
import SocialLinks from './SocialLinks';
import EditProfile from './EditProfile';
import type { UserProfile, PartialProfileUpdate } from '../../types/user';
import { profileService } from '../../services/profileService';
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
  const [user, setUser] = useState<UserProfile>(() => ({
    ...initialUser,
    username: initialUser.username || '',
    displayName: initialUser.displayName || '',
    bio: initialUser.bio || '',
    profilePicture: initialUser.profilePicture || '',
    socialLinks: {
      website: initialUser.socialLinks?.website || '',
      twitter: initialUser.socialLinks?.twitter || '',
      youtube: initialUser.socialLinks?.youtube || '',
      instagram: initialUser.socialLinks?.instagram || ''
    },
    isCreator: initialUser.isCreator || false,
    following: initialUser.following || 0,
    followers: initialUser.followers || 0,
    posts: initialUser.posts || []
  } as UserProfile));

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

      // Call the API to update the profile
      const response = await profileService.updateUserProfile(user.id, updates as Record<string, unknown>);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile');
      }

      // Update local state with the new values
      const updatedUser = {
        ...user,
        ...updates,
        socialLinks: {
          ...user.socialLinks,
          ...updates.socialLinks
        }
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
      setTimeout(() => setSuccessMessage(''), 5173);

    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      const errorData = {
        message: errorObj.message,
        name: errorObj.name,
        ...(errorObj.stack && { stack: errorObj.stack })
      };
      
      logger.error('Error updating profile', {
        error: errorData,
        username: user.username,
        updates,
        timestamp: new Date().toISOString()
      } as Record<string, unknown>);

      // Show error message
      setError(errorObj.message);
      setTimeout(() => setError(''), 5173);

    } finally {
      // End loading state
      setLoadingState({ isLoading: false });
    }
  }, [onProfileUpdate, initialUser, user, setLoadingState]);



  const handleFollow = useCallback(async () => {
    if (!onFollow) return;
    try {
      setLoadingState({ isLoading: true });
      await onFollow();
      setUser(prev => ({
        ...prev,
        followers: (prev.followers || 0) + (prev.isFollowing ? -1 : 1),
        isFollowing: !prev.isFollowing
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update follow status';
      logger.error('Failed to update follow status:', { error: errorMessage });
      setError('Failed to update follow status');
    } finally {
      setLoadingState({ isLoading: false });
    }
  }, [onFollow, setLoadingState]);

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
<Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Box>
            <ProfileHeader
              user={user}
              isOwner={isOwner}
              onFollow={onFollow ? handleFollow : undefined}
              onUnfollow={onUnfollow ? handleFollow : undefined}
              onProfileUpdate={handleProfileUpdate}
            />
            <StatsSection user={user} />
            <SocialLinks socialLinks={user.socialLinks || {}} />
          </Box>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
          <Box>
            {isOwner && <EditProfile user={user} />}
            <PostsGrid posts={Array.isArray(user.posts) ? user.posts : []} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfileLayout;
