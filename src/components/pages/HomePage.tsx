import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/index';
import ErrorBoundary from '../ui/ErrorBoundary';
import Loading from '../ui/Loading';
import { useLoadingState } from '../../contexts/LoadingStateContext';

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
  username: string;
  name: string;
  bio: string;
  profilePicture: string;
  displayOrder: number;
  isActive: boolean;
}

interface HomePageState {
  profile: UserProfile | null;
  featuredProfiles: FeaturedProfile[];
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

export function HomePage() {
  const [state, setState] = useState<HomePageState>({
    profile: null,
    featuredProfiles: [],
    isLoading: true,
    error: null,
    retryCount: 0,
    maxRetries: 3
  });

  const { setLoadingState } = useLoadingState();

  const fetchProfile = async () => {
    try {
      setLoadingState({ isLoading: true });
      const response = await fetch(`${API_BASE_URL}/api/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const userData = await response.json();
      console.log('Fetch Profile API response:', userData);
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
      setLoadingState({ isLoading: false });
    }
  };

  const fetchFeaturedProfiles = async () => {
    try {
      setLoadingState({ isLoading: true });
      const response = await fetch(`${API_BASE_URL}/api/profiles/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured profiles');
      }
      const data = await response.json();
      console.log('Featured profiles API response:', data);
      setState(prev => ({ ...prev, featuredProfiles: data.profiles || [] }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'An error occurred' }));
    } finally {
      setLoadingState({ isLoading: false });
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFeaturedProfiles();
  }, []);

  const handleRetry = () => {
    if (state.retryCount < state.maxRetries) {
      fetchProfile();
    }
  };

  if (state.error && state.retryCount >= state.maxRetries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold text-lg mb-2">Unable to load profile</h3>
          <p className="text-sm">Please try again later or contact support.</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow container mx-auto px-6 md:px-12 py-12">
          {state.isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loading size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-left">
                <div className="flex items-center mb-4 text-left">
                  <img src="/images/community_icons.png" alt="Community Icons" className="h-8 w-auto mr-4" />
                  <span className="text-gray-700 uppercase text-xs font-semibold tracking-widest text-left">
                    TRUSTED BY A DIVERSE COMMUNITY OF CREATORS
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                  Get paid to do what you love.
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                  Share your content on your own terms, and connect with your fans like never before.
                </p>
                <div className="flex space-x-4">
                  <Link
                    to="/signup?type=creator"
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition"
                  >
                    Become a Creator
                  </Link>
                  <Link
                    to="/signup?type=fan"
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition"
                  >
                    Sign up as a Fan
                  </Link>
                </div>
              </div>
              {/* Right: Profile Card */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={state.profile?.profilePicture || "/static/images/profile.jpeg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{state.featuredProfiles[0]?.username || "Loading..."}</div>
                      <div className="text-gray-600 text-sm">{state.featuredProfiles[0]?.bio || "Loading..."}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm sm:text-base">
                    <div>
                      <div className="font-bold">{state.profile?.posts || "0"}</div>
                      <div className="text-gray-600">posts</div>
                    </div>
                    <div>
                      <div className="font-bold">{state.profile?.followers || "0"}</div>
                      <div className="text-gray-600">followers</div>
                    </div>
                    <div>
                      <div className="font-bold">{state.profile?.subscribers || "0"}</div>
                      <div className="text-gray-600">subscribers</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition w-full">
                      Watch Video
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition w-full">
                      Message
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition w-full">
                      Send Tip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
