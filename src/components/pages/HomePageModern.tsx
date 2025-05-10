import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/index';
import ErrorBoundary from '../ui/ErrorBoundary';
import Loading from '../ui/Loading';
import { useLoadingState } from '../../contexts/LoadingStateContext';
import { Button } from '@mui/material';

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

export function HomePageModern() {
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <main className="container mx-auto px-6 md:px-12 py-12">
          {state.isLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loading size={40} />
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-10" />
                <div className="relative p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center mb-6">
                        <img src="/images/community_icons.png" alt="Community Icons" className="h-8 w-auto mr-4" />
                        <span className="text-gray-700 uppercase text-xs font-semibold tracking-widest">
                          TRUSTED BY A DIVERSE COMMUNITY OF CREATORS
                        </span>
                      </div>
                      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        Create. Share. Earn.
                      </h1>
                      <p className="text-xl text-gray-600 mb-8">
                        Join our community of creators and start earning from your content today.
                      </p>
                      <div className="flex gap-4">
                        <Link
                          to="/signup?type=creator"
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition duration-300"
                        >
                          Start Creating
                        </Link>
                        <Link
                          to="/signup?type=fan"
                          className="bg-white text-red-600 border border-red-600 px-8 py-4 rounded-full font-medium hover:bg-red-50 transition duration-300"
                        >
                          Join as Fan
                        </Link>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <img
                        src="/images/hero-illustration.svg"
                        alt="Content Creation Illustration"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Creators Section */}
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Creators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.featuredProfiles.map((profile, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                    >
                      <div className="p-6">
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
                            <div className="font-bold">{state.profile?.posts || "0"}</div>
                            <div className="text-gray-600">Posts</div>
                          </div>
                          <div>
                            <div className="font-bold">{state.profile?.followers || "0"}</div>
                            <div className="text-gray-600">Followers</div>
                          </div>
                          <div>
                            <div className="font-bold">{state.profile?.subscribers || "0"}</div>
                            <div className="text-gray-600">Subscribers</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button className="w-full">
                            Watch Video
                          </Button>
                          <Button className="w-full">
                            Message
                          </Button>
                          <Button className="w-full">
                            Send Tip
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
