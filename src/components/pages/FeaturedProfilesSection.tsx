import React, { useEffect, useState } from 'react';
import FeaturedCard from './FeaturedCard';
import { motion } from 'framer-motion';
import { UserProfile } from '../../types/user';
import LoadingSpinner from '../common/LoadingSpinner';

interface FeaturedProfilesSectionProps {
  profiles: UserProfile[];
  isLoading?: boolean;
  error?: string;
}

const FeaturedProfilesSection: React.FC<FeaturedProfilesSectionProps> = ({ profiles, isLoading = false, error = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [profiles.length]);

  const getPosition = (index: number) => {
    const leftIndex = (currentIndex - 1 + profiles.length) % profiles.length;
    const rightIndex = (currentIndex + 1) % profiles.length;

    if (index === currentIndex) return 'center';
    if (index === leftIndex) return 'left';
    if (index === rightIndex) return 'right';
    return 'hidden';
  };

  const handleButtonClick = (username: string, action: string) => {
    console.log(`Button "${action}" clicked on ${username}'s card`);
    // You can also trigger analytics/events here
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        <p>No featured profiles available</p>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center h-[400px] overflow-hidden">
      {profiles.map((profile, index) => {
        if (!profile || !profile.profilePicture || !profile.username) return null;
        const position = getPosition(index);
        if (position === 'hidden') return null;

        let x = 0, scale = 1, zIndex = 1, opacity = 1;
        if (position === 'left') { x = -300; scale = 0.8; zIndex = 0; opacity = 0.8; }
        else if (position === 'right') { x = 300; scale = 0.8; zIndex = 0; opacity = 0.8; }

        return (
          <motion.div
            key={index}
            className="absolute"
            animate={{ x, scale, opacity, zIndex }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <FeaturedCard
              profile={{
                ...profile,
                profilePicture: profile.profilePicture || '',
                username: profile.username || '',
                bio: profile.bio || '',
                posts: profile.posts || 0,
                followers: profile.followers || 0,
                subscribers: profile.subscribers || 0
              }}
              isHighlighted={position === 'center'}
              onButtonClick={handleButtonClick}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FeaturedProfilesSection;
