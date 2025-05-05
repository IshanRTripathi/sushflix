const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// Get user profile - public endpoint
router.get('/:username', userController.getUserProfile);

// Get user stats - public endpoint
router.get('/:username/stats', userController.getUserStats);

// Upload profile picture
router.post('/:username/profile-picture', upload.single('file'), userController.uploadProfilePicture);

module.exports = router;
