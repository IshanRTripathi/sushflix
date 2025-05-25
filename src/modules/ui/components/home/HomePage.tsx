import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { apiClient } from '@/modules/shared/api/apiClient';
import { useTheme } from '@/modules/settings/hooks/useTheme';
import ErrorBoundary from '@/modules/ui/components/ErrorBoundary';
import { useLoadingContext } from '@/modules/ui/contexts/LoadingContext';
import { IUserProfile as UserProfile, IUserProfile as FeaturedProfile } from '@/modules/shared/types/user';
import Loading from '@/modules/ui/components/Loading';
import FeaturedProfilesSection from './FeaturedProfilesSection';
import { USER_ROLES } from '@/modules/shared/types/user/user.roles';
import { API_BASE_URL } from '@/modules/shared/config';

interface HomePageState {
  profile: UserProfile | null;
  profiles: FeaturedProfile[];
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

export const HomePage = () => {
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
    displayName: profile.displayName || profile.username,
    email: `${profile.username}@example.com`, // Placeholder email
    role: USER_ROLES.CREATOR,
    emailVerified: true,
    profilePicture: profile.profilePicture,
    bio: profile.bio || '',
    socialLinks: profile.socialLinks || {},
    isCreator: true,
    isVerified: false, // Default to not verified
    isFollowing: false,
    isSubscribed: false,
    stats: {
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      subscriberCount: 0,
    },
    preferences: {
      theme: 'system' as const,
      notifications: {
        email: true,
        push: true,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const { startLoading, stopLoading } = useLoadingContext();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      console.log('[HomePage] Not fetching profile - user is not authenticated');
      return;
    }

    try {
      startLoading();
      
      console.log('[HomePage] Fetching profile data...');
      const token = localStorage.getItem('token');
      console.log('[HomePage] Current token:', token ? 'Token exists' : 'No token found');
      
      const response = await apiClient.get('/api/profile');
      
      const userData = response.data;
      console.log('[HomePage] Profile data received:', userData);
      
      setState(prev => ({
        ...prev,
        profile: userData,
        isLoading: false,
        error: null,
        retryCount: 0
      }));
    } catch (err: unknown) {
      console.error('[HomePage] Error in fetchProfile:', err);
      
      // Handle different types of errors
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          retryCount: prev.retryCount + 1
        }));
        
        // If unauthorized, clear the token and redirect to login
        if (axiosError.response?.status === 401) {
          console.warn('[HomePage] Unauthorized - redirecting to login');
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          retryCount: prev.retryCount + 1
        }));
      }
    } finally {
      stopLoading();
    }
  };

  const fetchProfiles = async () => {
    try {
      startLoading();
      const response = await fetch(`${API_BASE_URL}/api/featured`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.status === 304) {
        // If we get a 304, use the current state
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch featured profiles');
      }
      
      const data = await response.json();
      const profiles = data.data?.profiles || [];
      
      setState(prev => ({ 
        ...prev, 
        profiles,
        error: null,
        retryCount: 0
      }));
    } catch (err) {
      console.error('Error fetching featured profiles:', err);
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to fetch featured profiles',
        retryCount: prev.retryCount + 1
      }));
    } finally {
      stopLoading();
    }
  };

  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch profile if user is authenticated
    if (isAuthenticated) {
      console.log('[HomePage] User is authenticated, fetching profile...');
      fetchProfile();
    } else {
      console.log('[HomePage] User is not authenticated, skipping profile fetch');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
    }
    
    // Fetch public profiles regardless of auth state
    fetchProfiles();
  }, [isAuthenticated]);

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
        rotatingProfiles: rotatingProfiles,
        error: prev.error
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
            <div className="flex items-center justify-center h-64">
              <Loading />
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
                        <button
                          onClick={() => {
                            if (isAuthenticated) {
                              navigate('/create-post');
                            } else {
                              openAuthModal('signup');
                            }
                          }}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-11 py-4 rounded-full font-medium 
                            hover:from-red-700 hover:to-red-800 transition-all duration-300"
                        >
                          {isAuthenticated ? 'Create Content' : 'Start Creating'}
                        </button>
                        <button
                          onClick={() => {
                            if (isAuthenticated) {
                              navigate('/explore');
                            } else {
                              openAuthModal('login');
                            }
                          }}
                          className={`bg-gradient-to-r from-red-0 to-red-100 px-10 py-4 rounded-full font-medium border transition-all duration-300 ${
                            isDark 
                              ? 'text-white border-gray-600 hover:bg-gray-700' 
                              : 'text-red-600 border-red-600 hover:bg-red-50'
                          }`}
                        >
                          {isAuthenticated ? 'Browse Creators' : 'Join as Fan'}
                        </button>
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
                error={state.error}
                isDark={isDark}
              />
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
