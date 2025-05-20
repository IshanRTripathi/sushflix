const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema({
  website: { type: String, default: '' },
  twitter: { type: String, default: '' },
  youtube: { type: String, default: '' },
  instagram: { type: String, default: '' },
  // Add other social platforms as needed
}, { _id: false });

const userStatsSchema = new mongoose.Schema({
  postCount: { type: Number, default: 0 },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  // Add other stats as needed
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'system'],
    default: 'system' 
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { _id: false });

const UserProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  socialLinks: {
    type: socialLinksSchema,
    default: () => ({})
  },
  stats: {
    type: userStatsSchema,
    default: () => ({})
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({
      theme: 'system',
      notifications: {
        email: true,
        push: true
      }
    })
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  // Add any additional profile-specific fields here
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
UserProfileSchema.index({ user: 1 });
UserProfileSchema.index({ 'socialLinks.website': 1 });
UserProfileSchema.index({ isCreator: 1 });

// Virtual for user's full URL
UserProfileSchema.virtual('url').get(function() {
  return `/users/${this.user}`;
});

// Static method to update user stats
UserProfileSchema.statics.updateStats = async function(userId, updates) {
  return this.findOneAndUpdate(
    { user: userId },
    { $inc: updates },
    { new: true, upsert: true }
  );
};

// Instance method to get public profile data
UserProfileSchema.methods.getPublicProfile = function() {
  const profile = this.toObject();
  
  // Remove sensitive data
  delete profile.__v;
  delete profile.updatedAt;
  
  return profile;
};

const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = UserProfile;
