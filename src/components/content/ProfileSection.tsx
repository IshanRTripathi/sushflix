import { UserProfile } from '../../types/user';
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Icons } from "@/components/icons"

interface ProfileSectionProps {
  user: UserProfile;
  isFollowing: boolean;
  onFollow: () => void;
  posts: number;
  followers: number;
  following: number;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, isFollowing, onFollow, posts, followers, following }) => {
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = document.querySelector('img');
          if (img) {
            img.src = event.target.result as string;
          }
        }
      };
      reader.readAsDataURL(file);
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
            <label
              htmlFor="profilePictureInput"
              className="absolute bottom-0 right-0 p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors duration-200"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profilePictureInput"
                onChange={handleProfilePictureChange}
              />
              <Icons.cloudUpload className="text-white w-6 h-6" />
            </label>
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

          {user.socialLinks && Object.entries(user.socialLinks).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Social Links</h3>
              <div className="flex flex-wrap gap-4">
                {user.socialLinks.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  >
                    <Icons.twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  >
                    <Icons.linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                  >
                    <Icons.instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileSection;
