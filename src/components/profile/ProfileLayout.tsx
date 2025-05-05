import React from 'react';
import { Box, Container } from '@mui/material';
import { Grid as MuiGrid } from '@mui/material/Grid';
import ProfileHeader from './ProfileHeader';
import StatsSection from './StatsSection';
import PostsGrid from './PostsGrid';
import SocialLinks from './SocialLinks';
import EditProfile from './EditProfile';

interface ProfileLayoutProps {
  user: any;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  user,
  isOwner,
  onFollow,
  onUnfollow,
}) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <MuiGrid container spacing={4}>
        {/* Profile Header Section */}
        <MuiGrid xs={12}>
          <ProfileHeader
            user={user}
            isOwner={isOwner}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
          />
        </MuiGrid>

        {/* Stats and Social Links Section */}
        <MuiGrid xs={12} md={4}>
          <Box>
            <StatsSection user={user} />
            <SocialLinks socialLinks={user.socialLinks} />
          </Box>
        </MuiGrid>

        {/* Posts and Edit Profile Section */}
        <MuiGrid xs={12} md={8}>
          <Box>
            {isOwner && <EditProfile user={user} />}
            <PostsGrid posts={user.posts} />
          </Box>
        </MuiGrid>
      </MuiGrid>
    </Container>
  );
};

export default ProfileLayout;
