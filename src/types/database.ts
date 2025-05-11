import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'moderator';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface ISocialLinks {
  website?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

export interface IUserProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  subscriberCount?: number;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface IUserProfile {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  displayName: string;
  bio: string;
  profilePicture?: string;
  coverPhoto?: string;
  socialLinks: ISocialLinks;
  stats: IUserProfileStats;
  preferences: IUserPreferences;
  isCreator: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyStat {
  date: Date;
  postViews: number;
  profileViews: number;
  newFollowers: number;
}

export interface IMonthlyStat {
  month: number;
  year: number;
  totalViews: number;
  totalEngagement: number;
}

export interface IUserStats {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  dailyStats: IDailyStat[];
  monthlyStats: IMonthlyStat[];
  lastUpdated: Date;
}

export interface IUserRelationship {
  _id: Types.ObjectId;
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
}

export interface ISubscriptionTier {
  name: string;
  price: number;
  benefits: string[];
  isActive: boolean;
}

export interface ISubscription {
  _id: Types.ObjectId;
  subscriberId: Types.ObjectId;
  creatorId: Types.ObjectId;
  tier: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentMethodId?: string;
  lastBillingDate?: Date;
  nextBillingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
