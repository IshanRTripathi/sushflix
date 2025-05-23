import { Request, Response } from 'express';
import { IUser, IUserProfile } from '../../shared/types/user';
import User from '../../profile/service/models/User';
import logger from '../../shared/config/logger';

// Extend Express Request type with our custom user type
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser & { _id: string };
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

/**
 * Get user profile by username
 * @route GET /api/users/:username
 * @access Public
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("getUserProfile for user called");
    const { username } = req.params;
    
    if (!username) {
      throw new ApiError(400, 'Username is required');
    }
    
    // Find user by username, excluding sensitive data
    const user = await User.findOne(
      { username },
      { password: 0, refreshToken: 0, __v: 0 }
    ).lean().exec();
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Type assertion for the response
    const userProfile: IUserProfile = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName || user.username,
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    sendSuccess(res, userProfile);
  } catch (error) {
    handleError(error, res);
  }
};
