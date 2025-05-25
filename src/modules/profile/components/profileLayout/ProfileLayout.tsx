import React, { useCallback, useState } from 'react';
import { Box, Container, Alert } from '@mui/material';
import { ProfileHeader } from './ProfileHeader';
import StatsSection from './StatsSection';
import PostsGrid from './PostsGrid';
import SocialLinks from './SocialLinks';
import EditProfile from './EditProfile';
import type { IUserProfile as UserProfile, PartialProfileUpdate } from '../../../shared/types/user';
import { profileService } from '../../service/profileService';
import { logger } from '../../../shared/utils/logger';
import { useLoadingState } from '../../../ui/contexts/LoadingContext';
import { createUserProfileAdapter } from '../utils/adapters';

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
  const [user, setUser] = useState(() => createUserProfileAdapter(initialUser));
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { setLoadingState } = useLoadingState();

  const handleProfileUpdate = useCallback(async (updates: PartialProfileUpdate) => {
    try {
      setLoadingState({ isLoading: true });

      const response = await profileService.updateUserProfile(user.id, updates);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile');
      }

      const updatedUser = {
        ...user,
        ...updates,
        socialLinks: {
          ...user.socialLinks,
          ...(updates.socialLinks || {})
        }
      };

      setUser(updatedUser);

      if (onProfileUpdate) {
        await onProfileUpdate(updates);
      }

      logger.info('Profile updated successfully', {
        username: user.username,
        updatedFields: Object.keys(updates)
      });

      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error updating profile', {
        username: user.username,
        error: errorMessage
      });

      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingState({ isLoading: false });
    }
  }, [user, onProfileUpdate, setLoadingState]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <ProfileHeader
            user={user}
            isOwner={isOwner}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onProfileUpdate={handleProfileUpdate}
          />
          <StatsSection user={user} />
          <SocialLinks socialLinks={user.socialLinks} />
        </Box>

        <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
          {isOwner && <EditProfile user={user} onProfileUpdate={handleProfileUpdate} />}
          <PostsGrid posts={Array.isArray(user.posts) ? user.posts : []} />
        </Box>
      </Box>
    </Container>
  );
};

export default ProfileLayout;