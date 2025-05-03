import logger from '../utils/logger';
import { UserProfile, FeaturedProfileConfig, EditableProfileFields } from '../types/user';
import { CacheService } from './cacheService';
import fs from 'fs/promises';
import path from 'path';
import { UserProfileModel } from '../models/UserProfile';
import { ensureDirectoryExists, readJsonFile } from '../utils/fileSystem';

export class UserProfileService {
  private static instance: UserProfileService;
  private readonly CACHE_KEY_PREFIX = 'user_profile_';
  private readonly CONFIG_FILE = 'featured-profiles.json';
  private readonly PROFILES_DIR = 'public/profiles';
  private profileModel: UserProfileModel;
  private cacheService: CacheService;
  private readonly FEATURED_PROFILES_CONFIG = path.join(process.cwd(), 'config', 'featured-profiles.json');

  private constructor() {
    logger.info('User profile service initialized');
    this.ensureProfilesDirectory();
    this.profileModel = UserProfileModel.getInstance();
    this.cacheService = CacheService.getInstance();
    this.initialize();
  }

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await ensureDirectoryExists(this.PROFILES_DIR);
    } catch (error) {
      logger.error('Failed to create profiles directory', { error });
    }
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
      // Check cache first
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
      logger.error('Error fetching profile:', error);
      return null;
    }
  }

  public async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(userId);
      const cachedProfile = this.cacheService.get<UserProfile>(cacheKey);
      
      if (cachedProfile) {
        logger.debug('Cache hit for profile', { userId });
        return cachedProfile;
      }

      const profile = await this.profileModel.getProfileByUserId(userId);
      if (profile) {
        // Cache the result
        this.cacheService.set(cacheKey, profile);
        logger.debug('Profile cached', { userId });
      }
      return profile;
    } catch (error) {
      logger.error('Error getting profile', error, { userId });
      return null;
    }
  }

  public async getFeaturedProfiles(): Promise<UserProfile[]> {
    try {
      const config = await readJsonFile<{ featuredProfiles: Array<{ userId: string; username: string }> }>(
        this.FEATURED_PROFILES_CONFIG
      );
      
      const profiles: UserProfile[] = [];
      for (const featured of config.featuredProfiles) {
        const profile = await this.getProfileByUsername(featured.username);
        if (profile) {
          profiles.push(profile);
        }
      }
      return profiles;
    } catch (error) {
      logger.error('Error reading featured profiles config', { error });
      return [];
    }
  }

  public async updateProfile(userId: string, updates: Partial<EditableProfileFields>): Promise<UserProfile | null> {
    try {
      const updatedProfile = await this.profileModel.updateProfile(userId, updates);
      if (updatedProfile) {
        // Update cache
        await this.cacheService.setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (error) {
      logger.error('Error updating profile:', error);
      return null;
    }
  }

  public async updateProfilePicture(userId: string, file: File): Promise<UserProfile | null> {
    try {
      const updatedProfile = await this.profileModel.updateProfilePicture(userId, file);
      if (updatedProfile) {
        // Update cache
        await this.cacheService.setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (error) {
      logger.error('Error updating profile picture:', error);
      return null;
    }
  }

  public async updateStats(userId: string, stats: Partial<UserProfile['stats']>): Promise<UserProfile | null> {
    try {
      const updatedProfile = await this.profileModel.updateStats(userId, stats);
      if (updatedProfile) {
        // Update cache
        await this.cacheService.setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (error) {
      logger.error('Error updating stats:', error);
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const userProfileService = UserProfileService.getInstance(); 