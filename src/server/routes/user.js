const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');
const logger = require('../config/logger');

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
    if (allowedTypes.includes(file.mimetype)) {
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
      // Check if request was cancelled
      if (req.aborted) {
        logger.warn('Request cancelled before processing', {
          username: req.params.username,
          path: req.path,
          method: req.method
        });
        return res.status(499).json({
          success: false,
          error: 'Request cancelled'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        logger.error('No file uploaded in request', {
          headers: req.headers
        });
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Proceed with the controller
      const username = req.params.username;
      const file = req.file;
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

      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  })
);
router.get('/:username', userController.getUserProfile);

module.exports = router;
