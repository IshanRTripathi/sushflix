const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../middlewares/upload');
const Content = require('../models/Content');

// Connecting GridFS for file retrieval
const Grid = require('gridfs-stream');
let gfs;

mongoose.connection.once('open', () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Upload content with an image
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, description, mediaType, creator, isExclusive, requiredLevel } = req.body;
        const mediaUrl = `/files/${req.file.filename}`;

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
        res.status(201).json(newContent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload content' });
    }
});

// Fetch content
router.get('/', async (req, res) => {
    try {
        const contents = await Content.find().populate('creator');
        res.status(200).json(contents);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contents' });
    }
});

// Fetch file from GridFS
router.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ error: 'No file exists' });
        }
        if (file.contentType.includes('image') || file.contentType.includes('video')) {
            const readStream = gfs.createReadStream(file.filename);
            readStream.pipe(res);
        } else {
            res.status(400).json({ error: 'Not an image or video' });
        }
    });
});

module.exports = router;