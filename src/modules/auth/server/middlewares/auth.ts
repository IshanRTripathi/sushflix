import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '../../../shared/utils/logger';
import User from '../../../profile/service/models/User';
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
      logger.debug('Auth middleware processing request', {
        path: req.path,
        method: req.method,
        headers: {
          authorization: req.headers.authorization ? 'present' : 'missing'
        }
      });

      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('No Bearer token in Authorization header');
        logger.warn('Auth middleware: No token provided in Authorization header', { 
          path: req.path,
          headers: Object.keys(req.headers)
        });
        return sendError(res, 401, 'No authentication token, authorization denied');
      }
      
      const token = authHeader.split(' ')[1];
      if (!token) {
        logger.warn('Auth middleware: Invalid token format', {
          authorizationHeader: authHeader
        });
        return sendError(res, 401, 'Invalid token format');
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        logger.debug('JWT token verified successfully', {
          userId: decoded.id,
          username: decoded.username,
          decodedPayload: decoded // Log full decoded payload for debugging
        });
      } catch (jwtError) {
        logger.error('JWT verification failed', {
          error: jwtError,
          token: token.substring(0, 10) + '...' // Log first 10 chars for debugging
        });
        return sendError(res, 401, 'Invalid or expired token');
      }

      // Check if we have enough data to look up the user
      if (!decoded.id && !decoded.username) {
        logger.error('JWT payload missing required fields', { decoded });
        return sendError(res, 401, 'Invalid token payload');
      }

      // Try to find user by ID or username
      let user;
      try {
        const query = decoded.id 
          ? { _id: decoded.id }
          : { username: decoded.username };
          
        logger.debug('Looking up user in database', { query });
        
        user = await User.findOne(query).select('-password').lean();
        
        if (!user) {
          logger.warn('User not found in database', { 
            query,
            decodedPayload: decoded
          });
          return sendError(res, 401, 'User not found');
        }
      } catch (dbError) {
        logger.error('Database error during user lookup', { 
          error: dbError,
          decoded
        });
        return sendError(res, 500, 'Error looking up user');
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
        profilePicture: userData.profilePicture || '',
        isCreator: userData.role === 'creator' || userData.role === 'user',
        ...(userData.role && { role: userData.role } as any)
      };
      req.user = userObj;
      next();
    } catch (err) {
      logger.error('Auth middleware: Authentication failed', { 
        error: err,
        path: req.path,
        method: req.method,
        headers: {
          authorization: req.headers.authorization ? 'present' : 'missing'
        }
      });
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
