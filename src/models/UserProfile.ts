import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';
import { UserProfile } from '../types/user';
import logger from '../utils/logger';
import { ensureDirectoryExists } from '../utils/fileSystem';
import path from 'path';

export class UserProfileModel {
  private static instance: UserProfileModel;
  private collection: Collection<UserProfile>;
  private readonly PROFILES_DIR = path.join(process.cwd(), 'data', 'profiles');

  private constructor() {
    this.collection = getDatabase().collection<UserProfile>('profiles');
    this.setupIndexes();
  }

  public static getInstance(): UserProfileModel {
    if (!UserProfileModel.instance) {
      UserProfileModel.instance = new UserProfileModel();
    }
    return UserProfileModel.instance;
  }

  private async setupIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ username: 1 }, { unique: true });
      await this.collection.createIndex({ userId: 1 }, { unique: true });
      await this.collection.createIndex({ 'stats.followers': -1 });
      logger.info('Profile indexes created');
    } catch (error) {
      logger.error('Error setting up profile indexes:', error);
    }
  }

  public async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      return await this.collection.findOne({ username });
    } catch (error) {
      logger.error('Error getting profile by username:', error);
      return null;
    }
  }

  public async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      return await this.collection.findOne({ userId });
    } catch (error) {
      logger.error('Error getting profile by user ID:', error);
      return null;
    }
  }

  public async createProfile(profile: Omit<UserProfile, '_id' | 'createdAt' | 'lastUpdated' | 'stats'>): Promise<UserProfile | null> {
    try {
      const newProfile: UserProfile = {
        ...profile,
        _id: new ObjectId(),
        createdAt: new Date(),
        lastUpdated: new Date(),
        stats: {
          posts: 0,
          followers: 0,
          subscribers: 0
        }
      };

      const result = await this.collection.insertOne(newProfile);
      if (result.acknowledged) {
        return newProfile;
      }
      return null;
    } catch (error) {
      logger.error('Error creating profile:', error);
      return null;
    }
  }

  public async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...updates,
            lastUpdated: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result || null;
    } catch (error) {
      logger.error('Error updating profile:', error);
      return null;
    }
  }

  public async updateProfilePicture(userId: string, file: File): Promise<UserProfile | null> {
    try {
      await ensureDirectoryExists(this.PROFILES_DIR);
      const filename = `${userId}-${Date.now()}-${file.name}`;
      const filePath = path.join(this.PROFILES_DIR, filename);
      
      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Save file to disk
      await require('fs').promises.writeFile(filePath, buffer);
      
      const profilePictureUrl = `/uploads/${filename}`;
      
      const result = await this.collection.findOneAndUpdate(
        { userId },
        {
          $set: {
            profilePicture: profilePictureUrl,
            lastUpdated: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result || null;
    } catch (error) {
      logger.error('Error updating profile picture:', error);
      return null;
    }
  }

  public async updateStats(userId: string, stats: Partial<UserProfile['stats']>): Promise<UserProfile | null> {
    try {
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        return null;
      }

      const updatedStats = {
        ...currentProfile.stats,
        ...stats
      };

      const result = await this.collection.findOneAndUpdate(
        { userId },
        {
          $set: {
            stats: updatedStats,
            lastUpdated: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result || null;
    } catch (error) {
      logger.error('Error updating stats:', error);
      return null;
    }
  }

  public async deleteProfile(userId: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ userId });
      return result.deletedCount === 1;
    } catch (error) {
      logger.error('Error deleting profile:', error);
      return false;
    }
  }
} 