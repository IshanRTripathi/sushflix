const Content = require('../models/Content');
const User = require('../models/User');

const searchContent = async (query, filters = {}) => {
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  };

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.mediaType) {
    searchQuery.mediaType = filters.mediaType;
  }

  const contents = await Content.find(searchQuery)
    .populate('creator', 'username name avatarUrl')
    .sort('-createdAt');

  return contents;
};

const getRecommendations = async (userId) => {
  // Get user's viewing history and preferences
  const userHistory = await Content.find({
    'views.userId': userId
  }).select('category tags creator');

  // Extract categories and tags from history
  const categories = [...new Set(userHistory.map(c => c.category))];
  const tags = [...new Set(userHistory.flatMap(c => c.tags))];
  const creators = [...new Set(userHistory.map(c => c.creator))];

  // Find similar content
  const recommendations = await Content.find({
    $or: [
      { category: { $in: categories } },
      { tags: { $in: tags } },
      { creator: { $in: creators } }
    ],
    'views.userId': { $ne: userId } // Exclude already viewed content
  })
  .populate('creator', 'username name avatarUrl')
  .sort('-views.length')
  .limit(10);

  return recommendations;
};

module.exports = {
  searchContent,
  getRecommendations
};