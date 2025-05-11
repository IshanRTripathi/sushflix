const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');
const logger = require('../config/logger');
const User = require('../models/User');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fields: 1, // Only one file field
    files: 1, // Only one file
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    const validExt = ['.jpg', '.jpeg', '.png', '.webp'];
    
    if (allowedTypes.includes(file.mimetype) || validExt.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'));
    }
  }
});

// Profile Routes
router.get('/profile', (req, res) => {
  const username = req.user?.username;
  if (!username) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'User must be logged in to view profile'
    });
  }
  res.redirect(`/api/users/${username}`);
});

// User Profile Routes
router.get('/:username', asyncHandler(userController.getUserProfile));
router.get('/:username/stats', asyncHandler(userController.getUserStats));
router.get('/:username/posts', asyncHandler(userController.getUserPosts));

// Profile Picture Routes
router.post(
  '/:username/picture',
  upload.single('profilePicture'),
  asyncHandler(async (req, res) => {
    const { username } = req.params;
    const file = req.file;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded or invalid file type. Please upload a valid image (JPEG, JPG, PNG, or WebP).'
      });
    }

    try {
      const uploadResponse = await userController.uploadProfilePicture(username, file, req);
      
      if (!uploadResponse || !uploadResponse.success) {
        const statusCode = uploadResponse?.statusCode || 500;
        return res.status(statusCode).json({
          success: false,
          error: uploadResponse?.error || 'Failed to upload profile picture',
          profilePicture: null
        });
      }

      // Return the response with both profilePicture and url for backward compatibility
      return res.status(200).json({
        success: true,
        message: uploadResponse.message || 'Profile picture updated successfully',
        profilePicture: uploadResponse.url,
        url: uploadResponse.url // For backward compatibility
      });
    } catch (error) {
      logger.error('Profile picture upload error', {
        error: error.message,
        username,
        stack: error.stack
      });
      
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred while uploading the profile picture',
        profilePicture: null
      });
    }
  })
);

// Update user profile
router.patch(
  '/:username',
  asyncHandler(async (req, res) => {
    try {
      const { username } = req.params;
      const updates = req.body;

      // Validate request parameters
      if (!username || typeof username !== 'string') {
        logger.error('Invalid username parameter', {
          username,
          params: req.params
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid username parameter'
        });
      }

      // Validate updates
      if (!updates || Object.keys(updates).length === 0) {
        logger.error('No updates provided', {
          username,
          body: req.body
        });
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update'
        });
      }

      // Update user profile
      const user = await User.findOneAndUpdate(
        { username },
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -googleId -__v -createdAt -updatedAt');

      if (!user) {
        logger.error('User not found for patch user', { username });
        return res.status(404).json({
          success: false,
          error: 'User not found for patch user'
        });
      }

      logger.info('Profile updated successfully', {
        username,
        updatedFields: Object.keys(updates)
      });

      res.status(200).json(user);
    } catch (error) {
      logger.error('Profile update error', {
        error: error.message,
        stack: error.stack,
        username: req.params.username,
        updates: req.body
      });

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update profile'
      });
    }
  })
);

module.exports = router;
