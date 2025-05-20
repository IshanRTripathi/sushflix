import { Document, Model, Types } from 'mongoose';

export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ULTIMATE = 'ultimate'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface IPaymentHistoryItem {
  amount: number;
  date: Date;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
}

export interface ISubscription extends Document {
  subscriber: Types.ObjectId;
  creator: Types.ObjectId;
  tier: SubscriptionTier;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  paymentHistory: IPaymentHistoryItem[];
  isActive: boolean;
  autoRenew: boolean;
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  price: number;
  currency: string;
  paymentMethod?: string;
  billingCycle: 'monthly' | 'yearly';
  metadata?: Record<string, any>;
  notes?: string;
}

export interface ISubscriptionModel extends Model<ISubscription> {
  isActive: () => boolean;
  getActiveSubscriptions: (userId: Types.ObjectId) => Promise<ISubscription[]>;
  getSubscribers: (creatorId: Types.ObjectId) => Promise<ISubscription[]>;
  getSubscriptionStats: (creatorId: Types.ObjectId) => Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  }>;
}

export const Subscription: ISubscriptionModel;
