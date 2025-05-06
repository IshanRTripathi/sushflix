const User = require('../models/User');
const Post = require('../models/Post');
const StorageService = require('../services/StorageService');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user with populated fields
    const user = await User.findOne({ username })
      .select('-password') // Exclude password
      .select('-googleId') // Exclude sensitive info
      .select('-__v') // Exclude version key
      .select('-createdAt') // Exclude timestamps
      .select('-updatedAt');

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user profile could not be found.'
      });
    }

    // Format response with default values
    const userProfile = {
      username: user.username,
      displayName: user.displayName || user.username,
      profilePicture: user.profilePicture || '/default-profile-pic.png',
      isCreator: user.isCreator || false,
      email: user.email,
      stats: {
        posts: 0,
        followers: 0,
        following: 0
      }
    };

    // Get stats
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      User.countDocuments({ following: user._id }),
      User.countDocuments({ followers: user._id })
    ]);

    userProfile.stats = {
      posts: postsCount,
      followers: followersCount,
      following: followingCount
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching the user profile.'
    });
  }
};

// Get user posts
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture');

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user stats could not be found.'
      });
    }

    // Get all stats in parallel
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      User.countDocuments({ following: user._id }),
      User.countDocuments({ followers: user._id })
    ]);

    res.status(200).json({
      posts: postsCount || 0,
      followers: followersCount || 0,
      following: followingCount || 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching user statistics.'
    });
  }
};

const storageService = StorageService.getInstance();

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { username } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Upload to GCS
    const uploadResponse = await storageService.uploadFile(username, file);

    if (!uploadResponse.success) {
      return res.status(400).json({
        success: false,
        error: uploadResponse.error
      });
    }

    // Update user profile with new image URL
    const user = await User.findOneAndUpdate(
      { username },
      { profilePic: uploadResponse.url },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      imageUrl: uploadResponse.url
    });
  } catch (error) {
    logger.error('Error uploading profile picture', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture'
    });
  }
};

module.exports = {
  getUserProfile,
  getUserStats,
  uploadProfilePicture
};
