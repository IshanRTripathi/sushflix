import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';
import { logger } from '../utils/logger';
import { UserProfile, SocialLinks } from '../types/user';

export class UserProfileModel {
  private collection: Collection<UserProfile>;

  constructor() {
    this.collection = getDatabase().collection<UserProfile>('userProfiles');
    this.setupIndexes();
  }

  private async setupIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ username: 1 }, { unique: true });
      await this.collection.createIndex({ userId: 1 }, { unique: true });
      await this.collection.createIndex({ 'stats.followers': -1 });
      logger.info('Created indexes for userProfiles collection');
    } catch (error) {
      logger.error('Error setting up indexes', error, { collection: 'userProfiles' });
    }
  }

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      return await this.collection.findOne({ username });
    } catch (error) {
      logger.error('Error getting profile by username', error, { username });
      throw error;
    }
  }

  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      return await this.collection.findOne({ userId });
    } catch (error) {
      logger.error('Error getting profile by userId', error, { userId });
      throw error;
    }
  }

  async createProfile(profile: Omit<UserProfile, 'createdAt' | 'lastUpdated'>): Promise<UserProfile> {
    try {
      const now = new Date();
      const defaultStats = {
        posts: 0,
        followers: 0,
        subscribers: 0
      };
      
      const newProfile: UserProfile = {
        ...profile,
        createdAt: now,
        lastUpdated: now,
        stats: {
          ...defaultStats,
          ...(profile.stats || {})
        }
      };

      const result = await this.collection.insertOne(newProfile);
      logger.info('Profile created', { userId: profile.userId, username: profile.username });
      return { ...newProfile, _id: result.insertedId };
    } catch (error) {
      logger.error('Error creating profile', error, { userId: profile.userId, username: profile.username });
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const result = await this.collection.updateOne(
        { userId },
        {
          $set: {
            ...updates,
            lastUpdated: new Date()
          }
        }
      );
      logger.debug('Profile updated', { userId, updates });
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Error updating profile', error, { userId, updates });
      throw error;
    }
  }

  async updateProfilePicture(userId: string, profilePicture: string): Promise<boolean> {
    try {
      const result = await this.collection.updateOne(
        { userId },
        {
          $set: {
            profilePicture,
            lastUpdated: new Date()
          }
        }
      );
      logger.debug('Profile picture updated', { userId });
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Error updating profile picture', error, { userId });
      throw error;
    }
  }

  async updateStats(userId: string, stats: Partial<UserProfile['stats']>): Promise<boolean> {
    try {
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      const result = await this.collection.updateOne(
        { userId },
        {
          $set: {
            'stats': {
              ...currentProfile.stats,
              ...stats
            },
            lastUpdated: new Date()
          }
        }
      );
      logger.debug('Profile stats updated', { userId, stats });
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Error updating profile stats', error, { userId, stats });
      throw error;
    }
  }

  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ userId });
      logger.info('Profile deleted', { userId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting profile', error, { userId });
      throw error;
    }
  }
} 