import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { User as SharedUser } from '../../shared/types';
import logger from '../../shared/config/logger';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Extend Express Request type with custom properties
declare module 'express-serve-static-core' {
  interface Request {
    user?: SharedUser;
    file?: Express.Multer.File;
    files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
  }
}

// Helper functions for consistent responses
const responseHelpers = {
  success: <T>(res: Response, data: T, statusCode = 200): void => {
    res.status(statusCode).json({
      success: true,
      data
    });
  },
  
  error: (res: Response, error: string, statusCode = 500, details?: unknown): void => {
    res.status(statusCode).json({
      success: false,
      error,
      details
    });
  }
};

// Custom error class for API errors
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Handle errors consistently
const handleError = (error: unknown, res: Response): void => {
  if (error instanceof ApiError) {
    responseHelpers.error(res, error.message, error.statusCode, error.details);
  } else if (error instanceof Error) {
    logger.error('Unexpected error:', error);
    responseHelpers.error(res, 'An unexpected error occurred', 500, error.stack);
  } else {
    logger.error('Non-Error object thrown:', error);
    responseHelpers.error(res, 'An unknown error occurred', 500);
  }
};

// Success response helper
const sendSuccess = <T>(res: Response, data: T, statusCode = 200): void => {
  responseHelpers.success(res, data, statusCode);
};

// Types
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
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  isCreator: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Get current user's profile
export const getCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    const user = req.user;
    
    // Format response according to frontend's UserProfile type
    const userProfile: UserProfile = {
      id: user.id,
      userId: user.id,
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      emailVerified: user.emailVerified || false,
      displayName: user.displayName || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      coverPhoto: user.coverPhoto,
      socialLinks: user.socialLinks || {},
      isCreator: user.isCreator || false,
      isVerified: user.isVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        subscriberCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
        },
      },
      theme: 'light',
      notifications: {
        email: true,
        push: true,
      },
    };

    sendSuccess(res, userProfile);
  } catch (error) {
    handleError(error, res);
  }
};

// Get user profile by username
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      throw new ApiError(400, 'Username is required');
    }
    
    // In a real application, you would fetch the user from the database
    // For now, we'll return a mock response
    const user = {
      _id: '123',
      id: '123',
      username,
      email: `${username}@example.com`,
      role: 'user',
      emailVerified: true,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      bio: 'This is a sample bio',
      profilePicture: `https://ui-avatars.com/api/?name=${username}&background=random`,
      coverPhoto: 'https://picsum.photos/1200/300',
      socialLinks: {},
      isCreator: false,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Format response according to frontend's UserProfile type
    const userProfile: UserProfile = {
      id: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      bio: user.bio,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      socialLinks: user.socialLinks,
      isCreator: user.isCreator,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        subscriberCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
        },
      },
      theme: 'light',
      notifications: {
        email: true,
        push: true,
      },
    };

    sendSuccess(res, userProfile);
  } catch (error) {
    handleError(error, res);
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      throw new ApiError(400, 'Username is required');
    }
    
    // In a real application, you would fetch the stats from the database
    // For now, we'll return a mock response
    const stats = {
      posts: 10,
      followers: 100,
      following: 50,
      subscriberCount: 25,
      lastUpdated: new Date().toISOString(),
    };

    sendSuccess(res, stats);
  } catch (error) {
    handleError(error, res);
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const updates = req.body;
    
    if (!username) {
      throw new ApiError(400, 'Username is required');
    }
    
    // In a real application, you would update the user in the database
    // For now, we'll return a success response with the updated data
    const updatedUser = {
      _id: '123',
      id: '123',
      username,
      ...updates,
      updatedAt: new Date(),
    };

    sendSuccess(res, updatedUser);
  } catch (error) {
    handleError(error, res);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    
    if (!username) {
      throw new ApiError(400, 'Username is required');
    }
    
    // In a real application, you would delete the user from the database
    // For now, we'll return a success response
    sendSuccess(res, { message: `User ${username} deleted successfully` });
  } catch (error) {
    handleError(error, res);
  }
};

// Upload profile picture
export const uploadProfilePicture = [
  upload.single('profilePicture'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      const file = req.file;

      if (!username) {
        throw new ApiError(400, 'Username is required');
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
    const { default: User } = await import('../../profile/service/models/User');
    
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
