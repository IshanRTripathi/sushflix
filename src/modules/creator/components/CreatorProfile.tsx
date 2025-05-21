import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '@/modules/shared/utils/logger';
import { ContentCard } from './content/ContentCard';

interface Creator {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  isCreator: boolean;
  subscriptionLevels: SubscriptionLevel[];
  contentCount: number;
  followerCount: number;
  subscriberCount: number;
}

interface SubscriptionLevel {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  level: 0 | 1 | 2 | 3; // Only allow specific levels
}

export const SUBSCRIPTION_LEVELS: Record<number, SubscriptionLevel> = {
  0: {
    id: 'free',
    name: 'Free',
    description: 'Basic access to creator\'s content',
    price: 0,
    features: ['Access to public content', 'Like and comment', 'Follow creator updates'],
    level: 0,
  },
  1: {
    id: 'basic',
    name: 'Basic',
    description: 'Enhanced access with exclusive content',
    price: 1.99,
    features: [
      'All Free features',
      'Access to Level 1 exclusive content',
      'Early access to public content',
      'Monthly Q&A sessions',
    ],
    level: 1,
  },
  2: {
    id: 'premium',
    name: 'Premium',
    description: 'Premium access with additional perks',
    price: 4.99,
    features: [
      'All Basic features',
      'Access to Level 2 exclusive content',
      'Direct messaging with creator',
      'Monthly AMA sessions',
      'Exclusive live streams',
    ],
    level: 2,
  },
  3: {
    id: 'vip',
    name: 'VIP',
    description: 'Ultimate access and exclusive benefits',
    price: 9.99,
    features: [
      'All Premium features',
      'Access to ALL exclusive content',
      'Priority support',
      'Exclusive badges',
      'Custom badge on comments',
      'Exclusive merchandise discounts',
    ],
    level: 3,
  },
} as const;

/**
 * Fetch creator data from API
 * @param username Creator username
 * @returns Promise<Creator>
 */
const fetchCreatorData = async (username: string | undefined): Promise<Creator> => {
  try {
    const response = await fetch(`/api/creators/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch creator data');
    }
    const data = await response.json();
    return data as Creator;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch creator data';
    logger.error('Error fetching creator data:', {
      username,
      error: error as Error,
      errorMessage: errorMessage as string
    });
    throw error;
  }
};

export const CreatorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle subscription with proper error handling
  const handleSubscribe = useCallback(async (level: number) => {
    try {
      // Simulate subscription API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentLevel(level);
      logger.info(`Subscribed to level ${level}`);
    } catch (error) {
      logger.error('Subscription failed:', {
      error: error as Error,
      level
    });
      setError('Failed to subscribe. Please try again.');
    }
  }, []);

  // Fetch creator data with proper error handling
  useEffect(() => {
    let isMounted = true;

    const fetchAndSetCreator = async () => {
      try {
        if (!username) {
          throw new Error('Username is required');
        }

        const data = await fetchCreatorData(username);
        if (isMounted) {
          setCreator(data);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch creator data';
        logger.error('Failed to fetch creator data', {
          username,
          error: error as Error,
          errorMessage,
        });
        if (isMounted) {
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAndSetCreator();

    return () => {
      isMounted = false;
    };
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchCreatorData(username)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:space-x-5">
                <div className="flex-shrink-0">
                  <img
                    src={creator?.avatarUrl || ''}
                    alt={creator?.name || ''}
                    className="mx-auto h-20 w-20 rounded-full border-4 border-white"
                  />
                </div>
                <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {creator?.name}
                  </h1>
                  <p className="text-sm font-medium text-gray-600">@{creator?.username}</p>
                </div>
              </div>
              <div className="mt-5 flex justify-center sm:mt-0">
                <button
                  onClick={() => handleSubscribe(1)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Subscribe
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {creator?.followerCount?.toLocaleString()} Followers
                </span>
              </div>
              <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {creator?.subscriberCount?.toLocaleString()} Subscribers
                </span>
              </div>
              <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {creator?.contentCount} Contents
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-gray-700">{creator?.bio}</p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Content</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((index) => ( // Sample content cards
                <ContentCard
                  key={index}
                  id={`${index}`}
                  thumbnail={`https://picsum.photos/id/${index}/200/300`}
                  creatorProfilePic={creator?.avatarUrl || ''}
                  creatorName={creator?.name || ''}
                  timestamp={new Date().toLocaleDateString()}
                  caption={`Sample Content ${index}`}
                  isSubscribed={currentLevel > 0}
                  onSubscribe={() => handleSubscribe(currentLevel)}
                  onClick={() => navigate(`/content/${index}`)}
                  initialLikes={Math.floor(Math.random() * 100)}
                  onComment={async () => { logger.info('Comment added'); }}
                  initialLiked={Math.random() > 0.5}
                  comments={[
                    {
                      username: 'sample_user',
                      text: 'Great content!',
                      timestamp: new Date().toLocaleDateString(),
                      userId: '1',
                      id: '1'
                    }
                  ]}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};