import React from 'react';
import { motion } from 'framer-motion';

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
  onButtonClick: (username: string, action: string) => void;
};

const FeaturedCard: React.FC<FeaturedCardProps> = ({ profile, isHighlighted, onButtonClick }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-lg w-[300px] p-6"
      whileHover={{ scale: 1.05 }}
    >
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
        <div><div className="font-bold">{profile.posts}</div><div className="text-gray-600">Posts</div></div>
        <div><div className="font-bold">{profile.followers}</div><div className="text-gray-600">Followers</div></div>
        <div><div className="font-bold">{profile.subscribers}</div><div className="text-gray-600">Subscribers</div></div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          className="w-full bg-red-800 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center"
          onClick={() => onButtonClick(profile.username, 'Watch Video')}
        >
          Watch Video
        </button>
        <button
          className="w-full bg-white text-gray-800 py-3 px-4 rounded-xl font-medium flex items-center justify-center border"
          onClick={() => onButtonClick(profile.username, 'Message')}
        >
          Message
        </button>
        <button
          className="w-full bg-white text-gray-800 py-3 px-4 rounded-xl font-medium flex items-center justify-center border"
          onClick={() => onButtonClick(profile.username, 'Send Tip')}
        >
          Send Tip
        </button>
      </div>
    </motion.div>
  );
};

export default FeaturedCard;
