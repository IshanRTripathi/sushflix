const express = require('express');
const Content = require('../models/Content');
const auth = require('../middlewares/auth');
const logger = require('../config/logger');
const router = express.Router();

// Create content
router.post('/', auth(['creator']), async (req, res) => {
  try {
    const content = new Content({
      ...req.body,
      creator: req.user.userId
    });
    await content.save();
    logger.info(`Content created: ${content._id}`);
    res.status(201).json(content);
  } catch (err) {
    logger.error(`Content creation error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

// Get all content (with filters)
router.get('/', async (req, res) => {
  try {
    const { creator, type, exclusive } = req.query;
    const filter = {};
    
    if (creator) filter.creator = creator;
    if (type) filter.mediaType = type;
    if (exclusive) filter.isExclusive = exclusive === 'true';

    const contents = await Content.find(filter)
      .populate('creator', 'username name')
      .sort('-createdAt');
    
    res.json(contents);
  } catch (err) {
    logger.error(`Content fetch error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Get single content
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('creator', 'username name');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Increment views
    content.views += 1;
    await content.save();

    res.json(content);
  } catch (err) {
    logger.error(`Content fetch error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Update content
router.patch('/:id', auth(['creator']), async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      creator: req.user.userId
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    Object.assign(content, req.body);
    await content.save();
    
    logger.info(`Content updated: ${content._id}`);
    res.json(content);
  } catch (err) {
    logger.error(`Content update error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

// Delete content
router.delete('/:id', auth(['creator']), async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({
      _id: req.params.id,
      creator: req.user.userId
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    logger.info(`Content deleted: ${req.params.id}`);
    res.json({ message: 'Content deleted' });
  } catch (err) {
    logger.error(`Content deletion error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;