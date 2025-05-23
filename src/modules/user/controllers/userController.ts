import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { IUser, IUserProfile } from '../../shared/types/user';
import { IUserStatsSummary } from '../../shared/types/user/user.stats';
import logger from '../../shared/config/logger';
import { Types } from 'mongoose';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (_request, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_request, file, callback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const hasValidExtension = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const hasValidMimetype = allowedTypes.test(file.mimetype);
    
    if (hasValidExtension && hasValidMimetype) {
      return callback(null, true);
    } else {
      callback(new Error('Only image files are allowed (jpeg, jpg, png, gif)!'));
    }
  }
});

// Extend Express Request type with our custom user type
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser & { _id: Types.ObjectId };
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

// Get current user's profile
export const getCurrentUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    const user = req.user;
    
    // Format response according to frontend's UserProfile type
    const userProfile: IUserProfile = {
      _id: user._id,
      userId: user._id.toString(),
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
    // Using _ to indicate unused parameter
    const { username, userId: _ } = req.params;
    
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
    const userProfile: IUserProfile = {
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
  // Get userId from params but mark as unused with _
  const { userId: _ } = req.params;
  
  // Set default date for the week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // End of current week (Saturday)
  try {
    // In a real application, you would fetch this from your database
    const stats: IUserStatsSummary = {
      totalPosts: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      totalSubscribers: 0,
      totalLikes: 0,
      totalComments: 0,
      totalViews: 0,
      engagementRate: 0,
      followersGrowth: 0,
      viewsGrowth: 0,
      engagementGrowth: 0,
      today: {
        date: new Date(),
        postViews: 0,
        profileViews: 0,
        newFollowers: 0,
        newSubscribers: 0,
        engagementRate: 0
      },
      thisWeek: {
        week: Math.ceil((now.getDate() + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7),
        year: now.getFullYear(),
        startDate: startOfWeek,
        endDate: endOfWeek,
        totalViews: 0,
        totalEngagement: 0,
        newFollowers: 0,
        newSubscribers: 0
      },
      thisMonth: {
        month: 0,
        year: 0,
        totalViews: 0,
        totalEngagement: 0,
        newFollowers: 0,
        newSubscribers: 0
      },
      thisYear: {
        year: 0,
        totalViews: 0,
        totalEngagement: 0,
        totalFollowers: 0,
        totalSubscribers: 0
      }
    };
    
    responseHelpers.success(res, stats);
  } catch (error) {
    responseHelpers.error(res, 'Failed to fetch user stats');
  }
};

// Get user's posts
export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Using _ to indicate unused parameter
    const { page = '1', limit = '10' } = req.query;
    
    // In a real application, you would fetch the user's posts from the database
    // with pagination
    const posts: any[] = [];
    
    responseHelpers.success(res, {
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    responseHelpers.error(res, 'Failed to fetch user posts');
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

// Delete profile picture
export const deleteProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {    
    responseHelpers.success(res, { message: 'Profile picture deleted successfully' });
  } catch (error) {
    responseHelpers.error(res, 'Failed to delete profile picture');
  }
};

// Upload profile picture
export const uploadProfilePicture = [
  upload.single('profilePicture'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        responseHelpers.error(res, 'No file uploaded', 400);
        return;
      }

      if (!req.user) {
        responseHelpers.error(res, 'User not authenticated', 401);
        return;
      }

      const userId = req.user._id;
      const username = req.user.username;
      
      // In a real application, you would save the file path to the user's profile
      // and handle file storage (e.g., AWS S3, Google Cloud Storage, etc.)
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Import User model dynamically to avoid circular dependencies
      const { default: User } = await import('../../profile/service/models/User');
      
      // Find user first
      const user = await User.findById(userId);
      if (!user) {
        logger.error('User not found', { userId });
        responseHelpers.error(res, 'User not found', 404);
        return;
      }

      // Save the old picture URL for cleanup
      const oldPictureUrl = user.profilePicture;

      // Update user's profile picture URL
      user.profilePicture = fileUrl;
      await user.save();

      // If there was an old picture, delete it from storage
      if (oldPictureUrl) {
        try {
          // In a real app, you would delete the old file from storage here
          logger.info('Old profile picture would be deleted', { username, oldPictureUrl });
        } catch (error) {
          // Log but don't fail the request if deletion fails
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Failed to delete old profile picture', {
            error: errorMessage,
            url: oldPictureUrl,
            username,
            stack: error instanceof Error ? error.stack : undefined
          });
        }
      }

      logger.info('Profile picture updated successfully', {
        username,
        newPictureUrl: fileUrl
      });

      responseHelpers.success(res, { fileUrl });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to upload profile picture', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      responseHelpers.error(res, 'Failed to upload profile picture');
    }
  }
];

export default {
  getCurrentUserProfile,
  getUserProfile,
  getUserStats,
  getUserPosts,
  uploadProfilePicture
};
