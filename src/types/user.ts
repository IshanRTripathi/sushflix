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
  
  // Editable fields
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
  socialLinks: SocialLinks;
  lastUpdated: Date;
}

export interface EditableProfileFields {
  displayName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  socialLinks: SocialLinks;
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