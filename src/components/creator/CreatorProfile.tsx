import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, List, Users, Star } from 'lucide-react';
import { ContentCard } from '../content/ContentCard';
import { useAuth } from '../auth/AuthContext';

interface Creator {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  subscriberCount: number;
  contentCount: number;
  rating: number;
}

interface Content {
  id: string;
  thumbnail: string;
  title: string;
  isExclusive: boolean;
  likes: number;
  duration?: string;
}

export function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const { isAuthenticated } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const [creatorResponse, contentResponse, subscriptionResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/creators/${username}`),
          fetch(`http://localhost:5000/api/creators/${username}/content`),
          isAuthenticated
            ? fetch(`http://localhost:5000/api/creators/${username}/subscription-status`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
            : Promise.resolve({ ok: true, json: () => ({ isSubscribed: false }) })
        ]);

        if (!creatorResponse.ok || !contentResponse.ok) {
          throw new Error('Failed to fetch creator data');
        }

        const [creatorData, contentData, subscriptionData] = await Promise.all([
          creatorResponse.json(),
          contentResponse.json(),
          subscriptionResponse.json()
        ]);

        setCreator(creatorData);
        setContents(contentData);
        setIsSubscribed(subscriptionData.isSubscribed);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      }
    };

    fetchCreatorData();
  }, [username, isAuthenticated]);

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
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isSubscribed
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                disabled={isSubscribed}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-gray-400" />
              <span className="ml-3 text-lg font-medium text-gray-900">
                {creator.subscriberCount.toLocaleString()} Subscribers
              </span>
            </div>
            <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
              <Grid className="h-6 w-6 text-gray-400" />
              <span className="ml-3 text-lg font-medium text-gray-900">
                {creator.contentCount} Contents
              </span>
            </div>
            <div className="flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg">
              <Star className="h-6 w-6 text-gray-400" />
              <span className="ml-3 text-lg font-medium text-gray-900">
                {creator.rating.toFixed(1)} Rating
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-700 whitespace-pre-line">{creator.bio}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Content</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {contents.map((content) => (
              <ContentCard
                  creatorProfilePic={''} timestamp={''} caption={''} initialLikes={0} onComment={function (): void {
                throw new Error('Function not implemented.');
              }} initialLiked={false} comments={[]} key={content.id}
                  {...content}
                  creatorName={creator.name}
                  isSubscribed={isSubscribed}
                  onSubscribe={() => {
                  }}
                  onClick={() => {
                  }}              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}