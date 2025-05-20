import { Document, Model, Schema, Types, model } from 'mongoose';

export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  VIP = 'vip'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAUSED = 'paused'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface IPaymentHistoryItem {
  date: Date;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  receiptUrl?: string;
  _id?: Types.ObjectId;
}

export interface ISubscription extends Document {
  subscriber: Types.ObjectId;
  creator: Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  startDate: Date;
  nextBillingDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentMethod: string;
  paymentMethodId?: string;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  paymentHistory: IPaymentHistoryItem[];
  metadata: Map<string, any>;
  isActive: () => boolean;
  durationInDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionModel extends Model<ISubscription> {
  getActiveSubscriptions(userId: string): Promise<ISubscription[]>;
  getSubscribers(creatorId: string, options?: { limit?: number; skip?: number }): Promise<ISubscription[]>;
}

const subscriptionSchema = new Schema<ISubscription, ISubscriptionModel>(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(SubscriptionTier),
      required: true,
      default: SubscriptionTier.BASIC,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    paymentMethodId: {
      type: String,
    },
    lastPaymentDate: Date,
    lastPaymentAmount: Number,
    paymentHistory: [
      {
        date: Date,
        amount: Number,
        currency: String,
        status: String,
        transactionId: String,
        receiptUrl: String,
      },
    ],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure one active subscription per creator for a subscriber
subscriptionSchema.index(
  { subscriber: 1, creator: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

// Index for expiring subscriptions
subscriptionSchema.index({ nextBillingDate: 1 });

// Virtual for subscription duration in days
subscriptionSchema.virtual('durationInDays').get(function (this: ISubscription) {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if subscription is active
subscriptionSchema.methods['isActive'] = function (this: ISubscription): boolean {
  return (
    this.status === SubscriptionStatus.ACTIVE && 
    (!this.endDate || this.endDate > new Date())
  );
};

// Static method to get active subscriptions for a user
subscriptionSchema.statics['getActiveSubscriptions'] = async function (
  this: ISubscriptionModel,
  userId: string
): Promise<ISubscription[]> {
  return this.find({
    subscriber: new Types.ObjectId(userId),
    status: SubscriptionStatus.ACTIVE,
    nextBillingDate: { $gt: new Date() },
  }).populate('creator', 'username displayName profilePicture');
};

// Static method to get subscribers for a creator
subscriptionSchema.statics['getSubscribers'] = async function (
  this: ISubscriptionModel,
  creatorId: string, 
  { limit = 10, skip = 0 }: { limit?: number; skip?: number } = {}
): Promise<ISubscription[]> {
  return this.find({
    creator: new Types.ObjectId(creatorId),
    status: SubscriptionStatus.ACTIVE,
  })
    .populate('subscriber', 'username displayName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save hook to update timestamps and set next billing date if not provided
subscriptionSchema.pre('save', function (next) {
  if (this.isNew && !this.nextBillingDate) {
    // Set next billing date to 1 month from now by default
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    this.nextBillingDate = nextDate;
  }
  next();
});

// Create and export the model
const Subscription = (() => {
  try {
    // Try to get the existing model to avoid OverwriteModelError
    return model<ISubscription, ISubscriptionModel>('Subscription');
  } catch (e) {
    // Model doesn't exist yet, create it
    return model<ISubscription, ISubscriptionModel>(
      'Subscription',
      subscriptionSchema
    );
  }
})();

export default Subscription;
