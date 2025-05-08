import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ProfilePage from '../pages/ProfilePage';
import { UserProfile, USER_ROLES } from '../../types/user';
import { DEFAULT_IMAGES } from '../../config/images';

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
    id: '1',
    userId: '1',
    username: username || '',
    displayName: 'John Doe',
    createdAt: new Date(),
    email: 'john@example.com',
    profilePicture: DEFAULT_IMAGES.avatar,
    bio: 'Content creator and explorer',
    socialLinks: {
      instagram: 'https://instagram.com',
      website: 'https://example.com',
      twitter: 'https://twitter.com/john',
      youtube: 'https://youtube.com/john',
    },
    lastUpdated: new Date(),
    subscribers: 1000,
    posts: 50,
    role: USER_ROLES.USER,
    isCreator: false,
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
