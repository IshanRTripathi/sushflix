import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, List, Users, Star } from 'lucide-react';
import { ContentCard } from '../content/ContentCard';
import { CreatorSubscriptionCard } from './CreatorSubscriptionCard';
import { useAuth } from '../auth/AuthContext';
import type { Creator, Content, SubscriptionLevel } from '../../types';

const DEFAULT_SUBSCRIPTION_LEVELS: SubscriptionLevel[] = [

  {
    level: 0,
    price: 0,
    name: "Free",
    description: "Basic access to creator's content",
    features: ['Access to public content', 'Like and comment', 'Follow creator updates']
  },
  {
    level: 1,
    price: 1.99,
    name: "Basic",
    description: "Enhanced access with exclusive content",
    features: [
      'All Free features',
      'Access to Level 1 exclusive content',
      'Early access to public content',
      'Monthly Q&A sessions'
    ]
  },
  {
    level: 2,
    price: 4.99,
    name: "Premium",
    description: "Premium access with additional perks",
    features: [
      'All Basic features',
      'Access to Level 2 exclusive content',
      'Direct messaging with creator',
      'Behind-the-scenes content',
      'Exclusive live streams'
    ]
  },
  {
    level: 3,
    price: 9.99,
    name: "VIP",
    description: "Ultimate access and exclusive benefits",
    features: [
      'All Premium features',
      'Access to ALL exclusive content',
      'Priority support',
      'Monthly virtual meetups',
      'Custom badge on comments',
      'Exclusive merchandise discounts'
    ]
  }
];


const fetchCreatorData = async (username: string | undefined): Promise<Creator> => {
  // Simulated API call to get creator data
  return new Promise((resolve, reject) => {
    try {
      const mockCreator: Creator = {
        id: '1',
        username: username || '',
        name: 'Sample Creator',
        email: 'creator@example.com',
        bio: 'Creating amazing content for you!',
        avatarUrl: 'https://source.unsplash.com/100x100/?portrait',
        coverUrl: 'https://source.unsplash.com/1200x400/?landscape',
        isCreator: true,
        subscriptionLevels: DEFAULT_SUBSCRIPTION_LEVELS,
        contentCount: 42,
        followerCount: 1000,
        subscriberCount: 500
      };
      resolve(mockCreator);
    } catch (error) {
      reject(error);
    }
  });
};
export function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const { isAuthenticated } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSubscribe = async (level: number) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    console.log(`Subscribing to level ${level}`);
    setShowSubscriptionModal(false);
  };

  useEffect(() => {
    fetchCreatorData(username).then(setCreator).catch(error => console.error('Error fetching creator data:', error));
  }, [username]);

  if (!creator) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Cover Image */}
        <div className="h-64 w-full relative">
          <img
            src={creator.coverUrl}
            alt={`${creator.name}'s cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* Profile Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:space-x-5">
                <div className="flex-shrink-0">
                  <img 
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="mx-auto h-20 w-20 rounded-full border-4 border-white"
                  />
                </div>
                <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {creator.name}
                  </h1>
                  <p className="text-sm font-medium text-gray-600">@{creator.username}</p>
                </div>
              </div>
              <div className="mt-5 flex justify-center sm:mt-0">
                <button 
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                  View Subscription Plans
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 text-gray-400"/>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {creator.followerCount.toLocaleString()} Followers
                </span>
              </div>
              <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
                <Star className="h-6 w-6 text-gray-400"/>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {creator.subscriberCount.toLocaleString()} Subscribers
                </span>
              </div>
              <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
                <Grid className="h-6 w-6 text-gray-400"/>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {creator.contentCount} Contents
              </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-gray-700">{creator.bio}</p>
            </div>
          </div>

          {/* Subscription Modal */}
          {showSubscriptionModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"> 
                  <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {creator.subscriptionLevels.map((level) => (
                          <CreatorSubscriptionCard
                              key={level.level}
                              level={level}
                              creatorName={creator.name}
                              currentLevel={currentLevel}
                              onSubscribe={handleSubscribe}
                          />
                      ))}
                  </div>
                <button 
                    onClick={() => setShowSubscriptionModal(false)}
                    className="mt-6 w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    Close
                  </button>
                </div>
              </div>
          )}
          
          {/* Content Grid */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Content</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                  <Grid className="h-5 w-5"/>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}>
              {[1, 2, 3].map((index) => ( // Sample content cards
                <ContentCard
                  key={index}
                  id={`${index}`}
                  thumbnail={`https://picsum.photos/id/237/200/300`}
                  creatorProfilePic={creator.avatarUrl || 'https://picsum.photos/id/237/200/300'}
                  creatorName={creator.name}
                  timestamp={`${index} days ago`}
                  caption={`Sample post ${index}`}
                  initialLikes={Math.floor(Math.random() * 1000)}
                  initialLiked={false}
                  isSubscribed={currentLevel >= 1}
                  onSubscribe={() => setShowSubscriptionModal(true)}
                  onClick={() => { }}
                  onComment={() => { }}
                  comments={[]}
                />
              ))} 
            </div>
          </div>
        </div>
      </div>
  );
}