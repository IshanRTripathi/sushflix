import { UserProfile } from '../../types/user';
import ProfilePictureUpload from '../profile/ProfilePictureUpload';

interface ProfileSectionProps {
  user: UserProfile;
  isFollowing: boolean;
  onFollow: () => void;
  posts: number;
  followers: number;
  following: number;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, isFollowing, onFollow, posts, followers, following }) => {
  const handleOpen = () => {
    // Handle opening the file picker
  };

  return (
    <div className="bg-black rounded-lg p-6">
      {/* Profile Header */}
      <div className="flex items-center mb-6">
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
        <div className="ml-6">
          <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
          <p className="text-gray-400 mt-2">{user.bio || 'No bio yet'}</p>
          <div className="mt-4">
            <button
              onClick={onFollow}
              className={`px-6 py-2 rounded-full ${
                isFollowing ? 'bg-gray-600' : 'bg-red-600'
              } text-white text-sm`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

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
