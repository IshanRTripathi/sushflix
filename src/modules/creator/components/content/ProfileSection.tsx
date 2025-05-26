import React, { useCallback, useState } from 'react';
import { UserProfile, PartialProfileUpdate } from '@/modules/shared/types/user';
import Card from "@/modules/ui/components/Card";
import Button from "@/modules/ui/components/Button";
import { Icons } from "@/modules/ui/components/icons";
import { ProfilePictureUpload } from '@/modules/profile/components/profileLayout/ProfilePictureUpload';
import { logger } from '@/modules/shared/utils/logger';
import Loading from '@/modules/ui/components/Loading';
import { Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Button as MuiButton } from '@mui/material';


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
  user: UserProfile;
  isFollowing: boolean;
  isOwner: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  posts: number;
  followers: number;
  following: number;
  onProfileUpdate?: (updatedUser: UserProfile) => void;
}

/**
 * ProfileSection component for displaying user profile information
 * @param {ProfileSectionProps} props - Component props
 * @returns {ReactNode}
 */
const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isFollowing,
  isOwner,
  onFollow,
  onUnfollow,
  posts,
  followers,
  following,
  onProfileUpdate,
}) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = useCallback(async (updates: PartialProfileUpdate) => {
    try {
      setIsLoading(true);
      setError(null);
      logger.info('Profile picture upload success', { username: user.username, updates });
      
      if (onProfileUpdate) {
        await onProfileUpdate({
          ...user,
          profilePicture: updates.profilePicture,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      logger.error('Error updating profile picture', { error, username: user.username });
      setError('Failed to update profile picture. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, onProfileUpdate]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
        <Card className="bg-black text-white">
          <div className="p-6">
            <Loading showSpinner={true} />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
        <Card className="bg-black text-white">
          <div className="p-6">
            <Alert
              severity="error"
              onClose={() => setError(null)}
              className="text-white bg-red-500"
            >
              {error}
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto" role="region" aria-label="User profile section">
      <Card className="bg-black text-white">
        <div className="p-6 pb-0 flex flex-col items-center">
          <div className="relative w-24 h-24" role="img" aria-label="User profile picture">
            <div className="w-full h-full rounded-full overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '';
                    img.style.display = 'none';
                  }}
                  loading="lazy"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 -translate-x-1/2 -translate-y-1/2">
              <ProfilePictureUpload
                username={user.username!}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold" aria-label="User display name">{user.displayName}</h2>
            <p className="text-sm text-gray-400" aria-label="User username">@{user.username}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-center text-gray-400 mb-6" aria-label="User bio">
            {user.bio || 'I am a funny guy!'}
          </p>

          <div className="flex justify-end mb-4">
            {!isOwner && onFollow && onUnfollow && (
              <LoadingButton
                variant="contained"
                onClick={isFollowing ? onUnfollow : onFollow}
                loading={false}
                color={isFollowing ? "error" : "primary"}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </LoadingButton>
            )}
            {isOwner && (
              <MuiButton
                variant="outlined"
                onClick={() => navigate(`/profile/${user.username}/edit`)}
                startIcon={<EditIcon />}
                color="primary"
              >
                Edit Profile
              </MuiButton>
            )}
          </div>

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
            {user.socialLinks && (
              <div className="flex justify-center gap-4">
                {user.socialLinks.twitter && (
                  <a
                    href={`https://twitter.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                    aria-label="Twitter"
                  >
                    <Icons.twitter className="w-6 h-6" />
                  </a>
                )}
                {user.socialLinks.youtube && (
                  <a
                    href={`https://youtube.com/${user.socialLinks.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300"
                    aria-label="YouTube"
                  >
                    <Icons.youtube className="w-6 h-6" />
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${user.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                    aria-label="Instagram"
                  >
                    <Icons.instagram className="w-6 h-6" />
                  </a>
                )}
              </div>
            )}
          </div>

          {user.isCreator && (
            <div className="mt-4 text-center">
              <span className="text-blue-400 font-semibold">Creator</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileSection;
