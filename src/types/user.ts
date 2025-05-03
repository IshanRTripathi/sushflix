import { ObjectId } from 'mongodb';

export interface SocialLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
}

export interface UserProfile {
  _id?: ObjectId;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
  socialLinks: SocialLinks;
  createdAt: Date;
  lastUpdated: Date;
  stats: {
    posts: number;
    followers: number;
    subscribers: number;
  };
}

export interface EditableProfileFields {
  displayName?: string;
  email?: string;
  bio?: string;
  socialLinks?: SocialLinks;
}

export interface FeaturedProfile extends Omit<UserProfile, 'userId' | 'createdAt' | 'lastUpdated'> {
  userId: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface FeaturedProfileConfig {
  userId: string;
  username: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
} 