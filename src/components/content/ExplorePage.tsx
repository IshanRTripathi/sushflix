import React from 'react';
import { ContentCard } from './ContentCard'; // Ensure the correct path

export const ExplorePage: React.FC = () => {
    const samplePosts = [
        {
            id: '1',
            thumbnail: 'https://via.placeholder.com/150',
            creatorProfilePic: 'https://via.placeholder.com/40',
            creatorName: 'John Doe',
            timestamp: '2 hours ago',
            caption: 'This is a caption for the first post.',
            initialLikes: 10,
            initialLiked: false,
            isSubscribed: false,
            onSubscribe: () => alert('Subscribed!'),
            onClick: () => alert('Post Clicked!'),
            onComment: () => alert('Commented!'),
            comments: [{ username: 'user1', text: 'Great post!' }, { username: 'user2', text: 'Nice' }]
        },
        {
            id: '2',
            thumbnail: 'https://via.placeholder.com/150',
            creatorProfilePic: 'https://via.placeholder.com/40',
            creatorName: 'Jane Smith',
            timestamp: '3 days ago',
            caption: 'This is a caption for the second post.',
            initialLikes: 20,
            initialLiked: true,
            isSubscribed: true,
            onSubscribe: () => alert('Subscribed!'),
            onClick: () => alert('Post Clicked!'),
            onComment: () => alert('Commented!'),
            comments: [{ username: 'user3', text: 'Amazing content!' }]
        },
        {
            id: '3',
            thumbnail: 'https://via.placeholder.com/150',
            creatorProfilePic: 'https://via.placeholder.com/40',
            creatorName: 'Chris Johnson',
            timestamp: '1 week ago',
            caption: 'This is a caption for the third post.',
            initialLikes: 30,
            initialLiked: false,
            isSubscribed: false,
            onSubscribe: () => alert('Subscribed!'),
            onClick: () => alert('Post Clicked!'),
            onComment: () => alert('Commented!'),
            comments: []
        }
    ];

    return (
        <div className="flex flex-col items-center py-4">
            {samplePosts.map((post) => (
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
                    onSubscribe={post.onSubscribe}
                    onClick={post.onClick}
                    onComment={post.onComment}
                    comments={post.comments}
                />
            ))}
        </div>
    );
};