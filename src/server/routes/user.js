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

router.get('/:username/stats', userController.getUserStats);
router.post(
  '/:username/profile-picture',
  upload.single('file'),
  asyncHandler(async (req, res, next) => {
    try {
      const { username } = req.params;
      const file = req.file;

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

      if (!file) {
        logger.error('No file uploaded in request', {
          headers: req.headers,
          body: req.body
        });
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Call the controller function
      await userController.uploadProfilePicture(username, file, req, res);
    } catch (error) {
      logger.error('Profile picture upload error', {
        error: error.message,
        stack: error.stack,
        username: req.params.username
      });

      if (error.name === 'MulterError') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload profile picture'
      });
    }
  })
);
router.get('/:username', userController.getUserProfile);

// Update user profile
router.patch(
  '/:username',
  asyncHandler(async (req, res, next) => {
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
        logger.error('User not found', { username });
        return res.status(404).json({
          success: false,
          error: 'User not found'
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
