import { logger } from '../utils/logger';
import { UserProfile, FeaturedProfileConfig, EditableProfileFields } from '../types/user';
import { getProfile, getProfileByUsername, updateProfile, uploadProfilePicture } from '../services/apiService';
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
      const response = await getProfileByUsername(username);
      return response.data;
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

      const response = await getProfile(userId);
      const profile = response.data;

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

      // Save to database
      await updateProfile(userId, updatedProfile);
      
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

  public async updateProfilePicture(userId: string, file: File): Promise<string | null> {
    try {
      const response = await uploadProfilePicture(userId, file);
      return response.data.profilePicture;
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