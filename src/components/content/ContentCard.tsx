import React from 'react';
import { Play, Lock, Heart } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface ContentCardProps {
  id: string;
  thumbnail: string;
  title: string;
  creatorName: string;
  isExclusive: boolean;
  likes: number;
  duration?: string;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onClick: () => void;
}

export function ContentCard({
  thumbnail,
  title,
  creatorName,
  isExclusive,
  likes,
  duration,
  isSubscribed,
  onSubscribe,
  onClick
}: ContentCardProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div 
        className="relative aspect-video cursor-pointer"
        onClick={onClick}
      >
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
            {duration}
          </div>
        )}
        {isExclusive && !isSubscribed && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
          <button 
            className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Like content"
          >
            <Heart className="w-5 h-5" />
            <span className="ml-1 text-sm">{likes}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <a 
            href={`/creator/${creatorName}`}
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            {creatorName}
          </a>
          
          {isExclusive && !isSubscribed && (
            <button
              onClick={isAuthenticated ? onSubscribe : () => window.location.href = '/login'}
              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Subscribe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}