const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user profile - public endpoint
router.get('/:username', userController.getUserProfile);

// Get user stats - public endpoint
router.get('/:username/stats', userController.getUserStats);

module.exports = router;
