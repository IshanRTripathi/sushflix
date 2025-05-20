import { User } from '../../../shared/types/user';

export interface ProfileResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  profilePicture?: string;
  coverPhoto?: string;
}

export interface FollowUserResponse {
  success: boolean;
  message: string;
  following: boolean;
  followerCount: number;
}
