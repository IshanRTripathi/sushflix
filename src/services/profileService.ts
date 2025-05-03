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
  private readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
    const response = await this.request<ApiResponse<UserProfile>>({
      method: 'GET',
      url: `${this.API_BASE_URL}/users/${username}`,
    });
    return response.data;
  }

  public async getUserPosts(username: string): Promise<Post[]> {
    const response = await this.request<ApiResponse<Post[]>>({
      method: 'GET',
      url: `${this.API_BASE_URL}/posts/${username}`,
    });
    return response.data;
  }

  public async getUserStats(username: string): Promise<UserStats> {
    const response = await this.request<ApiResponse<UserStats>>({
      method: 'GET',
      url: `${this.API_BASE_URL}/users/${username}/stats`,
    });
    return response.data;
  }

  public async toggleFollow(username: string): Promise<boolean> {
    const response = await this.request<ApiResponse<boolean>>({
      method: 'POST',
      url: `${this.API_BASE_URL}/users/${username}/follow`,
    });
    return response.data;
  }

  public async likePost(postId: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: `${this.API_BASE_URL}/posts/${postId}/like`,
    });
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
