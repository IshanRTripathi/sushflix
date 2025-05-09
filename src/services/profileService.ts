import { logger } from '../utils/logger';
import axios from 'axios';
import { UserProfile } from '../types/user';
import { API_BASE_URL } from '../config/index';

// API Endpoints
const API_ENDPOINTS = {
  USER_PROFILE: (username: string) => `${API_BASE_URL}/api/users/${username}`,
  USER_POSTS: (username: string) => `${API_BASE_URL}/api/posts/${username}`,
  USER_STATS: (username: string) => `${API_BASE_URL}/api/users/${username}/stats`,
  TOGGLE_FOLLOW: (username: string) => `${API_BASE_URL}/api/users/${username}/follow`,
  POST_SHARE: (postId: string) => `${API_BASE_URL}/api/posts/${postId}/share`,
  POST_BOOKMARK: (postId: string) => `${API_BASE_URL}/api/posts/${postId}/bookmark`
} as const;

export interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class ProfileService {
  private static instance: ProfileService;
  private static readonly DEFAULT_TIMEOUT = 10000;

  private constructor() {
    axios.defaults.timeout = ProfileService.DEFAULT_TIMEOUT;
    logger.info('Profile service initialized');
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  public async uploadProfilePicture(username: string, file: File): Promise<UploadResponse> {
    try {
      // Validate file parameters
      logger.info('Starting profile picture upload validation', { username });
      
      if (!username || typeof username !== 'string') {
        logger.error('Invalid username provided', { username });
        throw new Error('Invalid username provided');
      }

      if (!file || !(file instanceof File)) {
        logger.error('Invalid file object provided', { file });
        throw new Error('Invalid file object provided');
      }

      // Validate file size and type
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        logger.error('File size exceeds maximum limit', { size: file.size, limit: MAX_FILE_SIZE });
        throw new Error('File size exceeds maximum limit of 2MB');
      }

      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED_TYPES.includes(file.type)) {
        logger.error('Invalid file type', { type: file.type, allowedTypes: ALLOWED_TYPES });
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      }

      logger.info('Profile picture validation successful', { 
        username,
        fileSize: file.size,
        fileType: file.type
      });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('file', file);

      // Set up request controller for timeout
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);

      try {
        logger.info('Uploading profile picture', {
          url: `${API_BASE_URL}/api/users/${username}/profile-picture`,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          }
        });

        const response = await axios.post(
          `${API_BASE_URL}/api/users/${username}/profile-picture`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            signal,
            timeout: 30000
          }
        );

        logger.info('Upload completed successfully', {
          response: {
            success: true,
            imageUrl: response.data.url
          }
        });

        clearTimeout(timeoutId);
        return {
          success: true,
          imageUrl: response.data.url
        };
      } catch (axiosError: any) {
        clearTimeout(timeoutId);

        // Handle different types of errors
        if (axiosError.code === 'ERR_CANCELED') {
          logger.warn('Upload request was canceled');
          return {
            success: false,
            error: 'Upload request was canceled'
          };
        }

        if (axiosError.response) {
          // Server responded with an error
          logger.error('Server error response', {
            status: axiosError.response.status,
            data: axiosError.response.data,
            headers: axiosError.response.headers
          });

          if (axiosError.response.status === 408) {
            return {
              success: false,
              error: 'Request timeout. Please try again.'
            };
          }

          if (axiosError.response.status === 499) {
            return {
              success: false,
              error: 'Request was aborted by client'
            };
          }

          return {
            success: false,
            error: axiosError.response.data?.error || 'Server error occurred'
          };
        } else if (axiosError.request) {
          // Request was made but no response
          logger.error('No response from server', {
            config: axiosError.config
          });
          return {
            success: false,
            error: 'No response from server. Please check your network connection.'
          };
        } else {
          // Something happened in setting up the request
          logger.error('Request setup error', {
            message: axiosError.message,
            stack: axiosError.stack
          });
          return {
            success: false,
            error: 'Error setting up request. Please try again.'
          };
        }
      }
    } catch (error: unknown) {
      logger.error('Upload failed', {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined
        },
        username,
        timestamp: new Date().toISOString()
      });

      // Map error messages based on error type
      const errorType = error instanceof Error ? error.name : 'Unknown';
      type ErrorMessages = {
        [key: string]: string;
      };
      
      const errorMessages: ErrorMessages = {
        'Invalid username': 'Invalid username provided',
        'Invalid file': 'Invalid file object provided',
        'File size': 'File size exceeds maximum limit',
        'File type': 'Invalid file type',
        'Timeout': 'Request timeout. Please try again.',
        'Canceled': 'Upload request was canceled',
        'Network': 'No response from server. Please check your network connection.',
        'Request': 'Error setting up request. Please try again.',
        'Unknown': 'Failed to upload profile picture'
      };

      const errorMessage = errorMessages[errorType] || (error instanceof Error ? error.message : 'Unknown error');

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private async request<T>(config: any): Promise<T> {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error: unknown) {
      logger.error('API request failed:', { error });
      throw error instanceof Error ? error : new Error('API request failed');
    }
  }

  public async getUserProfile(username: string): Promise<UserProfile> {
    try {
      logger.debug(`Fetching profile for user: ${username}`);
      const response = await this.request<UserProfile>({
        method: 'GET',
        url: API_ENDPOINTS.USER_PROFILE(username),
      });
      logger.debug(`Successfully fetched profile for user: ${username}`);
      return response || {
        userId: '',
        username: '',
        createdAt: new Date(),
        subscribers: 0,
        posts: 0,
        displayName: '',
        email: '',
        profilePicture: '',
        bio: '',
        socialLinks: {},
        lastUpdated: new Date(),
        isCreator: false
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error fetching user profile: ${errorMessage}`);
      throw new Error(`Failed to fetch user profile: ${errorMessage}`);
    }
  }

  public async getUserPosts(username: string): Promise<Post[]> {
    try {
      logger.debug(`Fetching posts for user: ${username}`);
      const response = await this.request<Post[]>({
        method: 'GET',
        url: API_ENDPOINTS.USER_POSTS(username),
      });
      logger.debug(`Successfully fetched posts for user: ${username}`);
      return response || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error fetching user posts: ${errorMessage}`);
      throw new Error(`Failed to fetch user posts: ${errorMessage}`);
    }
  }

  public async getUserStats(username: string): Promise<UserStats> {
    try {
      logger.debug(`Fetching stats for user: ${username}`);
      const response = await this.request<UserStats>({
        method: 'GET',
        url: API_ENDPOINTS.USER_STATS(username),
      });
      logger.debug(`Successfully fetched stats for user: ${username}`);
      return response || {
        posts: 0,
        followers: 0,
        following: 0
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error fetching user stats: ${errorMessage}`);
      throw new Error(`Failed to fetch user stats: ${errorMessage}`);
    }
  }

  public async toggleFollow(username: string): Promise<boolean> {
    try {
      logger.debug(`Toggling follow for user: ${username}`);
      const response = await this.request<boolean>({
        method: 'POST',
        url: API_ENDPOINTS.TOGGLE_FOLLOW(username),
      });
      logger.debug(`Successfully toggled follow for user: ${username}`);
      return response || false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error toggling follow: ${errorMessage}`);
      throw new Error(`Failed to toggle follow: ${errorMessage}`);
    }
  }

  public async likePost(postId: string): Promise<void> {
    try {
      logger.debug(`Attempting to like post: ${postId}`);
      await this.request({
        method: 'POST',
        url: `${API_BASE_URL}/api/posts/${postId}/like`,
      });
      logger.info(`Successfully liked post: ${postId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error liking post: ${errorMessage}`);
      throw new Error(`Failed to like post: ${errorMessage}`);
    }
  }

  public async commentOnPost(postId: string, comment: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: `${API_BASE_URL}/api/posts/${postId}/comment`,
      data: { comment },
    });
  }

  public async sharePost(postId: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: API_ENDPOINTS.POST_SHARE(postId),
    });
  }

  public async bookmarkPost(postId: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: API_ENDPOINTS.POST_BOOKMARK(postId),
    });
  }



  public async updateProfile(username: string, profile: UserProfile): Promise<UserProfile> {
    try {
      logger.debug(`Updating profile for user: ${username}`);
      const response = await this.request<UserProfile>({
        method: 'PUT',
        url: API_ENDPOINTS.USER_PROFILE(username),
        data: profile
      });
      logger.debug(`Successfully updated profile for user: ${username}`);
      return response || profile;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error updating profile: ${errorMessage}`);
      throw new Error(`Failed to update profile: ${errorMessage}`);
    }
  }
}
