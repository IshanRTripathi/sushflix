import React from "react";

type FeaturedCardProps = {
  profile: {
    profilePicture: string;
    username: string;
    bio: string;
    posts: number;
    followers: number;
    subscribers: number;
  };
  isHighlighted: boolean;
  className?: string;
};

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  profile,
  isHighlighted,
  className = "",
}) => {
  return (
    <div
      className={`transition-all duration-700 ease-in-out transform ${className} ${
        isHighlighted ? "scale-105 z-20 shadow-xl" : "scale-90 z-10 shadow-md"
      } bg-white rounded-2xl overflow-hidden`}
    >
      <div className="p-6 w-[300px]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              src={profile.profilePicture}
              alt={`${profile.username} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile.username}</h3>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
          <div>
            <div className="font-bold">{profile.posts}</div>
            <div className="text-gray-600">Posts</div>
          </div>
          <div>
            <div className="font-bold">{profile.followers}</div>
            <div className="text-gray-600">Followers</div>
          </div>
          <div>
            <div className="font-bold">{profile.subscribers}</div>
            <div className="text-gray-600">Subscribers</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
            Watch Video
          </button>
          <button className="w-full border border-red-600 text-red-600 py-2 rounded-md hover:bg-red-50 transition">
            Message
          </button>
          <button className="w-full border border-red-600 text-red-600 py-2 rounded-md hover:bg-red-50 transition">
            Send Tip
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
