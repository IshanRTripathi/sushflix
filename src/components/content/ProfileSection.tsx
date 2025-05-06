import { UserProfile } from '../../types/user';
import ProfilePictureUpload from '../profile/ProfilePictureUpload';
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Icons } from "@/components/icons"
import Link from "next/link"

interface ProfileSectionProps {
  user: UserProfile;
  isFollowing: boolean;
  onFollow: () => void;
  posts: number;
  followers: number;
  following: number;
}



const ProfileSection: React.FC<ProfileSectionProps> = ({ user, isFollowing, onFollow, posts, followers, following }) => {


  return (
    <div className="bg-black rounded-lg p-6">
      {/* Profile Header */}
      <Card variant="default" className="bg-black">
        <div className="flex flex-row items-center space-x-4 p-6">
          <div className="relative w-32 h-32">
            <ProfilePictureUpload
              currentImage={user.profilePicture || '/default-avatar.png'}
              onUploadSuccess={(newImageUrl) => {
                // Update the profile picture URL in the user object
                // This would typically be handled by your state management
                console.log('New profile picture URL:', newImageUrl);
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
            <p className="text-gray-400 mt-2">{user.bio || 'No bio yet'}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                variant={isFollowing ? "outline" : "primary"}
                onClick={onFollow}
                className="text-white"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
            <div className="flex justify-around border-t border-gray-800 pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{posts}</h3>
                <p className="text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{followers}</h3>
                <p className="text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{following}</h3>
                <p className="text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link
                href={user.socialLinks?.website || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.website className="w-4 h-4" />
                <span>Website</span>
              </Link>
              <Link
                href={user.socialLinks?.twitter || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.twitter className="w-4 h-4" />
                <span>Twitter</span>
              </Link>
              <Link
                href={user.socialLinks?.linkedin || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </Link>
              <Link
                href={user.socialLinks?.instagram || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.instagram className="w-4 h-4" />
                <span>Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="flex justify-around border-t border-gray-800 pt-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">{posts}</h3>
          <p className="text-gray-400">Posts</p>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">{followers}</h3>
          <p className="text-gray-400">Followers</p>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">{following}</h3>
          <p className="text-gray-400">Following</p>
        </div>
      </div>

      {/* Social Links */}
      {user.socialLinks && Object.entries(user.socialLinks).length > 0 && (
        <div className="mt-6">
          <h3 className="text-white mb-2">Social Links</h3>
          <div className="flex space-x-4">
            {user.socialLinks.website && (
              <a
                href={user.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Website
              </a>
            )}
            {user.socialLinks.twitter && (
              <a
                href={user.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Twitter
              </a>
            )}
            {user.socialLinks.linkedin && (
              <a
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
