const User = require('../models/User');
const Post = require('../models/Post');
const { uploadFile, deleteFile } = require('../services/StorageService');
const logger = require('../../shared/config/logger');

// Get current user's profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User must be logged in to view profile'
      });
    }

    // Format response with default values
    const ensureAbsoluteUrl = (url) => {
      if (!url) return '/default-avatar.png';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return url;
      return `/${url}`;
    };

    const userProfile = {
      username: user.username,
      displayName: user.displayName || user.username,
      profilePicture: ensureAbsoluteUrl(user.profilePicture),
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
    console.error('Error fetching current user profile:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while fetching the current user profile.'
    });
  }
};

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

    // Helper function to ensure URL is absolute
    const ensureAbsoluteUrl = (url) => {
      if (!url) return '/default-avatar.svg';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return url;
      return `/${url}`;
    };

    // Log the raw profile picture data
    logger.info('User profile picture data:', {
      hasProfilePicture: !!user.profilePicture,
      rawProfilePicture: user.profilePicture,
      processedUrl: ensureAbsoluteUrl(user.profilePicture),
      user: user.username
    });

    // Format response according to frontend's UserProfile type
    const userProfile = {
      id: user._id.toString(),
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      emailVerified: user.emailVerified || false,
      displayName: user.displayName || user.username,
      bio: user.bio || '',
      // Ensure profile picture URL is properly formatted
      profilePicture: ensureAbsoluteUrl(user.profilePicture),
      coverPhoto: user.coverPhoto || '',
      socialLinks: user.socialLinks || {},
      stats: {
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
        subscriberCount: 0
      },
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true
        }
      },
      isCreator: user.isCreator || false,
      isVerified: user.isVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };

    // Get stats
    const [postCount, followerCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId: user._id }),
      User.countDocuments({ following: user._id }),
      User.countDocuments({ followers: user._id })
    ]);

    // Update stats with correct property names
    userProfile.stats = {
      postCount,
      followerCount,
      followingCount,
      subscriberCount: 0 // Add this if you have subscribers
    };

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log the response being sent
    logger.info('Sending user profile response', {
      userId: user._id,
      username: user.username,
      hasProfilePicture: !!userProfile.profilePicture,
      profilePictureUrl: userProfile.profilePicture,
      headers: res.getHeaders()
    });

    // Send the response
    return res.status(200).json(userProfile);
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

// Upload profile picture
const uploadProfilePicture = async (req, res, next) => {
  const { username } = req.params;
  const file = req.file;
  
  try {
    // Validate request parameters
    if (!username || typeof username !== 'string') {
      logger.error('Invalid username parameter', {
        username,
        params: req.params
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid username parameter'
      });
    }

    if (!file) {
      logger.error('No file uploaded in request', {
        headers: req.headers,
        body: req.body,
        files: req.files
      });
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Ensure file has required properties
    if (!file.originalname || !file.mimetype || !file.size || !file.buffer) {
      logger.error('Invalid file properties', {
        username,
        fileProps: Object.keys(file),
        hasBuffer: !!file.buffer
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid file properties'
      });
    }

    // Log file info for debugging
    logger.info('Processing file upload', {
      username,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length
    });

    // Upload the file to storage (GCS or local)
    const uploadResponse = await uploadFile(username, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (!uploadResponse.success) {
      logger.error('Failed to upload to storage', {
        error: uploadResponse.error,
        response: uploadResponse,
        username,
        file: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      });
      return res.status(500).json({
        success: false,
        error: uploadResponse.error || 'Failed to upload file to storage'
      });
    }

    // Find user first
    const user = await User.findOne({ username });
    if (!user) {
      logger.error('User not found', { username });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    try {
      // Save the old picture URL for cleanup
      const oldPictureUrl = user.profilePicture;
      const oldFileName = oldPictureUrl ? oldPictureUrl.split('/').pop() : null;

      // Update user's profile picture URL
      user.profilePicture = uploadResponse.fileUrl; // Use fileUrl from the upload response
      await user.save();

      // If there was an old picture, delete it from storage
      if (oldPictureUrl) {
        try {
          // Extract just the filename from the URL
          const oldFileName = oldPictureUrl.split('/').pop();
          if (oldFileName) {
            await deleteFile(oldFileName);
            logger.info('Old profile picture deleted', { username, oldFileName });
          }
        } catch (deleteError) {
          // Log but don't fail the request if deletion fails
          logger.error('Failed to delete old profile picture', {
            error: deleteError.message,
            url: oldPictureUrl,
            username,
            stack: deleteError.stack
          });
        }
      }

      logger.info('Profile picture updated successfully', {
        username,
        newPictureUrl: uploadResponse.fileUrl
      });

      return res.json({
        success: true,
        url: uploadResponse.fileUrl,
        message: 'Profile picture updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update user profile with new picture', {
        error: error.message,
        username,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile with new picture'
      });
    }
  } catch (error) {
    logger.error('Profile picture upload error', {
      error: error.message,
      stack: error.stack,
      username: username || 'unknown'
    });
    
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while uploading the profile picture'
    });
  }
};

module.exports = {
  getCurrentUserProfile,
  getUserProfile,
  getUserStats,
  uploadProfilePicture
};
