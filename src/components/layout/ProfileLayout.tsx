import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ProfilePage from '../pages/ProfilePage';
import { UserProfile } from '../../types/user';

interface ProfileLayoutProps {
  children?: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  // Determine if viewing own profile
  const isOwnProfile = currentUser?.username === username;

  // Mock data - replace with actual user data
  const userProfile: UserProfile = {
    userId: '1',
    username: username || '',
    displayName: 'John Doe',
    createdAt: new Date(),
    email: 'john@example.com',
    profilePicture: '/default-avatar.png',
    bio: 'Content creator and explorer',
    socialLinks: {
      website: 'https://example.com',
      twitter: 'https://twitter.com/john',
      linkedin: 'https://linkedin.com/in/john',
    },
    lastUpdated: new Date(),
  };

  // Mock follow state - replace with actual follow status check
  const isFollowing = !isOwnProfile; // For now, assume following if not own profile

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      // TODO: Implement actual follow/unfollow API call
      console.log('Follow/unfollow user:', username);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <ProfilePage
        user={userProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
      />
    </div>
  );
}
