import React, { useCallback } from 'react';
import { UserProfile } from '../../types/user';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/icons";
import ProfilePictureUpload from '../profile/ProfilePictureUpload';
import { logger } from '../../utils/logger';
import { Skeleton } from '@mui/material';

/**
 * Interface for social media links
 * @interface SocialLinks
 */
interface SocialLinks {
  twitter?: string;
  youtube?: string;
  instagram?: string;
}

/**
 * Props interface for ProfileSection component
 * @interface ProfileSectionProps
 */
interface ProfileSectionProps {
  user: UserProfile & { 
    socialLinks?: SocialLinks;
    id: string;
  };
  isFollowing: boolean;
  onFollow: () => void;
  posts: number;
  followers: number;
  following: number;
  onProfilePictureUpdate?: (newImageUrl: string) => void;
}

/**
 * ProfileSection component for displaying user profile information
 * @param {ProfileSectionProps} props - Component props
 * @returns {ReactNode}
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isFollowing,
  onFollow,
  posts,
  followers,
  following,
  onProfilePictureUpdate,
}) => {

  // Handle profile picture upload with proper error handling
  const handleUploadSuccess = useCallback((newImageUrl: string) => {
    logger.info('Profile picture upload success', { userId: user.id });
    
    try {
      // if (onProfilePictureUpdate) {
      //   onProfilePictureUpdate(newImageUrl);
      // }
      
      // Update the local preview
      const img = document.querySelector<HTMLImageElement>('img');
      if (img) {
        img.src = newImageUrl;
      }
    } catch (error) {
      logger.error('Error updating profile picture preview', { error, userId: user.id });
      throw error;
    }
  }, [onProfilePictureUpdate, user.id]);

  return (
    <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
      <Card className="bg-black text-white">
        <div className="p-6 pb-0 flex flex-col items-center">
          <div className="relative" role="img" aria-label="User profile picture">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.displayName || 'Profile'}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '';
                  return (
                    <Skeleton
                      variant="circular"
                      width={96}
                      height={96}
                    />
                  );
                }}
                loading="lazy"
                width={96}
                height={96}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <ProfilePictureUpload
              username={user.username || 'default'}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold" aria-label="User display name">{user.displayName}</h2>
            <p className="text-sm text-gray-400" aria-label="User username">@{user.username}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-center text-gray-400 mb-6" aria-label="User bio">
            {user.bio || 'No bio yet'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6" role="list" aria-label="User statistics">
            <div className="flex flex-col items-center" role="listitem">
              <span className="text-3xl font-bold" aria-label="Number of posts">{posts}</span>
              <span className="text-sm text-gray-400">Posts</span>
            </div>
            <div className="flex flex-col items-center" role="listitem">
              <span className="text-3xl font-bold" aria-label="Number of followers">{followers}</span>
              <span className="text-sm text-gray-400">Followers</span>
            </div>
            <div className="flex flex-col items-center" role="listitem">
              <span className="text-3xl font-bold" aria-label="Number of following">{following}</span>
              <span className="text-sm text-gray-400">Following</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={isFollowing ? "outline" : "primary"}
              onClick={onFollow}
              className="text-white"
              aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2" aria-label="Social links section">Social Links</h3>
            <div className="flex flex-wrap gap-4">
              {user.socialLinks?.twitter && (
                <a
                  href={user.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  aria-label="User's Twitter profile"
                >
                  <Icons.twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
              {user.socialLinks?.youtube && (
                <a
                  href={user.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  aria-label="User's YouTube channel"
                >
                  <Icons.youtube className="w-4 h-4" />
                  YouTube
                </a>
              )}
              {user.socialLinks?.instagram && (
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  aria-label="User's Instagram profile"
                >
                  <Icons.instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSection;
