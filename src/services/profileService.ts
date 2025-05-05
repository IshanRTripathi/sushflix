import { logger } from '../utils/logger';
import axios from 'axios';
import { UserProfile } from '../types/user';
import { API_BASE_URL } from '../config/index';
import { StorageService } from './storageService';

const storageService = StorageService.getInstance();

// API Endpoints
const API_ENDPOINTS = {
  USER_PROFILE: (username: string) => `${API_BASE_URL}users/${username}`,
  USER_POSTS: (username: string) => `${API_BASE_URL}posts/${username}`,
  USER_STATS: (username: string) => `${API_BASE_URL}users/${username}/stats`,
  TOGGLE_FOLLOW: (username: string) => `${API_BASE_URL}users/${username}/follow`,
  POST_SHARE: (postId: string) => `${API_BASE_URL}posts/${postId}/share`,
  POST_BOOKMARK: (postId: string) => `${API_BASE_URL}posts/${postId}/bookmark`
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

  private async request<T>(config: any): Promise<T> {
    try {
      const response = await axios(config);
      // Check if response is an error object
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    } catch (error: any) {
      logger.error('API request failed', { error });
      throw new Error(error.response?.data?.error || 'Failed to fetch data');
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
        url: `${API_BASE_URL}/posts/${postId}/like`,
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
      url: `${API_BASE_URL}/posts/${postId}/comment`,
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

  public async uploadProfilePicture(username: string, file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      logger.debug(`Uploading profile picture for user: ${username}`);

      // Upload to Google Cloud Storage
      const uploadResponse = await storageService.uploadFile(username, file);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Failed to upload profile picture');
      }

      // Update user profile with new image URL
      await this.request({
        method: 'PUT',
        url: `${API_BASE_URL}/users/${username}/profile`,
        data: {
          profilePicture: uploadResponse.url
        }
      });

      logger.debug(`Successfully updated profile picture for user: ${username}`);
      return {
        success: true,
        imageUrl: uploadResponse.url
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error uploading profile picture: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async updateProfile(username: string, profileData: any): Promise<void> {
    try {
      logger.debug(`Updating profile for user: ${username}`);

      await this.request({
        method: 'PUT',
        url: `${API_BASE_URL}/users/${username}/profile`,
        data: profileData
      });

      logger.debug(`Successfully updated profile for user: ${username}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error updating profile: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }
}
