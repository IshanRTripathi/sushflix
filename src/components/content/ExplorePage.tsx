import React from 'react';
import { ContentCard, Comment as ContentCardComment } from './ContentCard'; // Ensure the correct path

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
  onComment: () => void;
  comments: ContentCardComment[];
}

/**
 * Props interface for ExplorePage
 * @interface ExplorePageProps
 */
interface ExplorePageProps {
  posts?: Post[];
  onPostClick?: (postId: string) => void;
  onSubscribe?: (postId: string) => void;
  onComment?: (postId: string, comment: ContentCardComment) => void;
}

// Constants for placeholder data
const PLACEHOLDER_BASE_URL = 'https://via.placeholder.com' as const;

/**
 * ExplorePage component props interface
 * @interface ExplorePageProps
 */
interface ExplorePageProps {
  posts?: Post[];
  onPostClick?: (postId: string) => void;
  onSubscribe?: (postId: string) => void;
  onComment?: (postId: string, comment: ContentCardComment) => void;
}

/**
 * Default post data for development
 * @constant DEFAULT_POSTS
 */
const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    thumbnail: `${PLACEHOLDER_BASE_URL}/150`,
    creatorProfilePic: `${PLACEHOLDER_BASE_URL}/40`,
    creatorName: 'John Doe',
    timestamp: '2 hours ago',
    caption: 'This is a caption for the first post.',
    initialLikes: 10,
    initialLiked: false,
    isSubscribed: false,
    onSubscribe: () => console.warn('Subscribe handler not implemented'),
    onClick: () => console.warn('Post click handler not implemented'),
    onComment: () => console.warn('Comment handler not implemented'),
    comments: [
      {
        username: 'user1',
        text: 'Great post!',
        timestamp: '2 hours ago',
        userId: 'user1'
      },
      {
        username: 'user2',
        text: 'Nice',
        timestamp: '2 hours ago',
        userId: 'user2'
      }
    ] as ContentCardComment[]
  },
  {
    id: '2',
    thumbnail: `${PLACEHOLDER_BASE_URL}/150`,
    creatorProfilePic: `${PLACEHOLDER_BASE_URL}/40`,
    creatorName: 'Jane Smith',
    timestamp: '3 days ago',
    caption: 'This is a caption for the second post.',
    initialLikes: 20,
    initialLiked: true,
    isSubscribed: true,
    onSubscribe: () => console.warn('Subscribe handler not implemented'),
    onClick: () => console.warn('Post click handler not implemented'),
    onComment: () => console.warn('Comment handler not implemented'),
    comments: [
      {
        username: 'user3',
        text: 'Amazing content!',
        timestamp: '3 days ago',
        userId: 'user3'
      }
    ] as ContentCardComment[]
  },
  {
    id: '3',
    thumbnail: `${PLACEHOLDER_BASE_URL}/150`,
    creatorProfilePic: `${PLACEHOLDER_BASE_URL}/40`,
    creatorName: 'Chris Johnson',
    timestamp: '1 week ago',
    caption: 'This is a caption for the third post.',
    initialLikes: 30,
    initialLiked: false,
    isSubscribed: false,
    onSubscribe: () => console.warn('Subscribe handler not implemented'),
    onClick: () => console.warn('Post click handler not implemented'),
    onComment: () => console.warn('Comment handler not implemented'),
    comments: [] as ContentCardComment[]
  }
] as const;

/**
 * ExplorePage component for displaying content posts
 * @param {ExplorePageProps} props - Component props
 * @returns {ReactNode}
 */
export const ExplorePage: React.FC<ExplorePageProps> = ({
  posts = DEFAULT_POSTS,
  onPostClick = () => {},
  onSubscribe = () => {},
  onComment = () => {}
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