import axios from 'axios';
import { UserProfile } from '../types/user';
import { logger } from '../utils/logger';

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

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export class ProfileService {
  private static instance: ProfileService;
  private readonly API_BASE_URL = 'http://localhost:8080';

  private constructor() {
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
      return response.data;
    } catch (error: any) {
      logger.error('API request failed', { error });
      throw new Error(error.response?.data?.error || 'Failed to fetch data');
    }
  }

  public async getUserProfile(username: string): Promise<UserProfile> {
    try {
      logger.debug(`Fetching profile for user: ${username}`);
      const response = await this.request<ApiResponse<UserProfile>>({
        method: 'GET',
        url: `${this.API_BASE_URL}/users/${username}`,
      });
      logger.debug(`Successfully fetched profile for user: ${username}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error fetching user profile: ${errorMessage}`);
      throw new Error(`Failed to fetch user profile: ${errorMessage}`);
    }
  }

  public async getUserPosts(username: string): Promise<Post[]> {
    try {
      logger.debug(`Fetching posts for user: ${username}`);
      const response = await this.request<ApiResponse<Post[]>>({
        method: 'GET',
        url: `${this.API_BASE_URL}/posts/${username}`,
      });
      logger.debug(`Successfully fetched posts for user: ${username}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error fetching user posts: ${errorMessage}`);
      throw new Error(`Failed to fetch user posts: ${errorMessage}`);
    }
  }

  public async getUserStats(username: string): Promise<UserStats> {
    try {
      logger.debug(`Fetching stats for user: ${username}`);
      const response = await this.request<ApiResponse<UserStats>>({
        method: 'GET',
        url: `${this.API_BASE_URL}/users/${username}/stats`,
      });
      logger.debug(`Successfully fetched stats for user: ${username}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error fetching user stats: ${errorMessage}`);
      throw new Error(`Failed to fetch user stats: ${errorMessage}`);
    }
  }

  public async toggleFollow(username: string): Promise<boolean> {
    try {
      logger.debug(`Attempting to toggle follow for user: ${username}`);
      const response = await this.request<ApiResponse<boolean>>({
        method: 'POST',
        url: `${this.API_BASE_URL}/users/${username}/follow`,
      });
      logger.info(`Successfully toggled follow for user: ${username}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error toggling follow for user: ${errorMessage}`);
      throw new Error(`Failed to toggle follow for user: ${errorMessage}`);
    }
  }

  public async likePost(postId: string): Promise<void> {
    try {
      logger.debug(`Attempting to like post: ${postId}`);
      await this.request({
        method: 'POST',
        url: `${this.API_BASE_URL}/posts/${postId}/like`,
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
      url: `${this.API_BASE_URL}/posts/${postId}/comment`,
      data: { comment },
    });
  }

  public async sharePost(postId: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: `${this.API_BASE_URL}/posts/${postId}/share`,
    });
  }

  public async bookmarkPost(postId: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: `${this.API_BASE_URL}/posts/${postId}/bookmark`,
    });
  }
}
