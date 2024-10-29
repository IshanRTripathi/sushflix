import React, { useState } from 'react';

interface Comment {
    username: string;
    text: string;
}

interface ContentCardProps {
    id: string;
    thumbnail: string;
    creatorProfilePic: string;
    creatorName: string;
    timestamp: string; // Time in "X minutes/hours/days ago" format
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
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState<string>('');

    const handleLike = () => {
        if (isLiked) {
            setLikes(prevLikes => prevLikes - 1);
        } else {
            setLikes(prevLikes => prevLikes + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            setComments([...comments, { username: 'current_user', text: newComment }]);
            setNewComment('');
            onComment(); // Notify parent about the new comment
        }
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
                        onClick={onSubscribe}
                        className={`text-sm font-semibold ${isSubscribed ? 'text-gray-400' : 'text-blue-500'}`}
                    >
                        {isSubscribed ? 'Following' : 'Follow'}
                    </button>
                    <button className="ml-2 text-gray-500">⋮</button>
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
                <div className="flex items-center">
                    <button onClick={handleLike} className="flex items-center mr-4">
                        <span className="mr-1">👍</span> {likes}
                    </button>
                    <span className="flex items-center">
            <span className="mr-1">💬</span> {comments.length}
          </span>
                </div>
            </div>
            <div className="mt-4">
                {comments.length > 0 && (
                    <div className="mb-4">
                        {comments.map((comment, index) => (
                            <div key={index} className="flex items-start mb-2">
                                <div className="font-bold mr-2">{comment.username}</div>
                                <div>{comment.text}</div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 border rounded-lg p-2 mr-2"
                    />
                    <button onClick={handleAddComment} className="bg-blue-500 text-white rounded-lg px-3 py-1">
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};