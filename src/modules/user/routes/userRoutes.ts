import { Router } from 'express';
import * as userController from '../controllers/userController';
import { auth } from '../../auth/server/middlewares/auth';
import { logger } from '../../shared/utils';

const router = Router();

// Public route to get user by username
router.get('/:username', userController.getUserProfile);

// Protected route to get current user's profile
router.get('/me', auth(), (req, res) => {
  // The auth middleware ensures req.user exists and is valid
  logger.info(`/me endpoint reached, redirecting to user ${req.user!.username}`);
  return res.redirect(`/api/users/${req.user!.username}`);
});

export default router;
