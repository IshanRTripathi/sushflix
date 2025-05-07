const Post = require('../models/Post');
const User = require('../models/User');

// Get user posts
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user does not exist.'
      });
    }

    // Fetch posts with additional details
    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture')
      .select('-__v') // Exclude version key
      .select('-createdAt') // Exclude timestamps
      .select('-updatedAt');

    // Format posts with default values
    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      caption: post.caption || '',
      mediaUrl: post.mediaUrl || '',
      likes: post.likes || 0,
      comments: post.comments || 0,
      views: post.views || 0,
      createdAt: post.createdAt ? post.createdAt.toISOString() : new Date().toISOString(),
      userId: {
        id: post.userId._id.toString(),
        username: post.userId.username,
        profilePicture: post.userId.profilePicture || '/default-profile-pic.png'
      }
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching user posts.'
    });
  }
};

module.exports = {
  getUserPosts
};
