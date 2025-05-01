const express = require('express');
const Content = require('../models/Content');
const auth = require('../middlewares/auth');
const logger = require('../config/logger');
const router = express.Router();


// Connecting GridFS for file retrieval
const Grid = require('gridfs-stream');
const mongoose = require("mongoose");
const upload = require("../middlewares/upload");
let gfs;

mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});


// Upload content with an image
router.post('/upload', auth(['creator']), upload.single('file'), async (req, res) => {
  logger.info(`Route /upload POST called`);
  try {
    const { title, description, mediaType, creator, isExclusive, requiredLevel } = req.body;
    const mediaUrl = `/files/${req.file.filename}`;
    const thumbnailUrl = mediaUrl; // Assuming the same file is used for thumbnail

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

// Fetch file from GridFS
router.get('/files/:filename', (req, res) => {
  logger.info(`Route /files/:filename GET called`);
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
        } else if (err) {
          logger.error(`File retrieval error: ${err.message}`);
          return res.status(500).json({ message: 'Failed to retrieve file' });
        }
    if (file.contentType.includes('image') || file.contentType.includes('video')) {
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } else {
      res.status(400).json({ err: 'Not an image or video' });
    }
  });
});

// Create content
router.post('/', auth(['creator']), async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
});

// Update content
router.patch('/:id', auth(['creator']), async (req, res) => {
  logger.info(`Route /:id PATCH called`);
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
router.delete('/:id', auth(['creator']), async (req, res) => {
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