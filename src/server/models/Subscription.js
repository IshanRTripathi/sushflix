const mongoose = require('mongoose');

const subscriptionTiers = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  VIP: 'vip'
};

const subscriptionStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAUSED: 'paused'
};

const paymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const SubscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tier: {
    type: String,
    enum: Object.values(subscriptionTiers),
    required: true,
    default: subscriptionTiers.BASIC
  },
  status: {
    type: String,
    enum: Object.values(subscriptionStatus),
    default: subscriptionStatus.ACTIVE
  },
  paymentStatus: {
    type: String,
    enum: Object.values(paymentStatus),
    default: paymentStatus.PENDING
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    default: 'card' // or 'paypal', 'crypto', etc.
  },
  paymentMethodId: {
    type: String
  },
  lastPaymentDate: Date,
  lastPaymentAmount: Number,
  paymentHistory: [{
    date: Date,
    amount: Number,
    currency: String,
    status: String,
    transactionId: String,
    receiptUrl: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one active subscription per creator for a subscriber
SubscriptionSchema.index(
  { subscriber: 1, creator: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

// Index for expiring subscriptions
SubscriptionSchema.index({ nextBillingDate: 1 });

// Virtual for subscription duration in days
SubscriptionSchema.virtual('durationInDays').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return this.status === subscriptionStatus.ACTIVE && 
         (!this.endDate || this.endDate > new Date());
};

// Static method to get active subscriptions for a user
SubscriptionSchema.statics.getActiveSubscriptions = async function(userId) {
  return this.find({
    subscriber: userId,
    status: subscriptionStatus.ACTIVE,
    nextBillingDate: { $gt: new Date() }
  }).populate('creator', 'username displayName profilePicture');
};

// Static method to get subscribers for a creator
SubscriptionSchema.statics.getSubscribers = async function(creatorId, { limit = 10, skip = 0 } = {}) {
  return this.find({
    creator: creatorId,
    status: subscriptionStatus.ACTIVE
  })
  .populate('subscriber', 'username displayName profilePicture')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Pre-save hook to update timestamps
SubscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.nextBillingDate) {
    // Set next billing date to 1 month from now by default
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    this.nextBillingDate = nextDate;
  }
  
  // If status changed to cancelled, set end date if not already set
  if (this.isModified('status') && this.status === subscriptionStatus.CANCELLED && !this.endDate) {
    this.endDate = new Date();
  }
  
  next();
});

// Add static properties to the schema
SubscriptionSchema.statics.tiers = subscriptionTiers;
SubscriptionSchema.statics.status = subscriptionStatus;
SubscriptionSchema.statics.paymentStatus = paymentStatus;

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;