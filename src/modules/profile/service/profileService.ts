import { logger } from '@/modules/shared/utils/logger';
import { 
  getProfileByUsername as apiGetProfileByUsername,
  updateUserProfile as apiUpdateUserProfile,
  updateUserSettings as apiUpdateUserSettings,
  uploadProfilePicture as apiUploadProfilePicture,
  followUser as apiFollowUser,
  unfollowUser as apiUnfollowUser,
  getUserStats as apiGetUserStats,
  searchUsers as apiSearchUsers
} from '@/modules/shared/api/profile/profile.api';
import type { 
  IUserProfile as UserProfile, 
  UserStats, 
  UserSettingsUpdate,
  FeaturedProfileConfig,
  ApiResponse,
  ProfileInput,
  SocialLinks
} from '@/modules/shared/types/user';

// Re-export the ProfileData type from the API for consistency
export type { ProfileData } from '@/modules/shared/api/profile/profile.api';
// File system operations are only available on the server side
const isServer = typeof window === 'undefined';
let fs: any, path: any;

// Use dynamic imports for server-side only modules
if (isServer) {
  import('fs/promises').then(module => { fs = module; });
  import('path').then(module => { path = module; });
}

class ProfileService {
  private static instance: ProfileService;
  private readonly PROFILES_DIR = isServer ? 'public/profiles' : '';
  private readonly CONFIG_FILE = isServer ? 'featured-profiles.json' : '';

  private constructor() {
    logger.info('ProfileService initialized');
    this.ensureProfilesDirectory().catch(err => 
      logger.error('Failed to create profiles directory', { error: err })
    );
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private async ensureProfilesDirectory(): Promise<void> {
    if (!isServer || !fs) return;
    
    try {
      await fs.mkdir(this.PROFILES_DIR, { recursive: true });
      logger.debug('Profiles directory ensured');
    } catch (error) {
      logger.error('Failed to create profiles directory', { error });
      throw error;
    }
  }

  public async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const response = await apiGetProfileByUsername(username);
      return response.data;
    } catch (error) {
      logger.error(`Error getting profile by username: ${username}`, { error });
      throw error;
    }
  }

  public async updateProfile(
    username: string, 
    updates: ProfileInput
  ): Promise<UserProfile> {
    try {
      const response = await apiUpdateUserProfile(username, updates);
      logger.info(`Profile updated: ${username}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating profile: ${username}`, { error });
      throw error;
    }
  }

  // Profile methods
  public async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        throw new Error('No user session found');
      }
      
      const userData = JSON.parse(storedUser) as UserProfile;
      
      if (!userData || !userData.id) {
        throw new Error('Invalid user data in storage');
      }
      
      return {
        success: true,
        data: userData
      };
    } catch (error: any) {
      logger.error('Failed to get current user from session:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch current user from session',
        status: 401 // Unauthorized
      };
    }
  }

  public async getUserProfile(username: string): Promise<ApiResponse<UserProfile>> {
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
    profileData: ProfileInput
  ): Promise<ApiResponse<UserProfile>> {
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
    settings: UserSettingsUpdate
  ): Promise<ApiResponse<UserProfile>> {
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
  ): Promise<ApiResponse<{ profilePicture: string; url?: string }>> {
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
  public async followUser(_userId: string, targetUserId: string): Promise<ApiResponse<{ success: boolean }>> {
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

  public async unfollowUser(_userId: string, targetUserId: string): Promise<ApiResponse<{ success: boolean }>> {
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

  public async requestVerification(userId: string): Promise<ApiResponse<{ success: boolean }>> {
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
  public async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
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
  ): Promise<ApiResponse<{ users: UserProfile[]; total: number }>> {
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

  public async getFeaturedProfiles(): Promise<ApiResponse<{ users: UserProfile[] }>> {
    try {
      if (!isServer || !fs || !path) {
        logger.warn('getFeaturedProfiles is only available on the server side');
        return {
          success: false,
          error: 'This feature is only available on the server side',
          data: { users: [] }
        };
      }

      const configPath = path.join(process.cwd(), this.CONFIG_FILE);
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      
      return {
        success: true,
        data: {
          users: config.featuredProfiles
            .filter((profile: FeaturedProfileConfig) => profile.isActive)
            .sort((a: FeaturedProfileConfig, b: FeaturedProfileConfig) => 
              a.displayOrder - b.displayOrder
            )
        }
      };
    } catch (error: any) {
      logger.error('Error reading featured profiles config', { error });
      return {
        success: false,
        error: error.message || 'Failed to load featured profiles',
        data: { users: [] }
      };
    }
  }
}

// Export a singleton instance
export const profileService = ProfileService.getInstance();
export default profileService;
