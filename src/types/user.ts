// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  CREATOR: 'creator'
} as const;

// Type for user roles
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Social media links
export interface SocialLinks {
  website?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
  [key: string]: string | undefined; // Allow for additional social platforms
}

// User statistics
export interface UserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  subscriberCount: number;
  [key: string]: number; // Allow for additional stats
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
  [key: string]: any; // Allow for additional preferences
}

// Complete user profile
export interface UserProfile {
  // Core user info
  id: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  
  // Profile info
  displayName: string;
  bio: string;
  profilePicture: string;
  coverPhoto: string;
  socialLinks: SocialLinks;
  
  // Stats
  stats: UserStats & {
    posts?: number;
    followers?: number;
    subscribers?: number;
    [key: string]: number | undefined;
  };
  
  // Preferences
  preferences: UserPreferences;
  
  // Status and timestamps
  isCreator: boolean;
  isFollowing?: boolean; // Only used in some contexts
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional properties for featured profiles
  posts?: number;
  followers?: number;
  subscribers?: number;
  [key: string]: any; // Allow for additional properties
}

// For creating/updating a profile
export interface ProfileInput {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  socialLinks?: Partial<SocialLinks>;
  preferences?: Partial<UserPreferences>;
  isCreator?: boolean;
}

// For updating user settings
export interface UserSettingsUpdate {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  preferences?: Partial<UserPreferences>;
}

// For API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// For paginated results
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// For user search results
export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string;
  isFollowing: boolean;
  isCreator: boolean;
}

export interface PartialProfileUpdate {
  displayName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  socialLinks?: SocialLinks;
  isCreator?: boolean;
}

export interface FeaturedProfile {
  userId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  bio: string;
  socialLinks: SocialLinks;
  posts?: number;
  followers?: number;
  subscribers?: number;
}

export interface FeaturedProfileConfig {
  userId: string;
  username: string;
  isActive: boolean;
  displayOrder: number;
}