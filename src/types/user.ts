export interface SocialLinks {
  website?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

// Type for user roles
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface UserProfile {
  // Non-editable fields
  userId: string;
  username: string;
  createdAt: Date;
  subscribers: number;
  posts: number;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  role: UserRole;
  
  // Editable fields
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
  socialLinks: SocialLinks;
  lastUpdated: Date;
  isCreator: boolean;
}

export interface EditableProfileFields {
  displayName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  socialLinks: SocialLinks;
  isCreator: boolean;
}

export interface FeaturedProfile {
  userId: string;
  username: string;
  displayName: string;
  profilePicture: string;
  bio: string;
  socialLinks: SocialLinks;
}

export interface FeaturedProfileConfig {
  userId: string;
  username: string;
  isActive: boolean;
  displayOrder: number;
} 