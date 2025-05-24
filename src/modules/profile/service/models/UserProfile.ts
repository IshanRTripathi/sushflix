import { Document, Schema, Model, model, Types } from 'mongoose';

// Interface for Social Links
export interface ISocialLinks {
  website: string;
  twitter: string;
  youtube: string;
  instagram: string;
  [key: string]: string; // For any additional social platforms
}

// Interface for User Stats
export interface IUserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  subscriberCount: number;
  [key: string]: number; // For any additional stats
}

// Interface for User Preferences
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Base interface without Document extensions
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
}

// Main User Profile Interface that extends both base and Document
export interface IUserProfile extends IUserProfileBase, Document {
  // Virtuals
  userId: Types.ObjectId;
  url: string;
  
  // Instance methods
  getPublicProfile: () => Omit<IUserProfile, keyof Document | 'getPublicProfile'>;
}

// For static methods
interface IUserProfileModel extends Model<IUserProfile> {
  updateStats: (userId: Types.ObjectId, updates: Partial<IUserStats>) => Promise<IUserProfile>;
}

// Schema Definitions
const socialLinksSchema = new Schema<ISocialLinks>({
  website: { type: String, default: '' },
  twitter: { type: String, default: '' },
  youtube: { type: String, default: '' },
  instagram: { type: String, default: '' },
  // Add other social platforms as needed
}, { _id: false });

const userStatsSchema = new Schema<IUserStats>({
  postCount: { type: Number, default: 0 },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  // Add other stats as needed
}, { _id: false });

const preferencesSchema = new Schema<IUserPreferences>({
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'system'],
    default: 'system' 
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { _id: false });

const UserProfileSchema = new Schema<IUserProfile, IUserProfileModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  socialLinks: {
    type: socialLinksSchema,
    default: () => ({} as ISocialLinks)
  },
  stats: {
    type: userStatsSchema,
    default: () => ({} as IUserStats)
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({
      theme: 'system',
      notifications: {
        email: true,
        push: true
      }
    } as IUserPreferences)
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  // Add any additional profile-specific fields here
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
UserProfileSchema.index({ user: 1 });
UserProfileSchema.index({ 'socialLinks.website': 1 });
UserProfileSchema.index({ isCreator: 1 });

// Virtual for user's full URL
UserProfileSchema.virtual('url').get(function(this: IUserProfile) {
  return `/users/${this.user}`;
});

// Static method to update user stats
UserProfileSchema.static('updateStats', async function(
  userId: Types.ObjectId,
  updates: Partial<IUserStats>
): Promise<IUserProfile> {
  return this.findOneAndUpdate(
    { user: userId },
    { $inc: updates },
    { new: true, upsert: true }
  ) as Promise<IUserProfile>;
});

// Instance method to get public profile data
UserProfileSchema.method('getPublicProfile', function() {
  const profile = this['toObject']();
  
  // Remove sensitive data
  const { __v, updatedAt, ...publicProfile } = profile as any;
  
  return publicProfile as Omit<IUserProfile, keyof Document | 'getPublicProfile'>;
});

// Add virtual for userId to match user field
UserProfileSchema.virtual('userId').get(function(this: IUserProfile) {
  return this.user;
});

// Create and export the model
const UserProfile = model<IUserProfile, IUserProfileModel>('UserProfile', UserProfileSchema);

export default UserProfile;
