import { UserProfile } from '../../types/user';
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Icons } from "@/components/icons"
import ProfilePictureUpload from '../profile/ProfilePictureUpload'

interface ProfileSectionProps {
  user: UserProfile;
  isFollowing: boolean;
  onFollow: () => void;
  posts: number;
  followers: number;
  following: number;
  onProfilePictureUpdate?: (newImageUrl: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, isFollowing, onFollow, posts, followers, following, onProfilePictureUpdate }) => {


  const handleUploadSuccess = (newImageUrl: string) => {
    if (onProfilePictureUpdate) {
      onProfilePictureUpdate(newImageUrl);
    }
    // Update the local preview
    const img = document.querySelector<HTMLImageElement>('img');
    if (img) {
      try {
        img.src = newImageUrl;
      } catch (error) {
        console.error('Error updating profile picture preview:', error);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-black text-white">
        <div className="p-6 pb-0 flex flex-col items-center">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.displayName || 'Profile'}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <ProfilePictureUpload
              currentImage={user.profilePicture || ''}
              username={user.username || 'default'}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-center text-gray-400 mb-6">{user.bio || 'No bio yet'}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{posts}</span>
              <span className="text-sm text-gray-400">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{followers}</span>
              <span className="text-sm text-gray-400">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{following}</span>
              <span className="text-sm text-gray-400">Following</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={isFollowing ? "outline" : "primary"}
              onClick={onFollow}
              className="text-white"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Social Links</h3>
            <div className="flex flex-wrap gap-4">
              <a
                href={user.socialLinks?.twitter || 'https://twitter.com/username'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.twitter className="w-4 h-4" />
                Twitter
              </a>
              <a
                href={user.socialLinks?.youtube || 'https://youtube.com/@username'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href={user.socialLinks?.instagram || 'https://instagram.com/username'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                <Icons.instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSection;
