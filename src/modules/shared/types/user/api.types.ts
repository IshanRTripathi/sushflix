import { IUserProfile } from './user.profile';
import { IUserPreferences } from './user.preferences';
import { IUserStats } from './user.stats';

/**
 * Base API response format
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

/**
 * Paginated response
 */
export interface IPaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Auth response after successful login/signup
 */
export interface IAuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    emailVerified: boolean;
    profile?: Partial<IUserProfile>;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

/**
 * User search result
 */
export interface IUserSearchResult {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string;
  isFollowing: boolean;
  isCreator: boolean;
  stats?: {
    followers?: number;
    posts?: number;
  };
}

/**
 * User settings update request
 */
export interface IUpdateUserSettingsRequest {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  preferences?: Partial<IUserPreferences>;
}

/**
 * User profile update request
 */
export interface IUpdateProfileRequest {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  isCreator?: boolean;
}

/**
 * User statistics response
 */
export interface IUserStatsResponse extends IApiResponse<IUserStats> {}

/**
 * User profile response
 */
export interface IUserProfileResponse extends IApiResponse<IUserProfile> {}

/**
 * Multiple users response
 */
export interface IUsersResponse extends IApiResponse<{
  users: Array<{
    id: string;
    username: string;
    email: string;
    role: string;
    profile?: Partial<IUserProfile>;
  }>;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {}

/**
 * Error response
 */
export interface IErrorResponse extends IApiResponse<null> {
  error: string;
  status: number;
  details?: Record<string, string[]>;
  code?: string;
}

/**
 * Validation error response
 */
export interface IValidationErrorResponse extends IErrorResponse {
  details: Record<string, string[]>;
}

/**
 * Success response
 */
export interface ISuccessResponse<T = unknown> extends IApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Empty success response
 */
export interface IEmptySuccessResponse extends IApiResponse<null> {
  success: true;
  message: string;
}
