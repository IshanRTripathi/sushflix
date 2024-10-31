const Content = require('../models/Content');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const getCreatorAnalytics = async (creatorId) => {
  const [
    totalViews,
    totalLikes,
    totalSubscribers,
    revenueStats,
    contentPerformance
  ] = await Promise.all([
    Content.aggregate([
      { $match: { creator: creatorId } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Content.aggregate([
      { $match: { creator: creatorId } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]),
    Subscription.countDocuments({ 
      creator: creatorId,
      status: 'active'
    }),
    Subscription.aggregate([
      { $match: { creator: creatorId, status: 'active' } },
      { $group: {
        _id: '$level',
        revenue: { $sum: '$price' },
        count: { $sum: 1 }
      }}
    ]),
    Content.aggregate([
      { $match: { creator: creatorId } },
      { $project: {
        title: 1,
        views: 1,
        likes: 1,
        engagement: { $divide: ['$likes', '$views'] }
      }},
      { $sort: { engagement: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    totalViews: totalViews[0]?.total || 0,
    totalLikes: totalLikes[0]?.total || 0,
    totalSubscribers,
    revenueStats,
    contentPerformance
  };
};

const getUserEngagement = async (userId) => {
  const [
    viewedContent,
    likedContent,
    comments,
    subscriptions
  ] = await Promise.all([
    Content.find({ 'views.userId': userId }).count(),
    Content.find({ 'likes.userId': userId }).count(),
    Comment.find({ userId }).count(),
    Subscription.find({ subscriber: userId, status: 'active' })
  ]);

  return {
    viewedContent,
    likedContent,
    comments,
    subscriptions
  };
};

module.exports = {
  getCreatorAnalytics,
  getUserEngagement
};