import { Request, Response, NextFunction } from 'express';
import { IUserDocument } from '../models/User';
import { IPostDocument } from '../models/Post';
import { uploadFile, deleteFile } from '../services/StorageService';
import logger from '../../shared/config/logger';

// Types
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

interface UserStats {
  posts?: number;
  followers: number;
  following: number;
  subscriberCount?: number;
  lastUpdated?: string;
}

interface UserProfile {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  displayName: string;
  bio: string;
  profilePicture: string;
  coverPhoto?: string;
  socialLinks?: Record<string, string>;
  stats: UserStats;
  preferences?: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  isCreator: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

// Get current user's profile
export const getCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User must be logged in to view profile'
      });
      return;
    }

    // Format response with default values
    const ensureAbsoluteUrl = (url?: string): string => {
      if (!url) return '/default-avatar.png';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return url;
      return `/${url}`;
    };

    const userProfile: Partial<UserProfile> = {
      username: user.username,
      displayName: user.displayName || user.username,
      profilePicture: ensureAbsoluteUrl(user.profilePicture),
      isCreator: user.isCreator || false,
      email: user.email,
      stats: {
        posts: 0,
        followers: 0,
        following: 0
      }
    };

    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('../models/User');
    const { default: Post } = await import('../models/Post');

    // Get stats
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      User.countDocuments({ following: user._id }),
      User.countDocuments({ followers: user._id })
    ]);

    userProfile.stats = {
      posts: postsCount,
      followers: followersCount,
      following: followingCount
    };

    res.status(200).json(userProfile);
  } catch (error) {
    logger.error('Error fetching current user profile:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching the current user profile.'
    });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('../models/User');
    const { default: Post } = await import('../models/Post');
    
    // Find user with populated fields
    const user = await User.findOne({ username })
      .select('-password -googleId -__v -createdAt -updatedAt')
      .lean();

    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user profile could not be found.'
      });
      return;
    }

    // Helper function to ensure URL is absolute
    const ensureAbsoluteUrl = (url?: string): string => {
      if (!url) return '/default-avatar.svg';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return url;
      return `/${url}`;
    };

    // Format response according to frontend's UserProfile type
    const userProfile: UserProfile = {
      id: user._id.toString(),
      userId: user._id.toString(),
      username: user.username,
      email: user.email || '',
      role: user.role || 'user',
      emailVerified: user.emailVerified || false,
      displayName: user.displayName || user.username,
      bio: user.bio || '',
      profilePicture: ensureAbsoluteUrl(user.profilePicture),
      coverPhoto: user.coverPhoto || '',
      socialLinks: user.socialLinks || {},
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        subscriberCount: 0
      },
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true
        }
      },
      isCreator: user.isCreator || false,
      isVerified: user.isVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };

    // Get stats
    const [postCount, followerCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      User.countDocuments({ following: user._id }),
      User.countDocuments({ followers: user._id })
    ]);

    // Update stats with correct property names
    userProfile.stats = {
      posts: postCount,
      followers: followerCount,
      following: followingCount,
      subscriberCount: 0 // Add this if you have subscribers
    };

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(userProfile);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching the user profile.'
    });
  }
};

// Get user posts
export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const { default: User } = await import('../models/User');
    const { default: Post } = await import('../models/Post');
    
    const user = await User.findOne({ username });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture');

    res.status(200).json(posts);
  } catch (error) {
    logger.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const { default: User } = await import('../models/User');
    const { default: Post } = await import('../models/Post');
    
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user stats could not be found.'
      });
      return;
    }

    // Get all stats in parallel
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      User.countDocuments({ following: user._id }),
      User.countDocuments({ followers: user._id })
    ]);

    const stats: UserStats = {
      posts: postsCount || 0,
      followers: followersCount || 0,
      following: followingCount || 0,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(stats);
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching user statistics.'
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;
  const file = req.file;
  
  try {
    // Validate request parameters
    if (!username || typeof username !== 'string') {
      logger.error('Invalid username parameter', {
        username,
        params: req.params
      });
      res.status(400).json({
        success: false,
        error: 'Invalid username parameter'
      });
      return;
    }

    if (!file) {
      logger.error('No file uploaded in request', {
        headers: req.headers,
        body: req.body,
        files: req.files
      });
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
      return;
    }

    // Ensure file has required properties
    if (!file.originalname || !file.mimetype || !file.size || !file.buffer) {
      logger.error('Invalid file properties', {
        username,
        fileProps: Object.keys(file),
        hasBuffer: !!file.buffer
      });
      res.status(400).json({
        success: false,
        error: 'Invalid file properties'
      });
      return;
    }

    // Upload the file to storage (GCS or local)
    const uploadResponse: UploadResponse = await uploadFile(username, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (!uploadResponse.success) {
      logger.error('Failed to upload to storage', {
        error: uploadResponse.error,
        response: uploadResponse,
        username,
        file: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      });
      res.status(500).json({
        success: false,
        error: uploadResponse.error || 'Failed to upload file to storage'
      });
      return;
    }

    // Import User model dynamically to avoid circular dependencies
    const { default: User } = await import('../models/User');
    
    // Find user first
    const user = await User.findOne({ username });
    if (!user) {
      logger.error('User not found', { username });
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Save the old picture URL for cleanup
    const oldPictureUrl = user.profilePicture;

    // Update user's profile picture URL
    user.profilePicture = uploadResponse.fileUrl || '';
    await user.save();

    // If there was an old picture, delete it from storage
    if (oldPictureUrl) {
      try {
        // Extract just the filename from the URL
        const oldFileName = oldPictureUrl.split('/').pop();
        if (oldFileName) {
          await deleteFile(oldFileName);
          logger.info('Old profile picture deleted', { username, oldFileName });
        }
      } catch (deleteError) {
        // Log but don't fail the request if deletion fails
        logger.error('Failed to delete old profile picture', {
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
          url: oldPictureUrl,
          username,
          stack: deleteError instanceof Error ? deleteError.stack : undefined
        });
      }
    }

    logger.info('Profile picture updated successfully', {
      username,
      newPictureUrl: uploadResponse.fileUrl
    });

    res.json({
      success: true,
      url: uploadResponse.fileUrl,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Profile picture upload error', {
      error: errorMessage,
      stack: errorStack,
      username: username || 'unknown'
    });
    
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while uploading the profile picture'
    });
  }
};

export default {
  getCurrentUserProfile,
  getUserProfile,
  getUserStats,
  getUserPosts,
  uploadProfilePicture
};
