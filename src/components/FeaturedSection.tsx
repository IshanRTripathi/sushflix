import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FeaturedProfile } from '../types/user';
import { userProfileService } from '../services/userProfileService';
import { logger } from '../utils/logger';
import LoadingSpinner from './LoadingSpinner';

const FeaturedSection: React.FC = () => {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProfiles = async () => {
      try {
        const featuredConfigs = await userProfileService.getFeaturedProfiles();
        const profilePromises = featuredConfigs.map(config => 
          userProfileService.getProfileByUsername(config.username)
        );
        const profileResults = await Promise.all(profilePromises);
        const validProfiles = profileResults.filter((profile): profile is FeaturedProfile => profile !== null);
        setProfiles(validProfiles);
      } catch (err) {
        setError('Failed to load featured profiles');
        logger.error('Error fetching featured profiles:', { error: err instanceof Error ? err.message : String(err) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProfiles();
  }, []);

  useEffect(() => {
    if (profiles.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [profiles.length]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (profiles.length === 0) {
    return <div className="text-gray-500 text-center p-4">No featured profiles available</div>;
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Creators</h2>
        <div className="relative">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <img
                src={currentProfile.profilePicture}
                alt={currentProfile.displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <Link to={`/${currentProfile.username}`} className="hover:underline">
                <h3 className="text-xl font-semibold text-gray-900">{currentProfile.displayName}</h3>
              </Link>
              <p className="text-gray-600">@{currentProfile.username}</p>
              <p className="mt-2 text-gray-700">{currentProfile.bio}</p>
              <div className="mt-4 flex space-x-4">
                {currentProfile.socialLinks.website && (
                  <a
                    href={currentProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Website
                  </a>
                )}
                {currentProfile.socialLinks.twitter && (
                  <a
                    href={currentProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Twitter
                  </a>
                )}
                {currentProfile.socialLinks.linkedin && (
                  <a
                    href={currentProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
          {profiles.length > 1 && (
            <div className="absolute bottom-0 right-0 flex space-x-2">
              {profiles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to profile ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedSection; 