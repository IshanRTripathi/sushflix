import { Document, Types } from 'mongoose';

// Interface for Social Links
export interface ISocialLinks {
  website: string;
  twitter: string;
  youtube: string;
  instagram: string;
  [key: string]: string;
}

// Interface for User Stats
export interface IUserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  subscriberCount: number;
  [key: string]: number;
}

// Interface for User Preferences
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Base interface for User Profile
export interface IUserProfileBase {
  // Core user fields
  user: Types.ObjectId;
  username: string;
  email: string;
  displayName?: string;
  
  // Profile information
  bio: string;
  profilePicture: string;
  role: string;
  
  // Social and stats
  socialLinks: ISocialLinks;
  stats: IUserStats;
  
  // Preferences and settings
  preferences: IUserPreferences;
  isCreator: boolean;
  
  // Timestamps
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// MongoDB Document interface for User Profile
export interface IUserProfile extends IUserProfileBase, Document {
  // Virtuals
  userId: Types.ObjectId;
  url: string;
  
  // Instance methods
  getPublicProfile: () => Omit<IUserProfileBase, 'getPublicProfile'>;
}

// For static methods
export interface IUserProfileModel extends Document, IUserProfileBase {
  updateStats: (userId: Types.ObjectId, updates: Partial<IUserStats>) => Promise<IUserProfile>;
}

// Type for creating a new profile
export type CreateProfileInput = Omit<IUserProfileBase, 'socialLinks' | 'stats' | 'preferences' | 'isCreator'> & {
  socialLinks?: Partial<ISocialLinks>;
  stats?: Partial<IUserStats>;
  preferences?: Partial<IUserPreferences>;
  isCreator?: boolean;
};

// Type for updating a profile
export type UpdateProfileInput = Partial<CreateProfileInput>;
