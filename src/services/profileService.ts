import axios, { AxiosRequestConfig } from 'axios';
import type { 
  UserProfile, 
  UserStats, 
  ApiResponse
} from '../types/user';
import { logger } from '../utils/logger';

// Re-export types from user module
export type { 
  UserProfile, 
  UserStats, 
  ApiResponse
} from '../types/user';

// Export UserSettings interface for external use
export interface UserSettings extends Record<string, unknown> {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    [key: string]: boolean;
  };
  privacy?: {
    showOnlineStatus?: boolean;
    showActivityStatus?: boolean;
    allowMessagesFrom?: 'everyone' | 'followed' | 'none';
  };
  emailPreferences?: {
    newsletter?: boolean;
    productUpdates?: boolean;
    marketing?: boolean;
  };
}



type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Define the EditableProfileFields type
type EditableProfileFields = {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
};

// API Endpoints are now inlined in the methods

// Default values
const DEFAULT_PROFILE: Omit<UserProfile, 'id' | 'userId' | 'username' | 'email' | 'role' | 'createdAt' | 'updatedAt'> = {
  emailVerified: false,
  displayName: '',
  bio: '',
  profilePicture: '',
  coverPhoto: '',
  socialLinks: {},
  stats: {
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    subscriberCount: 0,
  },
  preferences: {
    theme: 'system',
    notifications: {
      email: true,
      push: true,
    },
  },
  isCreator: false,
  isVerified: false,
};

class ProfileService {
  private static instance: ProfileService;
  private static readonly DEFAULT_TIMEOUT = 10000;
  private authService: { logout: () => void };

  private constructor() {
    this.authService = {
      logout: () => {
        window.location.href = '/login';
      },
    };
    axios.defaults.timeout = ProfileService.DEFAULT_TIMEOUT;
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.authService.logout();
        }
        return Promise.reject(error);
      }
    );
    logger.info('ProfileService initialized');
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private getAuthHeader(): Record<string, string> {
    try {
      if (typeof window === 'undefined') {
        return {};
      }
      const token = localStorage.getItem('authToken');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Error getting auth token:', error);
      return {};
    }
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    params: Record<string, unknown> = {},
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if the URL is already a full URL
      let apiUrl: string;
      if (url.startsWith('http')) {
        apiUrl = url;
      } else {
        // Use environment variable for API base URL or default to development
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        // Ensure the URL starts with a slash and doesn't have double slashes
        const path = url.startsWith('/') ? url : `/${url}`;
        apiUrl = `${baseUrl}${baseUrl.endsWith('/') ? path.slice(1) : path}`;
      }
      
      logger.debug(`Making ${method} request to:`, { 
        url: apiUrl,
        params,
        hasData: !!data,
        headers: Object.keys(headers)
      });

      const config: AxiosRequestConfig = {
        method,
        url: apiUrl,
        data: data as Record<string, unknown>,
        params,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.getAuthHeader(),
          ...headers,
        },
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      };

      const response = await axios(config);

      // Check if the response is HTML (which would indicate a routing issue)
      const contentType = response.headers?.['content-type'] || '';
      if (contentType.includes('text/html')) {
        logger.error('Received HTML response instead of JSON', {
          url: apiUrl,
          status: response.status,
          statusText: response.statusText,
          response: response.data?.substring(0, 200) // Log first 200 chars of response
        });
        throw new Error('Received HTML response. Check if the API endpoint is correct.');
      }

      // If the response is not successful, log the error
      if (response.status >= 400) {
        const errorMessage = response.data?.message || `Request failed with status ${response.status}`;
        logger.error('API request failed', {
          url: apiUrl,
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          response: response.data
        });
        return {
          success: false,
          message: errorMessage,
          status: response.status
        } as ApiResponse<T>;
      }

      return {
        success: true,
        data: response.data as T,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || error.message,
        };
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  private normalizeUserProfile(profile: UserProfile): UserProfile {
    return { ...DEFAULT_PROFILE, ...profile };
  }

  // User Profile Methods
  
  /**
   * Get the current user's profile
   */
  public async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>('GET', '/users/me');
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
      return this.normalizeUserProfile(response.data);
    } catch (error) {
      logger.error('Error fetching current user:', { error });
      throw error;
    }
  }

  /**
   * Get a user's profile by username
   */
  public async getUserProfile(username: string): Promise<UserProfile> {
    try {
      logger.info(`Fetching profile for username: ${username}`);
      
      // First, try to get the user ID by username if needed
      let userId = '';
      let currentUser = null;
      try {
        // Try to get user from local storage if available
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          currentUser = JSON.parse(userData);
          if (currentUser?.username === username) {
            userId = currentUser.id;
          }
        }
      } catch (e) {
        logger.warn('Error getting user data from local storage', { error: e });
      }

      let response;
      try {
        // Try with username first
        logger.debug('Trying to fetch profile by username:', { username });
        response = await this.request<UserProfile>('GET', `/api/users/${username}`);
        
        // If we got a response but it's not successful, try with ID if available
        if ((!response.success || !response.data) && userId) {
          logger.warn('Failed to fetch by username, trying with ID', { username, userId });
          response = await this.request<UserProfile>('GET', `/api/users/${userId}`);
        }
      } catch (error) {
        logger.error('Error fetching user profile:', { 
          username, 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
      
      // Log the raw response for debugging
      logger.debug('Raw profile response:', { 
        responseStatus: response?.status,
        responseSuccess: response?.success,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : []
      });

      if (!response || !response.success) {
        const errorMessage = response?.message || 'No profile data received';
        logger.error('Invalid profile response', { 
          status: response?.status,
          statusText: (response as any)?.statusText,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }

      // If we have data but it's in the data property, use that
      let profileData = response.data;
      
      // If the data is a string, try to parse it as JSON
      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData);
        } catch (e) {
          logger.error('Failed to parse profile data', { data: profileData });
          throw new Error('Invalid user profile data format');
        }
      }

      // If we still don't have valid data, throw an error
      if (!profileData || typeof profileData !== 'object') {
        logger.error('Invalid profile data structure', { profileData });
        throw new Error('Invalid profile data structure');
      }

      // Log the parsed profile data for debugging
      logger.debug('Parsed profile data:', { 
        hasProfileData: !!profileData,
        profileDataKeys: Object.keys(profileData || {})
      });

      return this.normalizeUserProfile(profileData as UserProfile);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorData = {
        error: errorMessage,
        username,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        config: (error as any)?.config,
        stack: error instanceof Error ? error.stack : undefined
      };
      
      logger.error(`Failed to fetch profile for ${username}`, errorData);
      
      // Return a default profile with the username if all else fails
      const now = new Date();
      return {
        id: `temp-${Date.now()}`,
        userId: `temp-${Date.now()}`,
        username,
        email: '',
        role: 'user',
        emailVerified: false,
        displayName: username,
        bio: '',
        profilePicture: '',
        coverPhoto: '',
        socialLinks: {},
        stats: {
          postCount: 0,
          followerCount: 0,
          followingCount: 0,
          subscriberCount: 0
        },
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true
          }
        },
        isCreator: false,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
        isFollowing: false
      };
    }
  }

  /**
   * Update a user's profile
   */
  public async updateUserProfile(userId: string, profileData: Partial<EditableProfileFields>): Promise<UserProfile> {
    try {
      const response = await this.request<UserProfile>(
        'PUT', 
        `/users/${userId}`, 
        profileData as Record<string, unknown>,
        {}
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update profile');
      }
      return this.normalizeUserProfile(response.data);
    } catch (error) {
      logger.error('Error updating profile:', { error });
      throw error;
    }
  }

  /**
   * Update user settings
   */
  public async updateUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
    try {
      const response = await this.request<UserSettings>(
        'PATCH', 
        `/users/${userId}/settings`,
        settings,
        {}
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update settings');
      }
      return response.data;
    } catch (error) {
      logger.error('Error updating settings:', { error });
      throw error;
    }
  }

  // Avatar & Cover Photo Methods
  
  /**
   * Upload a new profile picture
   */
  public async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.request<{ url: string }>(
        'POST', 
        `/users/${userId}/profile-picture`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      
      if (!response.success || !response.data?.url) {
        throw new Error(response.message || 'Failed to upload profile picture');
      }
      
      return response.data.url;
    } catch (error) {
      logger.error('Error uploading profile picture:', { error });
      throw error;
    }
  }

  /**
   * Upload a new cover photo
   */
  public async uploadCoverPhoto(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.request<{ url: string }>(
        'POST', 
        `/users/${userId}/cover-photo`,
        formData,
        {},
        { 'Content-Type': 'multipart/form-data' }
      );
      
      if (!response.success || !response.data?.url) {
        throw new Error(response.message || 'Failed to upload cover photo');
      }
      
      return response.data.url;
    } catch (error) {
      logger.error('Error uploading cover photo:', { error });
      throw error;
    }
  }

  // Follow/Unfollow Methods
  
  /**
   * Follow a user
   */
  public async followUser(_userId: string, targetUserId: string): Promise<void> {
    try {
      const response = await this.request<void>(
        'POST', 
        `/users/${targetUserId}/follow`,
        {} as Record<string, unknown>,
        {}
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to follow user');
      }
    } catch (error) {
      logger.error('Error following user:', { error });
      throw error;
    }
  }

  /**
   * Unfollow a user
   */
  public async unfollowUser(_userId: string, targetUserId: string): Promise<void> {
    try {
      const response = await this.request<void>(
        'DELETE', 
        `/users/${targetUserId}/follow`,
        {} as Record<string, unknown>,
        {}
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to unfollow user');
      }
    } catch (error) {
      logger.error('Error unfollowing user:', { error });
      throw error;
    }
  }

  // Stats Methods
  
  /**
   * Get user stats
   */
  public async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await this.request<UserStats>(
        'GET', 
        `/users/${userId}/stats`,
        {} as Record<string, unknown>,
        {}
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user stats');
      }
      return {
        postCount: response.data.postCount || 0,
        followerCount: response.data.followerCount || 0,
        followingCount: response.data.followingCount || 0,
        subscriberCount: response.data.subscriberCount || 0,
      };
    } catch (error) {
      logger.error('Error fetching user stats:', { error });
      throw error;
    }
  }

  /**
   * Update user stats
   */
  public async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    try {
      const response = await this.request<UserStats>(
        'PATCH', 
        `/users/${userId}/stats`, 
        updates as Record<string, unknown>,
        {}
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update user stats');
      }
      return response.data;
    } catch (error) {
      logger.error('Error updating user stats:', { error });
      throw error;
    }
  }

  // Search Methods
  
  /**
   * Search for users
   */
  public async searchUsers(query: string, page = 1, limit = 20): Promise<{ users: UserProfile[]; total: number }> {
    try {
      const response = await this.request<{ users: UserProfile[]; total: number }>(
        'GET', 
        '/users/search', 
        {} as Record<string, unknown>,
        { query, page, limit }
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to search users');
      }
      
      return {
        users: (response.data.users || []).map(user => this.normalizeUserProfile(user)),
        total: response.data.total || 0
      };
    } catch (error) {
      logger.error('Error searching users:', { error });
      throw error;
    }
  }

  // Verification Methods
  
  /**
   * Request account verification
   */
  public async requestVerification(userId: string): Promise<void> {
    try {
      const response = await this.request<void>(
        'POST', 
        `/users/${userId}/request-verification`,
        {} as Record<string, unknown>,
        {}
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to request verification');
      }
    } catch (error) {
      logger.error('Error requesting verification:', { error });
      throw error;
    }
  }
}

export const profileService = ProfileService.getInstance();
export default profileService;
