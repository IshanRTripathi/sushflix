const express = require('express');
const Content = require('../models/Content');
const authMiddleware = require('../middlewares/auth');
const logger = require('../config/logger');
const router = express.Router();

// Upload content with an image
router.post('/upload', authMiddleware(['creator']), async (req, res) => {
  logger.info(`Route /upload POST called`);
  try {
    const { title, description, mediaType, creator, isExclusive, requiredLevel, mediaUrl, thumbnailUrl } = req.body;

    const newContent = new Content({
      title,
      description,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      creator,
      isExclusive,
      requiredLevel,
    });

    await newContent.save();
    res.status(201).json(newContent);
  } catch (error) {
        logger.error(`Content upload error: ${error.message}`);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Content already exists." });
        }
        res.status(500).json({ message: 'Failed to upload content' });
  }
});

// Fetch content
router.get('/', async (req, res) => {
  logger.info(`Route / GET called`);
  try {
    const contents = await Content.find().populate('creator');
    res.status(200).json(contents);
  } catch (error) {
        logger.error(`Content fetch error: ${error.message}`);
        res.status(500).json({ message: 'Failed to fetch contents' });
  
   
  }
});

// Create content
router.post('/', authMiddleware(['creator']), async (req, res) => {
  logger.info(`Route / POST called`);
  try {
    const content = new Content({
      ...req.body,
      creator: req.user.userId
    });
    await content.save();
    logger.info(`Content created: ${content._id}`);
    res.status(201).json(content);
  } catch (error) {
        logger.error(`Content creation error: ${error.message}`);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Content already exists." });
        }
    res.status(400).json({ message: err.message });
  }
});

// Get all content (with filters)
router.get('/', async (req, res) => {
  logger.info(`Route / with filters GET called`);
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
  } catch (error) {
        logger.error(`Content fetch error: ${error.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Get single content
router.get('/:id', async (req, res) => {
  logger.info(`Route /:id GET called`);
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
  } catch (error) {
        logger.error(`Content fetch error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Update content
router.put('/:id', authMiddleware(['creator']), async (req, res) => {
  logger.info(`Route /:id PUT called`);
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
  } catch (error) {
        logger.error(`Content update error: ${error.message}`);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Content already exists." });
        }
        res.status(500).json({ message: 'Failed to update content' });
  }
});

// Delete content
router.delete('/:id', authMiddleware(['creator']), async (req, res) => {
  logger.info(`Route /:id DELETE called`);
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
  } catch (error) {
        logger.error(`Content deletion error: ${error.message}`);
        res.status(500).json({ message: 'Failed to delete content' });
  }
});

module.exports = router;