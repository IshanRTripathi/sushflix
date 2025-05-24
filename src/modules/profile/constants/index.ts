// Profile-related constants
export const PROFILE_TABS = {
  POSTS: 'posts',
  SAVED: 'saved',
  TAGGED: 'tagged',
} as const;

export const DEFAULT_PROFILE_PICTURE = '/images/profile.png';

export const PROFILE_UPDATE_FIELDS = [
  'displayName',
  'bio',
  'location',
  'website',
  'socialLinks',
  'profilePicture',
] as const;

export const MAX_BIO_LENGTH = 150;
export const MAX_DISPLAY_NAME_LENGTH = 30;

// API Endpoints
export const API_ENDPOINTS = {
  GET_PROFILE: '/api/profile',
  UPDATE_PROFILE: '/api/profile',
  UPLOAD_PROFILE_PICTURE: '/api/upload/profile-picture',
  FOLLOW_USER: (userId: string) => `/api/users/${userId}/follow`,
  UNFOLLOW_USER: (userId: string) => `/api/users/${userId}/unfollow`,
} as const;
