import { Router } from 'express';
import * as userController from '../controllers/userController';
import { verifyToken } from '../../auth/server/middlewares/verifyToken';

const router = Router();

// Public route to get user by username
router.get('/:username', userController.getUserProfile);

// Protected route to get current user's profile
router.get('/me', verifyToken, (req, res) => {
  // The verifyToken middleware attaches the user to req.user
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  // Redirect to the user's profile using their username
  return res.redirect(`/api/users/${req.user.username}`);
});

export default router;
