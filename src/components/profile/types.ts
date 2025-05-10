/**
 * Types for the profile editing functionality
 */

/**
 * Types for the profile editing functionality
 */

export interface ProfileFormData {
  displayName: string;
  bio: string;
  website: string;
  twitter: string;
  youtube: string;
  isCreator: boolean;
}

export interface ProfileErrors {
  displayName: string;
  bio: string;
  website: string;
  twitter: string;
  youtube: string;
}

export interface UserSocialLinks {
  website?: string;
  twitter?: string;
  youtube?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  profilePicture?: string;
  socialLinks?: UserSocialLinks;
  isCreator: boolean;
  following?: number;
  followers?: number;
  posts?: number;
}

export interface EditProfileProps {
  user: UserProfile;
  onProfileUpdate?: () => void;
}

export interface ProfileUpdateData {
  displayName: string;
  bio: string;
  socialLinks: UserSocialLinks;
  isCreator: boolean;
}
