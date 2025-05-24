import { logger } from '@/modules/shared/utils/logger';
import { 
  getUserProfile as apiGetProfileByUsername,
  updateUserProfile as apiUpdateUserProfile,
  updateUserSettings as apiUpdateUserSettings,
  uploadProfilePicture as apiUploadProfilePicture,
  followUser as apiFollowUser,
  unfollowUser as apiUnfollowUser,
  getUserStats as apiGetUserStats,
  searchUsers as apiSearchUsers
} from '@/modules/shared/api/profile/profile.api';
import { apiClient } from '@/modules/shared/api/apiClient';
import { IUserProfile } from '@/modules/shared/types/user/user.profile';
import {
  IApiResponse,
  IUserStatsResponse,
  IUpdateProfileRequest,
  IUpdateUserSettingsRequest
} from '@/modules/shared/types/user/api.types';

// Re-export the ProfileData type from the API for consistency
export type { ProfileData } from '@/modules/shared/api/profile/profile.api';
// Server-side operations are handled by API routes

class ProfileService {
  private static instance: ProfileService;

  private constructor() {
    logger.info('ProfileService initialized');
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  // Profile methods
  public async getCurrentUser(): Promise<IApiResponse<IUserProfile>> {
    try {
      // Get user data from the API
      const response = await apiClient.get('/api/users/me');
      
      if (!response.data?.data) {
        throw new Error('No user data in response');
      }
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      logger.error('Failed to get current user from API:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch current user',
        status: error.response?.status || 401 // Unauthorized
      };
    }
  }

  public async getUserProfile(username: string): Promise<IApiResponse<IUserProfile>> {
    try {
      const response = await apiGetProfileByUsername(username);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to get user profile for ${username}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user profile',
        status: error.response?.status
      };
    }
  }

  public async updateUserProfile(
    username: string, 
    profileData: IUpdateProfileRequest
  ): Promise<IApiResponse<IUserProfile>> {
    try {
      const response = await apiUpdateUserProfile(username, profileData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to update profile for user ${username}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        status: error.response?.status
      };
    }
  }

  public async updateUserSettings(
    username: string, 
    settings: IUpdateUserSettingsRequest
  ): Promise<IApiResponse<IUserProfile>> {
    try {
      const response = await apiUpdateUserSettings(username, settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to update settings for user ${username}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update settings',
        status: error.response?.status
      };
    }
  }

  public async uploadProfilePicture(
    username: string, 
    file: File
  ): Promise<IApiResponse<{ profilePicture: string; url?: string }>> {
    try {
      logger.info(`Uploading profile picture for user: ${username}`, {
        filename: file.name,
        size: file.size,
        type: file.type
      });

      const response = await apiUploadProfilePicture(username, file);
      
      // Log the raw response for debugging
      logger.debug('Upload profile picture response:', { response });
      
      // Ensure we have a profile picture URL
      const profilePicture = response.data?.profilePicture || response.data?.url;
      if (!profilePicture) {
        const errorMsg = 'No profile picture URL in response';
        logger.error(errorMsg, { response });
        throw new Error(errorMsg);
      }
      
      logger.info('Successfully uploaded profile picture', { profilePicture });
      
      // Return the response with both profilePicture and url for backward compatibility
      return {
        success: true,
        data: {
          profilePicture,
          url: profilePicture // For backward compatibility
        }
      };
    } catch (error: any) {
      logger.error(`Failed to upload profile picture for user ${username}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to upload profile picture',
        status: error.response?.status
      };
    }
  }

  // Social features
  public async followUser(_userId: string, targetUserId: string): Promise<IApiResponse<{ success: boolean }>> {
    try {
      const response = await apiFollowUser(targetUserId);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to follow user ${targetUserId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to follow user',
        status: error.response?.status
      };
    }
  }

  public async unfollowUser(_userId: string, targetUserId: string): Promise<IApiResponse<{ success: boolean }>> {
    try {
      const response = await apiUnfollowUser(targetUserId);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to unfollow user ${targetUserId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unfollow user',
        status: error.response?.status
      };
    }
  }

  public async requestVerification(userId: string): Promise<IApiResponse<{ success: boolean }>> {
    try {
      logger.warn(`Verification request not implemented for user: ${userId}`);
      return {
        success: false,
        error: 'Verification is not available at this time',
        data: { success: false }
      };
    } catch (error: any) {
      logger.error(`Error in verification request for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to process verification request',
        status: error.response?.status,
        data: { success: false }
      };
    }
  }

  // Stats
  public async getUserStats(userId: string): Promise<IApiResponse<IUserStatsResponse>> {
    try {
      const response = await apiGetUserStats(userId);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Failed to get stats for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user stats',
        status: error.response?.status
      };
    }
  }

  // Search
  public async searchUsers(
    query: string, 
    page = 1, 
    limit = 20
  ): Promise<IApiResponse<{ users: IUserProfile[]; total: number }>> {
    try {
      const response = await apiSearchUsers(query, page, limit);
      return {
        success: true,
        data: {
          users: response.data?.users || [],
          total: response.data?.total || 0
        }
      };
    } catch (error: any) {
      logger.error(`Error searching users: ${query}`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed',
        status: error.response?.status,
        data: { users: [], total: 0 }
      };
    }
  }
}

// Export a singleton instance
export const profileService = ProfileService.getInstance();
export default profileService;
