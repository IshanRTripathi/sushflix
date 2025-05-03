import { logger } from '../utils/logger';
import { UserProfile, FeaturedProfileConfig, EditableProfileFields } from '../types/user';
import { cacheService } from './cacheService';
import fs from 'fs/promises';
import path from 'path';

export class UserProfileService {
  private static instance: UserProfileService;
  private readonly CACHE_KEY_PREFIX = 'user_profile_';
  private readonly CONFIG_FILE = 'featured-profiles.json';
  private readonly PROFILES_DIR = 'public/profiles';

  private constructor() {
    logger.info('User profile service initialized');
    this.ensureProfilesDirectory();
  }

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  private async ensureProfilesDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.PROFILES_DIR, { recursive: true });
      logger.debug('Profiles directory ensured');
    } catch (error) {
      logger.error('Failed to create profiles directory', { error });
    }
  }

  private getCacheKey(userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`;
  }

  public async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      // TODO: Fetch profile from database by username
      // For now, return a mock profile
      const profile: UserProfile = {
        userId: `user_${username}`,
        username,
        displayName: `User ${username}`,
        email: `${username}@example.com`,
        profilePicture: `/profiles/${username}.jpg`,
        bio: 'This is a sample bio',
        socialLinks: {
          website: 'https://example.com',
          twitter: 'https://twitter.com/example',
          linkedin: 'https://linkedin.com/in/example'
        },
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      return profile;
    } catch (error) {
      logger.error(`Error getting profile by username: ${username}`, { error });
      return null;
    }
  }

  public async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(userId);
      const cachedProfile = cacheService.get<UserProfile>(cacheKey);
      
      if (cachedProfile) {
        logger.debug(`Cache hit for profile: ${userId}`);
        return cachedProfile;
      }

      // TODO: Fetch profile from database
      // For now, return a mock profile
      const profile: UserProfile = {
        userId,
        username: `user${userId}`,
        displayName: `User ${userId}`,
        email: `user${userId}@example.com`,
        profilePicture: `/profiles/${userId}.jpg`,
        bio: 'This is a sample bio',
        socialLinks: {
          website: 'https://example.com',
          twitter: 'https://twitter.com/example',
          linkedin: 'https://linkedin.com/in/example'
        },
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      // Cache the result
      cacheService.set(cacheKey, profile);
      logger.debug(`Cached profile: ${userId}`);

      return profile;
    } catch (error) {
      logger.error(`Error getting profile: ${userId}`, { error });
      return null;
    }
  }

  public async getFeaturedProfiles(): Promise<FeaturedProfileConfig[]> {
    try {
      const configPath = path.join(process.cwd(), this.CONFIG_FILE);
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      
      return config.featuredProfiles
        .filter((profile: FeaturedProfileConfig) => profile.isActive)
        .sort((a: FeaturedProfileConfig, b: FeaturedProfileConfig) => a.displayOrder - b.displayOrder);
    } catch (error) {
      logger.error('Error reading featured profiles config', { error });
      return [];
    }
  }

  public async updateProfile(userId: string, updates: EditableProfileFields): Promise<boolean> {
    try {
      // Get current profile
      const currentProfile = await this.getProfile(userId);
      if (!currentProfile) {
        logger.error(`Profile not found: ${userId}`);
        return false;
      }

      // Validate email if provided
      if (updates.email && !this.isValidEmail(updates.email)) {
        logger.error(`Invalid email format: ${updates.email}`);
        return false;
      }

      // Update profile fields
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...updates,
        lastUpdated: new Date()
      };

      // TODO: Save to database
      
      // Clear cache
      const cacheKey = this.getCacheKey(userId);
      cacheService.delete(cacheKey);
      
      logger.info(`Profile updated: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating profile: ${userId}`, { error });
      return false;
    }
  }

  public async updateProfilePicture(userId: string, file: Buffer, filename: string): Promise<string | null> {
    try {
      // Generate unique filename
      const extension = path.extname(filename);
      const uniqueFilename = `${userId}_${Date.now()}${extension}`;
      const filePath = path.join(this.PROFILES_DIR, uniqueFilename);

      // Save file
      await fs.writeFile(filePath, file);

      // Update profile with new picture path
      const success = await this.updateProfile(userId, {
        profilePicture: `/profiles/${uniqueFilename}`
      });

      if (!success) {
        // Clean up file if profile update failed
        await fs.unlink(filePath);
        return null;
      }

      return `/profiles/${uniqueFilename}`;
    } catch (error) {
      logger.error(`Error updating profile picture: ${userId}`, { error });
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const userProfileService = UserProfileService.getInstance(); 