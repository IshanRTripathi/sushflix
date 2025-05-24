import { Document, Model, Types } from 'mongoose';
import { IUser } from './user.core';

/** Social media links associated with a user profile */
export interface ISocialLinks {
  website?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
  [key: string]: string | undefined; // Allow for additional social platforms
}

/** Statistical data related to user profile activity and engagement */
export interface IUserProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  subscriberCount: number;
  [key: string]: number; // Allow for additional stats
}

/** Core user profile information and metadata */
export interface IUserProfileBase {
  userId: Types.ObjectId;
  displayName: string;
  bio: string;
  profilePicture: string;
  socialLinks: ISocialLinks;
  stats: IUserProfileStats;
  isCreator: boolean;
  isVerified: boolean;
  location?: string;
  website?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

/** Complete user profile document including MongoDB document properties */
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
 * User profile model with static methods for database operations.
 */
export interface IUserProfileModel extends Model<IUserProfile> {
  // Add any static methods here
}

/**
 * Data structure for creating a new user profile.
 */
export interface CreateUserProfileInput {
  /**
   * Unique identifier for the user.
   */
  userId: Types.ObjectId | string;
  /**
   * Display name chosen by the user.
   */
  displayName: string;
  bio?: string;
  profilePicture?: string;
  socialLinks?: Partial<ISocialLinks>;
  isCreator?: boolean;
  isVerified?: boolean;
}

/** Data structure for updating an existing user profile */
export interface UpdateUserProfileInput {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  socialLinks?: Partial<ISocialLinks>;
  isCreator?: boolean;
  isVerified?: boolean;
  location?: string;
  website?: string;
  birthDate?: Date | null;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
}

/** User profile data that is safe to expose via public APIs */
export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
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
