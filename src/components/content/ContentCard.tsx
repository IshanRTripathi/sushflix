import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

interface Comment {
    username: string;
    text: string;
    timestamp?: string;
}

interface ContentCardProps {
    id: string;
    thumbnail: string;
    creatorProfilePic: string;
    creatorName: string;
    timestamp: string;
    caption: string;
    isSubscribed: boolean;
    onSubscribe: () => void;
    onClick: () => void;
    initialLikes: number;
    onComment: () => void;
    initialLiked: boolean;
    comments: Comment[];
}

export const ContentCard: React.FC<ContentCardProps> = ({
                                                            id,
                                                            thumbnail,
                                                            creatorProfilePic,
                                                            creatorName,
                                                            timestamp,
                                                            caption,
                                                            isSubscribed,
                                                            onSubscribe,
                                                            onClick,
                                                            initialLikes,
                                                            onComment,
                                                            initialLiked,
                                                            comments: initialComments
                                                        }) => {
    const { isAuthenticated, user } = useAuth();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState<string>('');
    const [isFollowing, setIsFollowing] = useState(false);

    const handleLike = () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (isLiked) {
            setLikes(prevLikes => prevLikes - 1);
        } else {
            setLikes(prevLikes => prevLikes + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleAddComment = () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (newComment.trim()) {
            const newCommentObj = {
                username: user?.username || 'anonymous',
                text: newComment,
                timestamp: 'Just now'
            };
            setComments([...comments, newCommentObj]);
            setNewComment('');
            onComment();
        }
    };

    const handleFollow = () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        setIsFollowing(!isFollowing);
    };

    return (
        <div className="border border-gray-300 rounded-lg shadow-md p-4 bg-white mb-4 min-w-full sm:min-w-[500px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <img
                        src={creatorProfilePic}
                        alt={`${creatorName}'s profile`}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <div className="font-bold">{creatorName}</div>
                        <div className="text-sm text-gray-500">{timestamp}</div>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleFollow}
                        className={`text-sm font-semibold px-4 py-1 rounded-full ${
                            isFollowing
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            </div>

            <div className="mb-4 text-gray-800">{caption}</div>

            <img
                src={thumbnail}
                alt="Post"
                className="w-full rounded-lg cursor-pointer"
                onClick={onClick}
            />

            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                    >
                        <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{comments.length}</span>
                    </button>
                </div>
            </div>

            <div className="mt-4 border-t pt-4">
                {comments.map((comment, index) => (
                    <div key={index} className="mb-2">
                        <div className="flex items-start">
                            <span className="font-bold mr-2">{comment.username}</span>
                            <span className="text-gray-700">{comment.text}</span>
                        </div>
                        {comment.timestamp && (
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        )}
                    </div>
                ))}

                {isAuthenticated && (
                    <div className="mt-4 flex items-center">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 border rounded-lg p-2 mr-2"
                        />
                        <button
                            onClick={handleAddComment}
                            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
                        >
                            Post
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};