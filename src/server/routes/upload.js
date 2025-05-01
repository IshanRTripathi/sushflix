// routes/upload.js
const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const upload = require('../middlewares/upload');  // Assuming `upload.js` is in `middlewares`

// Route for file upload using S3
router.post('/upload', upload.single('file'), (req, res) => {
    logger.info('Executing /upload route handler');
    try{
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: req.file.location
        });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;