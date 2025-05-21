import { Request, Response, RequestHandler, Router } from 'express';
import multer from 'multer';
import path from 'path';
import asyncHandler from 'express-async-handler';
import logger from '../../shared/config/logger.js';
import auth from '../../auth/server/middlewares/auth.js';
import { isOwner } from '../../auth/server/middlewares/ownership.js';
import * as userController from '../controllers/userController.js';

// Types for user updates
interface UserUpdates {
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  [key: string]: any;
}

// Extend Request to include user and file
interface AuthenticatedRequest extends Request {
  user?: {
    _id?: string;
    userId?: string;
    username?: string;
    role?: string;
    [key: string]: any;
  };
  file?: Express.Multer.File;
}

// Set up multer config for memory upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    fields: 1,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    const validExt = ['.jpg', '.jpeg', '.png', '.webp'];

    if (allowedTypes.includes(file.mimetype) && validExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'));
    }
  },
});

const router = Router();

// Redirect to authenticated user's profile
router.get(
  '/profile',
  auth() as RequestHandler,
  (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;
    const username = authReq.user?.username;
    
    if (!username) {
      res.status(401).json({
        success: false,
        message: 'User must be logged in to view profile',
      });
      return;
    }
    res.redirect(`/api/users/${username}`);
  }
);

// Public profile and stats
router.get('/:username', asyncHandler(userController.getUserProfile as RequestHandler));
router.get('/:username/stats', asyncHandler(userController.getUserStats as RequestHandler));
router.get('/:username/posts', asyncHandler(userController.getUserPosts as RequestHandler));

// Upload profile picture
router.post(
  '/:username/picture',
  auth() as RequestHandler,
  isOwner('username') as RequestHandler,
  upload.single('profilePicture'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username } = req.params;
    const file = (req as AuthenticatedRequest).file;

    if (!username || typeof username !== 'string') {
      res.status(400).json({ success: false, error: 'Username is required' });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded or invalid file type. Please upload a JPEG, JPG, PNG, or WebP image.',
      });
      return;
    }

    try {
      await userController.uploadProfilePicture(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Failed to upload profile picture', {
        error: errorMessage,
        username,
        stack: errorStack,
      });

      res.status(500).json({
        success: false,
        error: 'Unexpected error uploading profile picture',
      });
    }
  })
);

// Patch profile info
router.patch(
  '/:username',
  auth() as RequestHandler,
  isOwner('username') as RequestHandler,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username } = req.params;
    const updates: UserUpdates = req.body;

    // Input validation
    if (!username || typeof username !== 'string') {
      logger.warn('Invalid username in patch request', { username });
      res.status(400).json({ success: false, error: 'Invalid username parameter' });
      return;
    }

    if (!updates || Object.keys(updates).length === 0) {
      logger.warn('No updates provided in patch request', { username });
      res.status(400).json({ success: false, error: 'No updates provided' });
      return;
    }

    // Validate update fields
    const allowedUpdates = ['name', 'email', 'bio', 'avatar'];
    const isValidOperation = Object.keys(updates).every(update =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      const invalidFields = Object.keys(updates).filter(f => !allowedUpdates.includes(f));
      logger.warn('Invalid update fields in patch request', {
        username,
        invalidFields,
      });
      res.status(400).json({ success: false, error: 'Invalid update fields' });
      return;
    }

    try {
      // Import User model
      const { default: User } = await import('@/modules/profile/service/models/User');

      const user = await User.findOneAndUpdate(
        { username },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        logger.warn('User not found for update', { username });
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      logger.info('User profile updated successfully', { username });
      res.status(200).json({
        success: true,
        data: user.toObject({ getters: true }),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating user profile', {
        error: errorMessage,
        username,
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update profile',
        });
      }
    }
  })
);

export default router;
