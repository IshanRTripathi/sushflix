import React, { useEffect, useState } from 'react';
import FeaturedCard from './FeaturedCard';
import { motion } from 'framer-motion';
import { UserProfile } from '@/modules/shared/types/user';
import LoadingSpinner from '@/modules/ui/components/feedback/LoadingSpinner';

interface FeaturedProfilesSectionProps {
  profiles: UserProfile[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
}

const FeaturedProfilesSection: React.FC<FeaturedProfilesSectionProps> = ({ 
  profiles, 
  isLoading = false, 
  error = null,
  isDark = false 
}) => {
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
      <div className={`h-[400px] flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <LoadingSpinner color={isDark ? 'secondary' : 'gray'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative h-[500px] overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <div className="relative h-[400px]">
              <p className={`text-center px-4 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {error}
              </p>
            </div>
          </div>
        </div>
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
