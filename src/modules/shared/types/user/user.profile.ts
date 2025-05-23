import { Document, Types } from 'mongoose';
import { IUser } from './user.core';

/**
 * Social media links for a user profile
 */
export interface ISocialLinks {
  website?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
  [key: string]: string | undefined; // Allow for additional social platforms
}

/**
 * Base interface for user profile statistics
 */
export interface IUserProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  subscriberCount: number;
  [key: string]: number; // Allow for additional stats
}

/**
 * Base interface for user profile data
 */
export interface IUserProfileBase {
  userId: Types.ObjectId;
  displayName: string;
  bio: string;
  profilePicture: string;
  coverPhoto: string;
  socialLinks: ISocialLinks;
  stats: IUserProfileStats;
  isCreator: boolean;
  isVerified: boolean;
  location?: string;
  website?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

/**
 * Complete user profile document interface
 */
export interface IUserProfile extends IUserProfileBase, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  id: string;
  
  // Methods
  incrementPostCount(): Promise<void>;
  decrementPostCount(): Promise<void>;
  incrementFollowerCount(): Promise<void>;
  decrementFollowerCount(): Promise<void>;
  incrementFollowingCount(): Promise<void>;
  decrementFollowingCount(): Promise<void>;
  incrementSubscriberCount(): Promise<void>;
  decrementSubscriberCount(): Promise<void>;
}

/**
 * User profile model static methods
 */
export interface IUserProfileModel extends Document<any, any, IUserProfile> {
  // Add any static methods here
}

/**
 * Data required to create a new user profile
 */
export interface CreateUserProfileInput {
  userId: Types.ObjectId | string;
  displayName: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  socialLinks?: Partial<ISocialLinks>;
  isCreator?: boolean;
  isVerified?: boolean;
}

/**
 * Data required to update a user profile
 */
export interface UpdateUserProfileInput {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  socialLinks?: Partial<ISocialLinks>;
  isCreator?: boolean;
  isVerified?: boolean;
  location?: string;
  website?: string;
  birthDate?: Date | null;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
}

/**
 * Public user profile data that can be exposed via API
 */
export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  coverPhoto: string;
  socialLinks: ISocialLinks;
  stats: IUserProfileStats;
  isCreator: boolean;
  isVerified: boolean;
  isFollowing?: boolean; // Only present when viewing another user's profile
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}
