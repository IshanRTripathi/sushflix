import { Link } from 'react-router-dom';
import { UserProfile } from '../../types/user';

interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface PostCardProps {
  user: UserProfile;
  post: Post;
  isFollowing: boolean;
  onFollow: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ user, post, isFollowing, ...handlers }) => {
  return (
    <div className="bg-black rounded-lg p-4 mb-4">
      {/* Profile Section */}
      <div className="flex items-center mb-4">
        <img
          src={user.profilePicture || '/default-avatar.png'}
          alt={user.displayName}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="text-white font-semibold">{user.displayName}</h3>
          <p className="text-gray-400 text-sm">Last seen online</p>
        </div>
        <button
          className={`ml-auto px-4 py-2 rounded-full ${
            isFollowing ? 'bg-gray-600' : 'bg-red-600'
          } text-white text-sm`}
          onClick={handlers.onFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Post Content */}
      <div className="mt-4">
        <p className="text-white mb-4">{post.caption}</p>
        <img
          src={post.mediaUrl}
          alt={post.caption}
          className="w-full aspect-video rounded-lg"
        />
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center mt-4 space-x-4">
        <button
          onClick={handlers.onLike}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likes}</span>
        </button>
        <button
          onClick={handlers.onComment}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comments}</span>
        </button>
        <button
          onClick={handlers.onShare}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button
          onClick={handlers.onBookmark}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
