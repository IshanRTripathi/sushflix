// routes/upload.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');  // Assuming `upload.js` is in `middlewares`

// Route for file upload using S3
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: req.file.location
    });
});

module.exports = router;