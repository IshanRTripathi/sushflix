import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// @ts-ignore - We'll handle the logger type separately
import logger from '../config/logger.js';
// @ts-ignore - We'll handle the User model type separately
import User from '../models/User.js';

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
const auth = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Auth middleware executed');

    // Get token from Authorization header
    const authHeader = req.headers?.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      logger.warn('Auth middleware: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Add the username to the user object if it's not already present
      if (decoded.userId && !decoded.username) {
        try {
          const user = await User.findById(decoded.userId).select('username');
          if (user) {
            decoded.username = user.username;
          } else {
            logger.warn('User not found in database', { userId: decoded.userId });
            return res.status(401).json({ message: 'User not found' });
          }
        } catch (error) {
          const err = error as Error;
          logger.error('Error looking up user', {
            error: err.message,
            userId: decoded.userId,
            stack: err.stack
          });
          return res.status(500).json({ message: 'Error authenticating user' });
        }
      }
      
      // Attach user to request object
      req.user = decoded;

      // Check roles if provided
      if (roles.length > 0 && !decoded.role) {
        logger.warn('Auth middleware: No role in token');
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      if (roles.length > 0 && !roles.includes(decoded.role as string)) {
        logger.warn('Auth middleware: Insufficient permissions');
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      const error = err as Error;
      logger.error('Auth middleware: Token verification failed', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

export default auth;
