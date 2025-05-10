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
        <div className="flex flex-col gap-3">
          <button className="w-full bg-red-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-300 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch Video
          </button>
          <button className="w-full bg-white text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
          <button className="w-full bg-white text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Send Tip
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
