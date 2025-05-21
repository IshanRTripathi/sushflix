import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// @ts-ignore - We'll handle the logger type separately
import logger from '../../../shared/config/logger.js';
// @ts-ignore - We'll handle the User model type separately
import User from '../../../profile/service/models/User.js';

dotenv.config();

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username?: string;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  username?: string;
  role?: string;
  [key: string]: any;
}

// Get JWT secret from environment variables
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Authentication middleware that verifies JWT tokens and checks user roles
 * @param roles - Array of role strings that are allowed to access the route
 * @returns Express middleware function
 */
// Import Response type from express
import { Response } from 'express';

// Helper function to send error response and stop execution
const sendError = (res: Response, status: number, message: string): never => {
  res.status(status).json({ message });
  throw new Error('Response sent'); // This will be caught by the outer try-catch
};

const auth = (roles: string[] = []): RequestHandler => {
  return async (req, res, next) => {
    logger.info('Auth middleware executed');

    // Get token from Authorization header
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Auth middleware: No token provided or invalid format');
      return sendError(res, 401, 'No token, authorization denied');
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      logger.warn('Auth middleware: Empty token');
      return sendError(res, 401, 'No token, authorization denied');
    }

    try {
      // Verify token with proper type assertion
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
      
      if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
        throw new Error('Invalid token payload');
      }
      
      // Add the username to the user object if it's not already present
      if (decoded.userId && !decoded.username) {
        try {
          const user = await User.findById(decoded.userId).select('username');
          if (user) {
            decoded.username = user.username;
          } else {
            logger.warn('User not found in database', { userId: decoded.userId });
            return sendError(res, 401, 'User not found');
          }
        } catch (error) {
          const err = error as Error;
          logger.error('Error looking up user', {
            error: err.message,
            userId: decoded.userId,
            stack: err.stack
          });
          return sendError(res, 500, 'Error authenticating user');
        }
      }
      
      // Attach user to request object
      req.user = decoded;

      // Check roles if provided
      if (roles.length > 0) {
        if (!decoded.role) {
          logger.warn('Auth middleware: No role in token');
          return sendError(res, 403, 'Insufficient permissions');
        }
        
        if (!roles.includes(decoded.role as string)) {
          logger.warn('Auth middleware: Insufficient permissions');
          return sendError(res, 403, 'Insufficient permissions');
        }
      }

      next();
    } catch (err) {
      const error = err as Error;
      logger.error('Auth middleware: Token verification failed', error);
      // Log the error but don't send a response here as it might have been sent already
      logger.error('Auth middleware: Error processing request', error);
      next(error);
    }
  };
};

export default auth;
