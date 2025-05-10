const express = require('express');
const router = express.Router();
const featuredProfileService = require('../services/featuredProfileService');

// Get featured profiles
router.get('/', async (req, res) => {
  try {
    const featuredProfiles = await featuredProfileService.getFeaturedProfiles();
    res.json(featuredProfiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured profiles' });
  }
});



// Add a featured profile
router.post('/', async (req, res) => {
  try {
    const { userId, displayOrder } = req.body;
    if (!userId || typeof displayOrder !== 'number') {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const featuredProfile = await featuredProfileService.addFeaturedProfile(userId, displayOrder);
    res.status(201).json(featuredProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error adding featured profile' });
  }
});

// Update featured profile display order
router.put('/:userId/order', async (req, res) => {
  try {
    const { displayOrder } = req.body;
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({ message: 'Missing displayOrder' });
    }
    const featuredProfile = await featuredProfileService.updateFeaturedProfile(req.params.userId, displayOrder);
    res.json(featuredProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating featured profile' });
  }
});

// Update featured profile status (active/inactive)
router.put('/:userId/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Missing isActive' });
    }
    const featuredProfile = await featuredProfileService.updateFeaturedProfileStatus(req.params.userId, isActive);
    res.json(featuredProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating featured profile status' });
  }
});

module.exports = router;
