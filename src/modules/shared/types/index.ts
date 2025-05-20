export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isCreator: boolean;
}

export interface Creator extends User {
  subscriptionLevels: SubscriptionLevel[];
  contentCount: number;
  followerCount: number;
  subscriberCount: number;
}

export interface SubscriptionLevel {
  level: 0 | 1 | 2 | 3;
  price: number;
  name: string;
  description: string;
  features: string[];
}

export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  requiredLevel: 0 | 1 | 2 | 3;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}