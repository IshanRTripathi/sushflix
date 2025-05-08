import React from 'react';
import { ContentCard } from './components/ContentCard';
import { Avatar, Skeleton } from '@mui/material';
import { Comment } from './components/types';

/**
 * Interface for content posts
 * @interface Post
 */
interface Post {
  id: string;
  thumbnail: string;
  creatorProfilePic: string;
  creatorName: string;
  timestamp: string;
  caption: string;
  initialLikes: number;
  initialLiked: boolean;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onClick: () => void;
  onComment: (text: string) => Promise<void>;
  comments: Comment[];
}

/**
 * Props interface for ExplorePage
 * @interface ExplorePageProps
 */
interface ExplorePageProps {
  posts?: Post[];
  onPostClick?: (postId: string) => void;
  onSubscribe?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
}

// Constants for placeholder data
const DEFAULT_AVATAR = 'https://mui.com/static/images/avatar/1.jpg';
const DEFAULT_THUMBNAIL = 'https://mui.com/static/images/cards/contemplative-reptile.jpg';

/**
 * Default post data for development
 * @constant DEFAULT_POSTS
 */
const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800',
    creatorProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100',
    creatorName: 'John Doe',
    timestamp: '2 hours ago',
    caption: 'Beautiful sunset at the beach',
    initialLikes: 10,
    initialLiked: false,
    isSubscribed: false,
    onSubscribe: () => {},
    onClick: () => {},
    onComment: async (text: string) => {},
    comments: [
      {
        id: 'c1',
        text: 'Amazing photo!',
        userId: 'u1',
        username: 'user1',
        timestamp: '1 hour ago'
      },
      {
        id: 'c2',
        text: 'Love the colors!',
        userId: 'u2',
        username: 'user2',
        timestamp: '1 hour ago'
      }
    ]
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800',
    creatorProfilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100',
    creatorName: 'Jane Smith',
    timestamp: '3 hours ago',
    caption: 'City skyline at night',
    initialLikes: 15,
    initialLiked: true,
    isSubscribed: true,
    onSubscribe: () => {},
    onClick: () => {},
    onComment: async (text: string) => {},
    comments: [
      {
        id: 'c3',
        text: 'Stunning view!',
        userId: 'u3',
        username: 'user3',
        timestamp: '2 hours ago'
      }
    ]
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800',
    creatorProfilePic: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100',
    creatorName: 'Chris Johnson',
    timestamp: '1 day ago',
    caption: 'Mountain landscape',
    initialLikes: 25,
    initialLiked: false,
    isSubscribed: false,
    onSubscribe: () => {},
    onClick: () => {},
    onComment: async (text: string) => {},
    comments: []
  }
];

/**
 * ExplorePage component for displaying content posts
 * @param {ExplorePageProps} props - Component props
 * @returns {ReactNode}
 */
export const ExplorePage: React.FC<ExplorePageProps> = ({
  posts = DEFAULT_POSTS,
  onPostClick = () => {},
  onSubscribe = () => {},
  onComment = () => {},
}: ExplorePageProps) => {
  // Validate posts array
  if (!Array.isArray(posts)) {
    console.error('Invalid posts data provided to ExplorePage');
    return null;
  }

  return (
    <div className="flex flex-col items-center py-4" role="main" aria-label="Explore page content">
      {posts.map((post) => (
        <ContentCard
          key={post.id}
          id={post.id}
          thumbnail={post.thumbnail}
          creatorProfilePic={post.creatorProfilePic}
          creatorName={post.creatorName}
          timestamp={post.timestamp}
          caption={post.caption}
          initialLikes={post.initialLikes}
          initialLiked={post.initialLiked}
          isSubscribed={post.isSubscribed}
          onSubscribe={() => {
            onSubscribe(post.id);
            post.onSubscribe();
          }}
          onClick={() => {
            onPostClick(post.id);
            post.onClick();
          }}
          onComment={post.onComment}
          comments={post.comments}
          aria-label={`Post by ${post.creatorName}`}
        />
      ))}
    </div>
  );
};