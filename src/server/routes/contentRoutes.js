const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../middlewares/upload');
const logger = require('../config/logger');
const Content = require('../models/Content');

// Connecting GridFS for file retrieval
const Grid = require('gridfs-stream');
let gfs;

mongoose.connection.once('open', () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Upload content with an image
router.post('/upload', upload.fields([{ name: 'media', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res, next) => {
    const { title, description, mediaType, creator, isExclusive, requiredLevel } = req.body;
    const errors = [];
    
    if (!title || typeof title !== 'string') {
        errors.push('Title is required and must be a string');
    }
    if (!mediaType || typeof mediaType !== 'string') {
        errors.push('Media Type is required and must be a string');
    }
    if (description && typeof description !== 'string') {
        errors.push('Description must be a string');
    }
    if (creator && typeof creator !== 'string') {
        errors.push('Creator must be a string');
    }
    if (isExclusive !== undefined && typeof isExclusive !== 'boolean') {
        errors.push('Is Exclusive must be a boolean');
    }
    if (requiredLevel !== undefined && typeof requiredLevel !== 'number') {
        errors.push('Required Level must be a number');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    if (!req.files || !req.files['media']) {
        errors.push('Media file is required');
    }
    if (!req.files || !req.files['thumbnail']) {
        errors.push('Thumbnail file is required');
    }
    
  try {
      const mediaUrl = `/files/${req.files['media'][0].filename}`;

    const newContent = new Content({
          title,
          description,
          mediaType,
          mediaUrl,
          thumbnailUrl: mediaUrl, // Assuming the same file is used for thumbnail
          creator,
          isExclusive,
          requiredLevel,
      });

      await newContent.save();
      return res.status(201).json(newContent);
  } catch (error) {
      if (error.code === 11000) {
          return res.status(409).json({ message: 'Content already exists' });
      }
      next(error);
    }
});

// Fetch content
router.get('/', async (req, res, next) => {
    try {
        const contents = await Content.find().populate('creator').exec();
        if (!contents) {
            return res.status(404).json({ message: 'Contents not found' });
        }
        return res.status(200).json(contents);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contents' });
    }
});

// Fetch file from GridFS
router.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ message: 'No file exists' });
        }
        if (err){
            logger.error(err);
            return res.status(500).json({ message: 'Error finding file' });
        }
        if (file.contentType.includes('image') || file.contentType.includes('video')) {
            const readStream = gfs.createReadStream(file.filename);
            readStream.pipe(res);
        } else {
            return res.status(400).json({ message: 'Not an image or video' });
        }
    });
});


module.exports = router;