import React, { useState, useEffect } from 'react';
import FeaturedCard from './FeaturedCard';
import { FeaturedProfile } from '../../types/user';

interface FeaturedProfilesSectionProps {
  profiles: FeaturedProfile[];
  isLoading: boolean;
  error: string | null;
}

const FeaturedProfilesSection: React.FC<FeaturedProfilesSectionProps> = ({
  profiles = [],
  isLoading = false,
  error = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getPositionClass = (index: number) => {
    switch (index) {
      case 0:
        return 'absolute left-0';
      case 1:
        return 'absolute left-1/2 transform -translate-x-1/2 scale-105';
      case 2:
        return 'absolute right-0';
      default:
        return '';
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [profiles]);

  const rotatingProfiles = profiles.length > 0 ? [
    profiles[(currentIndex + 0) % profiles.length],
    profiles[(currentIndex + 1) % profiles.length],
    profiles[(currentIndex + 2) % profiles.length]
  ] : [
    {
      profilePicture: '/default-avatar.png',
      username: 'Featured Creator',
      displayName: 'Popular Creator',
      bio: 'Featured creator on SushFlix',
      posts: 0,
      followers: 0,
      subscribers: 0
    }
  ];

  return (
    <div className="space-y-8">
      <section className="relative h-[500px] w-full my-12 overflow-hidden">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Creators</h2>
        <div className="relative h-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              Loading featured profiles...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-500">
              {error}
            </div>
          ) : rotatingProfiles.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No featured profiles available
            </div>
          ) : (
            rotatingProfiles.map((profile, index) => (
              <FeaturedCard
                key={index}
                profile={{
                  profilePicture: profile?.profilePicture || '/default-avatar.png',
                  username: profile?.username || profile?.displayName || 'Unknown User',
                  displayName: profile?.displayName || 'Anonymous Creator',
                  bio: profile?.bio || 'No bio available',
                  posts: profile?.posts || 0,
                  followers: profile?.followers || 0,
                  subscribers: profile?.subscribers || 0
                }}
                isHighlighted={index === 1}
                className={getPositionClass(index)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default FeaturedProfilesSection;
