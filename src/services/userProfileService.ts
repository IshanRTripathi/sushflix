import { logger } from '../utils/logger';
import { UserProfile, FeaturedProfileConfig, EditableProfileFields } from '../types/user';
import { cacheService } from './cacheService';
import fs from 'fs/promises';
import path from 'path';
import { UserProfileModel } from '../models/UserProfile';
import { CacheService } from './cacheService';

export class UserProfileService {
  private static instance: UserProfileService;
  private readonly CACHE_KEY_PREFIX = 'user_profile_';
  private readonly CONFIG_FILE = 'featured-profiles.json';
  private readonly PROFILES_DIR = 'public/profiles';
  private profileModel: UserProfileModel;
  private cacheService: CacheService;

  private constructor() {
    logger.info('User profile service initialized');
    this.ensureProfilesDirectory();
    this.profileModel = new UserProfileModel();
    this.cacheService = CacheService.getInstance();
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
      logger.error('Failed to create profiles directory', error, { directory: this.PROFILES_DIR });
    }
  }

  private getCacheKey(userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`;
  }

  public async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      // Try to get from cache first
      const cachedProfile = await this.cacheService.getProfile(username);
      if (cachedProfile) {
        logger.debug('Cache hit for profile', { username });
        return cachedProfile;
      }

      // If not in cache, get from database
      const profile = await this.profileModel.getProfileByUsername(username);
      if (profile) {
        // Cache the profile
        await this.cacheService.setProfile(profile);
        logger.debug('Profile cached', { username });
      }
      return profile;
    } catch (error) {
      logger.error('Error getting profile by username', error, { username });
      throw error;
    }
  }

  public async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(userId);
      const cachedProfile = cacheService.get<UserProfile>(cacheKey);
      
      if (cachedProfile) {
        logger.debug('Cache hit for profile', { userId });
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
        lastUpdated: new Date(),
        stats: {
          posts: 0,
          followers: 0,
          subscribers: 0
        }
      };

      // Cache the result
      cacheService.set(cacheKey, profile);
      logger.debug('Profile cached', { userId });

      return profile;
    } catch (error) {
      logger.error('Error getting profile', error, { userId });
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
      logger.error('Error reading featured profiles config', error, { configFile: this.CONFIG_FILE });
      return [];
    }
  }

  public async updateProfile(userId: string, updates: EditableProfileFields): Promise<boolean> {
    try {
      const success = await this.profileModel.updateProfile(userId, updates);
      if (success) {
        // Invalidate cache for this profile
        const profile = await this.profileModel.getProfileByUserId(userId);
        if (profile) {
          await this.cacheService.setProfile(profile);
          logger.debug('Profile updated and cache refreshed', { userId });
        }
      }
      return success;
    } catch (error) {
      logger.error('Error updating profile', error, { userId, updates });
      throw error;
    }
  }

  public async updateProfilePicture(userId: string, file: ArrayBuffer, filename: string): Promise<string | null> {
    try {
      // TODO: Implement file upload to storage service (e.g., S3)
      const profilePictureUrl = `/uploads/${filename}`;
      
      const success = await this.profileModel.updateProfilePicture(userId, profilePictureUrl);
      if (success) {
        // Invalidate cache for this profile
        const profile = await this.profileModel.getProfileByUserId(userId);
        if (profile) {
          await this.cacheService.setProfile(profile);
          logger.debug('Profile picture updated and cache refreshed', { userId });
        }
        return profilePictureUrl;
      }
      return null;
    } catch (error) {
      logger.error('Error updating profile picture', error, { userId, filename });
      throw error;
    }
  }

  public async updateStats(userId: string, stats: Partial<UserProfile['stats']>): Promise<boolean> {
    try {
      const success = await this.profileModel.updateStats(userId, stats);
      if (success) {
        // Invalidate cache for this profile
        const profile = await this.profileModel.getProfileByUserId(userId);
        if (profile) {
          await this.cacheService.setProfile(profile);
          logger.debug('Profile stats updated and cache refreshed', { userId, stats });
        }
      }
      return success;
    } catch (error) {
      logger.error('Error updating profile stats', error, { userId, stats });
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const userProfileService = UserProfileService.getInstance(); 