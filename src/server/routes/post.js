const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Get user posts - public endpoint
router.get('/:username', postController.getUserPosts);

module.exports = router;
