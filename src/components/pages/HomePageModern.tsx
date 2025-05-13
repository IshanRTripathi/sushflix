import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, useTheme } from '../../config/index';
import ErrorBoundary from '../ui/ErrorBoundary';
import Loading from '../ui/Loading';
import FeaturedProfilesSection from './FeaturedProfilesSection';
import { useLoadingContext } from '../../contexts/LoadingContextV2';
import { USER_ROLES, UserPreferences } from '../../types/user';

interface UserProfile {
  username: string;
  email: string;
  posts: number;
  subscribers: number;
  profilePicture?: string;
  name?: string;
  bio?: string;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
}

interface FeaturedProfile {
  userId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  bio: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

interface HomePageState {
  profile: UserProfile | null;
  profiles: FeaturedProfile[];
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

export const HomePageModern = () => {
  const [state, setState] = useState<HomePageState>({
    profile: null,
    profiles: [],
    isLoading: true,
    error: null,
    retryCount: 0,
    maxRetries: 3
  });

  // Map FeaturedProfile to UserProfile for the FeaturedProfilesSection
  const mappedProfiles = state.profiles.map(profile => ({
    id: profile.userId,
    userId: profile.userId,
    username: profile.username,
    displayName: profile.displayName,
    email: `${profile.username}@example.com`, // Placeholder email
    role: USER_ROLES.USER,
    emailVerified: true,
    profilePicture: profile.profilePicture,
    coverPhoto: '', // Default empty cover photo
    bio: profile.bio,
    socialLinks: profile.socialLinks,
    isCreator: true,
    isVerified: false, // Default to not verified
    isFollowing: false,
    isSubscribed: false,
    stats: {
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      subscriberCount: 0
    },
    preferences: {
      theme: 'system' as const,
      notifications: {
        email: true,
        push: true
      }
    } as UserPreferences,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const { startLoading, stopLoading } = useLoadingContext();

  const fetchProfile = async () => {
    try {
      startLoading();
      const response = await fetch(`${API_BASE_URL}/api/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const userData = await response.json();
      setState(prev => ({
        ...prev,
        profile: userData,
        isLoading: false,
        error: null,
        retryCount: 0
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        retryCount: prev.retryCount + 1
      }));
    } finally {
      stopLoading();
    }
  };

  const fetchProfiles = async () => {
    try {
      startLoading();
      const response = await fetch(`${API_BASE_URL}/api/profiles/featured`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.status === 304) {
        // If we get a 304, use the current state
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured profiles');
      }
      
      const data = await response.json();
      // The API returns an object with a 'profiles' property containing the array
      const profiles = data.profiles || [];
      setState(prev => ({ 
        ...prev, 
        profiles: profiles, 
        error: null,
        retryCount: 0
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to fetch featured profiles',
        retryCount: prev.retryCount + 1
      }));
    } finally {
      stopLoading();
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchProfile();
    fetchProfiles();
  }, []);

  useEffect(() => {
    const interval = setInterval(rotateProfiles, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.profiles.length > 0) {
      const rotatingProfiles = [
        state.profiles[(currentIndex + 0) % state.profiles.length],
        state.profiles[(currentIndex + 1) % state.profiles.length],
        state.profiles[(currentIndex + 2) % state.profiles.length]
      ];
      setState(prev => ({
        ...prev,
        profiles: prev.profiles,
        rotatingProfiles: rotatingProfiles
      }));
    }
  }, [state.profiles, currentIndex]);

  const rotateProfiles = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % state.profiles.length);
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
          : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        <main className="container mx-auto px-6 md:px-12 py-12">
          {state.isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loading size={40} />
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className={`relative overflow-hidden rounded-2xl shadow-xl mb-12 transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 ${
                  isDark ? 'opacity-5' : 'opacity-10'
                }`} />
                <div className="relative p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center mb-6">
                        <img 
                          src="\static\images\community-icon.png" 
                          alt="Community Icons" 
                          className="h-8 w-auto mr-4" 
                        />
                        <span className={`uppercase text-xs font-semibold tracking-widest ${
                          isDark ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          TRUSTED BY A DIVERSE COMMUNITY OF CREATORS
                        </span>
                      </div>
                      <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Create. Share. Earn.
                      </h1>
                      <p className={`text-xl mb-8 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Join our community of creators and start earning from your content today.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Link
                          to="/signup?type=creator"
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-medium 
                            hover:from-red-700 hover:to-red-800 transition-all duration-300"
                        >
                          Start Creating
                        </Link>
                        <Link
                          to="/signup?type=fan"
                          className={`px-8 py-4 rounded-full font-medium border transition-all duration-300 ${
                            isDark 
                              ? 'text-white border-gray-600 hover:bg-gray-700' 
                              : 'text-red-600 border-red-600 hover:bg-red-50'
                          }`}
                        >
                          Join as Fan
                        </Link>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <img
                        src="\static\images\instagram-post.png"
                        alt="Content Creation Illustration"
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Creators Section */}
              <FeaturedProfilesSection
                profiles={mappedProfiles}
                isLoading={state.isLoading}
                error={state.error || undefined}
              />
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default HomePageModern;
