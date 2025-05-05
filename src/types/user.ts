export interface SocialLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
}

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