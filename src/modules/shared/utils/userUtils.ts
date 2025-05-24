import { IUser } from '../../profile/service/models/User';
import { UserProfile, UserRole, UserStats, UserPreferences } from '../types/user';

/**
 * Converts a Mongoose User document to a UserProfile
 */
export const toUserProfile = (user: IUser): UserProfile => {
  return {
    id: user._id.toString(),
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role as UserRole,
    emailVerified: user.emailVerified || false,
    displayName: user.displayName || user.username,
    bio: (user as any).bio || '',
    profilePicture: user.profilePicture || '',
    socialLinks: (user as any).socialLinks || {},
    stats: {
      postCount: (user as any).postCount || 0,
      followerCount: (user as any).followerCount || 0,
      followingCount: (user as any).followingCount || 0,
      subscriberCount: (user as any).subscriberCount || 0,
    },
    preferences: (user as any).preferences || {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
      },
    },
    isCreator: user.isCreator || false,
    isVerified: (user as any).isVerified || false,
    createdAt: user.createdAt || new Date(),
    updatedAt: user.updatedAt || new Date(),
  };
};

/**
 * Creates a partial user update object from profile input
 */
export const toUserUpdate = (profile: Partial<UserProfile>): any => {
  const update: any = { ...profile };
  
  // Map any field name differences if needed
  if (update.displayName) update.displayName = update.displayName;
  if (update.profilePicture) update.profilePicture = update.profilePicture;
  if (update.bio) update.bio = update.bio;
  if (update.socialLinks) update.socialLinks = update.socialLinks;
  
  return update;
};

/**
 * Creates a new user object from registration data
 */
export const toNewUser = (data: {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  isCreator?: boolean;
}): any => {
  return {
    username: data.username,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
    isCreator: data.isCreator || false,
    emailVerified: false,
    profilePicture: '',
  };
};
