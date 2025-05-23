import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// JWT payload type with type guard
export interface IJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Type guard for JWT payload
const isJwtPayload = (payload: unknown): payload is IJwtPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    'email' in payload &&
    'username' in payload &&
    'role' in payload
  );
};

/**
 * Middleware to verify JWT token and attach user to request
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from Authorization header or cookie
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
  
  if (!token) {
    res.status(401).json({ success: false, message: 'No authentication token provided' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Type check the decoded token
    if (!isJwtPayload(decoded)) {
      throw new Error('Invalid token payload');
    }

    // Attach user to request
    req.user = {
      _id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role as any, // Cast to any to avoid type issues with UserRole
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    } else {
      res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const authorize = (roles: string | string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRole = requiredRoles.length === 0 || 
                   userRoles.some(role => requiredRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to perform this action' 
      });
      return;
    }

    next();
  };
};
