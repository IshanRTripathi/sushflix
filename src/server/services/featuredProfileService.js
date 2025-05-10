const FeaturedProfile = require('../models/FeaturedProfile');
const User = require('../models/User');
const logger = require('../config/logger');

const getFeaturedProfiles = async () => {
  try {
    // First get all the featured profiles
    const featuredProfiles = await FeaturedProfile
      .find({ isActive: true })
      .sort({ displayOrder: 1, lastUpdated: -1 })
      .limit(3);

    logger.info('Found featured profiles:', featuredProfiles.length);
    logger.debug('Raw featured profiles:', featuredProfiles);

    // Get all user IDs from featured profiles
    const userIds = featuredProfiles.map(fp => fp.userId);
    
    // Fetch all user data in one query
    const users = await User.find({ _id: { $in: userIds } });
    logger.debug('Fetched users:', users);

    const defaultProfile = {
      userId: '',
      username: 'Unknown User',
      displayName: 'Anonymous Creator',
      profilePicture: 'https://via.placeholder.com/150',
      bio: 'No bio available',
      posts: 0,
      followers: 0,
      subscribers: 0
    };

    const mappedProfiles = featuredProfiles.map(fp => {
      // Find the corresponding user data
      const user = users.find(u => u._id.toString() === fp.userId.toString());
      
      logger.debug('Mapping profile for user:', user);

      return {
        profilePicture: user?.profilePicture || defaultProfile.profilePicture,
        username: user?.username || defaultProfile.username,
        bio: defaultProfile.bio,
        posts: defaultProfile.posts,
        followers: defaultProfile.followers,
        subscribers: defaultProfile.subscribers
      };
    });

    logger.info('Final mapped featured profiles:', mappedProfiles);
    return mappedProfiles;
  } catch (error) {
    logger.error('Error fetching featured profiles:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return [
      {
        profilePicture: 'https://via.placeholder.com/150',
        username: 'Featured Creator 1',
        bio: 'Featured creator on SushFlix',
        posts: 100,
        followers: 5000,
        subscribers: 2500
      },
      {
        profilePicture: 'https://via.placeholder.com/150',
        username: 'Featured Creator 2',
        bio: 'Trending creator on SushFlix',
        posts: 75,
        followers: 3000,
        subscribers: 1500
      },
      {
        profilePicture: 'https://via.placeholder.com/150',
        username: 'Featured Creator 3',
        bio: 'Rising creator on SushFlix',
        posts: 50,
        followers: 2000,
        subscribers: 1000
      }
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
