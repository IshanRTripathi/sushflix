import { Types } from 'mongoose';
import { logger } from '../../shared/utils/logger';

// Import models using ES module imports
import FeaturedProfileModel from './models/FeaturedProfile';
import UserModel from './models/User';

// Types
interface IFeaturedProfileRequest {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bio: string;
  displayOrder: number;
  isActive: boolean;
  lastUpdated?: Date;
}

interface IFeaturedProfileResponse {
  userId: Types.ObjectId;
  profilePicture: string;
  username: string;
  displayName: string;
  bio: string;
  posts: number;
  followers: number;
  subscribers: number;
}

interface IUserLean {
  _id: Types.ObjectId;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  subscribersCount?: number;
}

class FeaturedProfileService {
  private FeaturedProfile: any; // Using any to avoid type issues with require
  private User: any; // Using any to avoid type issues with require

  constructor() {
    this.FeaturedProfile = FeaturedProfileModel;
    this.User = UserModel;
  }

  /**
   * Get featured profiles with user details
   */
  public async getFeaturedProfiles(): Promise<IFeaturedProfileResponse[]> {
    try {
      logger.info('Fetching featured profiles from database...');
      
      // Get active featured profiles
      const featuredProfiles = await this.FeaturedProfile
        .find({ isActive: true })
        .sort({ displayOrder: 1, lastUpdated: -1 })
        .limit(3)
        .lean();

      logger.info(`Found ${featuredProfiles?.length || 0} active featured profiles`);
      
      if (!featuredProfiles || featuredProfiles.length === 0) {
        logger.warn('No active featured profiles found in database');
        return [];
      }

      // Get user IDs from featured profiles with validation
      const userIds = featuredProfiles
        .map((profile: { userId?: Types.ObjectId | null }) => {
          if (!profile || !profile.userId) {
            logger.warn('Invalid profile data:', profile);
            return null;
          }
          return profile.userId;
        })
        .filter(Boolean)
        .filter((userId: any) => {
          try {
            new Types.ObjectId(userId);
            return true;
          } catch (error) {
            logger.error(`Invalid userId format: ${userId}`, { error });
            return false;
          }
        });

      if (userIds.length === 0) {
        logger.error('No valid user IDs found in featured profiles');
        return [];
      }

      // Fetch user details for featured profiles
      const users: IUserLean[] = await this.User.find({ _id: { $in: userIds } })
        .select('username displayName profilePicture bio')
        .lean();
        
      // Initialize default values since these fields aren't in the schema
      users.forEach(user => {
        (user as any).postsCount = 0;
        (user as any).followersCount = 0;
        (user as any).subscribersCount = 0;
      });

      if (users.length === 0) {
        logger.error('No user records found for featured profiles');
        return [];
      }

      // Create a map of user IDs to user objects for easy lookup
      const userMap = users.reduce<Record<string, IUserLean>>((acc, user) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});
      
      // Map the profiles to include user data
      const mappedProfiles = featuredProfiles
        .map((profile: { userId: Types.ObjectId; _id: Types.ObjectId } | null): IFeaturedProfileResponse | null => {
          if (!profile) return null;
          const user = userMap[profile.userId.toString()];
          
          if (!user) {
            logger.warn('User not found for profile:', { profileId: profile._id, userId: profile.userId });
            return null;
          }
          
          return {
            userId: user._id,
            profilePicture: user.profilePicture || '/default-avatar.png',
            username: user.username || 'Unknown User',
            displayName: user.displayName || user.username || 'Anonymous Creator',
            bio: user.bio || '',
            posts: user.postsCount || 0,
            followers: user.followersCount || 0,
            subscribers: user.subscribersCount || 0
          };
        })
        .filter((profile: IFeaturedProfileResponse | null): profile is IFeaturedProfileResponse => profile !== null);
      
      return mappedProfiles;
    } catch (error: any) {
      logger.error('Error in getFeaturedProfiles:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        errors: error.errors
      });
      return [];
    }
  }

  /**
   * Add a new featured profile
   */
  public async addFeaturedProfile(userId: string | Types.ObjectId, displayOrder: number): Promise<IFeaturedProfileResponse> {
    try {
      const featuredProfile = new this.FeaturedProfile({
        userId,
        displayOrder,
        isActive: true,
        lastUpdated: new Date()
      });
      
      await featuredProfile.save();
      return featuredProfile.toObject();
    } catch (error: any) {
      logger.error('Error adding featured profile:', error);
      throw error;
    }
  }

  /**
   * Update a featured profile's display order
   */
  public async updateFeaturedProfile(
    userId: string | Types.ObjectId,
    displayOrder: number
  ): Promise<IFeaturedProfileResponse | null> {
    try {
      const featuredProfile = await this.FeaturedProfile.findOne({ userId });
      
      if (!featuredProfile) {
        throw new Error('Featured profile not found');
      }
      
      featuredProfile.displayOrder = displayOrder;
      featuredProfile.lastUpdated = new Date();
      await featuredProfile.save();
      
      return featuredProfile.toObject();
    } catch (error: any) {
      logger.error('Error updating featured profile:', error);
      throw error;
    }
  }

  /**
   * Update a featured profile's active status
   */
  public async updateFeaturedProfileStatus(
    userId: string | Types.ObjectId,
    isActive: boolean
  ): Promise<IFeaturedProfileResponse | null> {
    try {
      const featuredProfile = await this.FeaturedProfile.findOne({ userId });
      
      if (!featuredProfile) {
        throw new Error('Featured profile not found');
      }
      
      featuredProfile.isActive = isActive;
      featuredProfile.lastUpdated = new Date();
      await featuredProfile.save();
      
      return featuredProfile.toObject();
    } catch (error: any) {
      logger.error('Error updating featured profile status:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new FeaturedProfileService();
