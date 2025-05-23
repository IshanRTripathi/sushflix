import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// @ts-ignore - We'll handle the logger type separately
import logger from '../../../shared/config/logger.js';
// @ts-ignore - We'll handle the User model type separately
import User from '../../../profile/service/models/User.js';
import { User as SharedUser } from '../../../../modules/shared/types';

dotenv.config();

// JWT payload should match the shape expected by our User type
interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role?: string;
  [key: string]: any;
}

// Get JWT secret from environment variables
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Helper function to send error response
const sendError = (res: Response, status: number, message: string): void => {
  res.status(status).json({ success: false, message });
};

/**
 * Middleware to authenticate requests using JWT token
 * Attaches user to request if authenticated
 */
const auth = (): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from httpOnly cookie
      const token = req.cookies?.token;
      if (!token) {
        logger.warn('Auth middleware: No token provided');
        return sendError(res, 401, 'No authentication token, authorization denied');
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Check if user still exists
      const user = await User.findById(decoded.id).select('-password').lean();
      
      if (!user) {
        logger.warn('Auth middleware: User not found');
        return sendError(res, 401, 'User not found');
      }
      
      // Type assertion for user properties since we're using lean()
      const userData = user as any;
      
      // Create user object matching the shared User type
      const userObj: SharedUser = {
        id: user._id.toString(),
        username: userData.username || '',
        name: userData.displayName || userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatarUrl: userData.profilePicture || '',
        coverUrl: userData.coverPhoto || '',
        isCreator: userData.role === 'creator' || userData.role === 'admin',
        // Include role as an additional property if needed
        ...(userData.role && { role: userData.role } as any)
      };
      
      // Attach user to request object
      req.user = userObj;

      next();
    } catch (err) {
      logger.error('Auth middleware: Authentication failed', { error: err });
      sendError(res, 401, 'Authentication failed');
    }
  };
};

/**
 * Middleware to authorize users based on roles
 * Must be used after auth() middleware
 */
const authorize = (roles: string | string[] = []): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Authorize middleware: No user in request');
      return sendError(res, 401, 'Authentication required');
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Type assertion to access the role property which is not in the base User type
    const userRole = (req.user as any).role;
    
    if (requiredRoles.length > 0 && (!userRole || !requiredRoles.includes(userRole))) {
      logger.warn('Authorize middleware: Insufficient permissions', { 
        userRole,
        requiredRoles 
      });
      return sendError(res, 403, 'Insufficient permissions');
    }
    
    next();
  };
};

// Export both middlewares
export { auth, authorize };

export default {
  auth,
  authorize
};
