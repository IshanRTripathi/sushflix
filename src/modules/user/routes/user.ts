import { Request, Response, Router, NextFunction } from 'express';
import { Types } from 'mongoose';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { IUser } from '../../shared/types/user/user.core';
import * as userController from '../controllers/userController';
import { verifyToken } from '../../auth/server/middlewares/verifyToken';

// Types for user updates
interface UserUpdates {
  // Core user info
  email?: string;
  username?: string;
  
  // Profile info
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  
  // Media
  profilePicture?: string;
  coverPhoto?: string;
  
  // Preferences
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
}

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

// Initialize router
const router = Router();

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_request: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
    const allowedTypes = /jpe?g|png|gif/;
    const hasValidExtension = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const hasValidMimetype = allowedTypes.test(file.mimetype);
    
    if (hasValidExtension && hasValidMimetype) {
      callback(null, true);
    } else {
      callback(new Error('Only image files are allowed (jpeg, jpg, png, gif)!'));
    }
  }
});

// Authentication middleware - uses verifyToken to validate JWT
const authenticate = verifyToken;

// Ownership check middleware
const checkOwnership = (req: Request, res: Response, next: NextFunction): void => {
  const { username } = req.params;
  
  // req.user is now properly typed from verifyToken middleware
  const user = req.user as IUser & { _id: Types.ObjectId };
  
  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  
  if (user.username !== username) {
    res.status(403).json({ 
      success: false, 
      message: 'You do not have permission to perform this action' 
    });
    return;
  }
  
  next();
};

// Public routes
router.get('/:username', userController.getUserProfile);
router.get('/:username/stats', userController.getUserStats);
router.get('/:username/posts', userController.getUserPosts);

// Protected routes (require authentication)
router.get('/me', authenticate, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'User must be logged in to view profile' 
    });
    return;
  }
  res.redirect(`/api/users/${req.user.username}`);
});

// Protected routes (require authentication and ownership)
router.put(
  '/:username',
  authenticate,
  checkOwnership,
  userController.updateUserProfile
);

router.delete(
  '/:username',
  authenticate,
  checkOwnership,
  userController.deleteUser
);

// Profile picture upload
router.post(
  '/:username/picture',
  authenticate,
  checkOwnership,
  upload.single('profilePicture'),
  userController.uploadProfilePicture
);

// Cover photo upload
router.post(
  '/:username/cover',
  authenticate,
  checkOwnership,
  upload.single('coverPhoto'),
  userController.uploadProfilePicture
);

// Update profile info
router.patch(
  '/:username',
  authenticate,
  checkOwnership,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      const updates: UserUpdates = req.body;

      // Input validation
      if (!username || typeof username !== 'string') {
        console.warn('Invalid username in patch request', { username });
        res.status(400).json({ success: false, error: 'Invalid username parameter' });
        return;
      }

      if (!updates || Object.keys(updates).length === 0) {
        console.warn('No updates provided in patch request', { username });
        res.status(400).json({ success: false, error: 'No updates provided' });
        return;
      }

      // Validate update fields
      const allowedUpdates = [
        // Core user info
        'email', 'username',
        // Profile info
        'displayName', 'bio', 'location', 'website',
        // Media
        'profilePicture', 'coverPhoto',
        // Preferences
        'preferences'
      ];

      const updateFields = Object.keys(updates);
      const invalidUpdates = updateFields.filter(field => !allowedUpdates.includes(field));

      if (invalidUpdates.length > 0) {
        console.warn('Invalid update fields', { username, invalidUpdates });
        res.status(400).json({ 
          success: false, 
          error: 'Invalid updates',
          invalidFields: invalidUpdates
        });
        return;
      }

      // Validate email format if provided
      if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid email format' 
        });
        return;
      }

      // Validate website URL format if provided
      if (updates.website && !/^https?:\/\//.test(updates.website)) {
        res.status(400).json({ 
          success: false, 
          error: 'Website URL must start with http:// or https://' 
        });
        return;
      }

      // Call the controller to handle the update
      req.body = updates;
      await userController.updateUserProfile(req as Request, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating user profile:', errorMessage);

      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        details: errorMessage
      });
    }
  }
);

export default router;
