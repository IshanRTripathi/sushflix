const express = require('express');
const router = express.Router();
const profileService = require('../services/featuredProfileService');
const asyncHandler = require('express-async-handler');

// Get featured profiles
router.get('/featured', asyncHandler(async (req, res) => {
  try {
    const featuredProfiles = await profileService.getFeaturedProfiles();
    res.json({ profiles: featuredProfiles });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch featured profiles',
      message: error.message
    });
  }
}));

module.exports = router;
