const mongoose = require('mongoose');
const FeaturedProfile = require('./models/FeaturedProfile');
const User = require('../../../server/models/User');
const logger = require('../../../server/config/logger');

const getFeaturedProfiles = async () => {
  try {
    logger.info('Fetching featured profiles from database...');
    
    // Get all active featured profiles
    const featuredProfiles = await FeaturedProfile
      .find({ isActive: true })
      .sort({ displayOrder: 1, lastUpdated: -1 })
      .limit(3)
      .lean()
      .catch(err => {
        logger.error('Error fetching featured profiles:', err);
        throw err;
      });

    logger.info(`Found ${featuredProfiles.length} featured profiles in database`);
    logger.debug('Featured profiles raw data:', JSON.stringify(featuredProfiles, null, 2));
    
    if (!featuredProfiles || featuredProfiles.length === 0) {
      logger.warn('No active featured profiles found in database');
      return [];
    }
    
    logger.debug('Featured profiles from DB:', JSON.stringify(featuredProfiles, null, 2));
    
    // Get user IDs from featured profiles with validation
    let userIds = [];
    try {
      userIds = featuredProfiles
        .map(profile => {
          if (!profile || !profile.userId) {
            logger.warn('Invalid profile data:', profile);
            return null;
          }
          return profile.userId;
        })
        .filter(Boolean)
        .filter(userId => {
          try {
            // Validate userId format
            new mongoose.Types.ObjectId(userId);
            return true;
          } catch (error) {
            logger.error(`Invalid userId format: ${userId}`, error);
            return false;
          }
        });

      logger.info(`Extracted ${userIds.length} valid user IDs from featured profiles`);
      
      if (userIds.length === 0) {
        logger.error('No valid user IDs found in featured profiles');
        return [];
      }
    } catch (error) {
      logger.error('Error processing user IDs:', error);
      throw error;
    }

    // Fetch user details for featured profiles
    let users = [];
    try {
      users = await User.find({ _id: { $in: userIds } })
        .select('username displayName profilePicture bio postsCount followersCount subscribersCount')
        .lean()
        .catch(err => {
          logger.error('Error fetching user details:', err);
          throw err;
        });

      logger.info(`Fetched ${users.length} user records for featured profiles`);
      
      if (users.length === 0) {
        logger.error('No user records found for featured profiles');
        return [];
      }
    } catch (error) {
      logger.error('Error in user details fetch:', error);
      throw error;
    }

    // Create a map of user IDs to user objects for easy lookup
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});
    
    // Map the profiles to include user data
    const mappedProfiles = featuredProfiles
      .map(profile => {
        const user = userMap[profile.userId];
        
        if (!user) {
          logger.warn(`No user found for featured profile with userId: ${profile.userId}`);
          return null;
        }

        return {
          userId: user._id,
          profilePicture: user.profilePicture || 'https://via.placeholder.com/150',
          username: user.username || 'Unknown User',
          displayName: user.displayName || user.username || 'Anonymous Creator',
          bio: user.bio || 'No bio available',
          posts: user.postsCount || 0,
          followers: user.followersCount || 0,
          subscribers: user.subscribersCount || 0
        };
      })
      .filter(Boolean); // Remove any null entries from missing users
    
    logger.info(`Mapped ${mappedProfiles.length} featured profiles with user data`);
    return mappedProfiles;
  } catch (error) {
    logger.error('CRITICAL ERROR in getFeaturedProfiles:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      errors: error.errors
    });
    
    // Don't return mock data in production
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // Only return test data in development
    return [
    ];
  }
};

const addFeaturedProfile = async (userId, displayOrder) => {
  try {
    const featuredProfile = new FeaturedProfile({
      userId,
      displayOrder
    });
    await featuredProfile.save();
    return featuredProfile;
  } catch (error) {
    logger.error('Error adding featured profile:', error);
    throw error;
  }
};

const updateFeaturedProfile = async (userId, displayOrder) => {
  try {
    const featuredProfile = await FeaturedProfile.findOne({ userId });
    if (!featuredProfile) {
      throw new Error('Featured profile not found');
    }
    featuredProfile.displayOrder = displayOrder;
    await featuredProfile.save();
    return featuredProfile;
  } catch (error) {
    logger.error('Error updating featured profile:', error);
    throw error;
  }
};

const updateFeaturedProfileStatus = async (userId, isActive) => {
  try {
    const featuredProfile = await FeaturedProfile.findOne({ userId });
    if (!featuredProfile) {
      throw new Error('Featured profile not found');
    }
    featuredProfile.isActive = isActive;
    await featuredProfile.save();
    return featuredProfile;
  } catch (error) {
    logger.error('Error updating featured profile status:', error);
    throw error;
  }
};

module.exports = {
  getFeaturedProfiles,
  addFeaturedProfile,
  updateFeaturedProfile,
  updateFeaturedProfileStatus
};
