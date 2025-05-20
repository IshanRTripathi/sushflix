const mongoose = require('mongoose');

const FeaturedProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  displayOrder: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

FeaturedProfileSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const FeaturedProfile = mongoose.model('FeaturedProfile', FeaturedProfileSchema);

module.exports = FeaturedProfile;
