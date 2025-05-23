import { Types } from 'mongoose';

/**
 * Daily statistics for a user
 */
export interface IDailyStat {
  date: Date;
  postViews: number;
  profileViews: number;
  newFollowers: number;
  newSubscribers: number;
  engagementRate: number;
  [key: string]: number | Date; // Allow for additional metrics
}

/**
 * Weekly statistics for a user
 */
export interface IWeeklyStat {
  week: number;
  year: number;
  startDate: Date;
  endDate: Date;
  totalViews: number;
  totalEngagement: number;
  newFollowers: number;
  newSubscribers: number;
  [key: string]: number | Date; // Allow for additional metrics
}

/**
 * Monthly statistics for a user
 */
export interface IMonthlyStat {
  month: number;
  year: number;
  totalViews: number;
  totalEngagement: number;
  newFollowers: number;
  newSubscribers: number;
  [key: string]: number; // Allow for additional metrics
}

/**
 * Yearly statistics for a user
 */
export interface IYearlyStat {
  year: number;
  totalViews: number;
  totalEngagement: number;
  totalFollowers: number;
  totalSubscribers: number;
  [key: string]: number; // Allow for additional metrics
}

/**
 * Complete user statistics
 */
export interface IUserStats {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  
  // Current counts
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  totalSubscribers: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  
  // Time-based statistics
  dailyStats: IDailyStat[];
  weeklyStats: IWeeklyStat[];
  monthlyStats: IMonthlyStat[];
  yearlyStats: IYearlyStat[];
  
  // Timestamps
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  incrementPostCount(count?: number): Promise<void>;
  decrementPostCount(count?: number): Promise<void>;
  incrementFollowerCount(count?: number): Promise<void>;
  decrementFollowerCount(count?: number): Promise<void>;
  incrementSubscriberCount(count?: number): Promise<void>;
  decrementSubscriberCount(count?: number): Promise<void>;
  incrementViewCount(count?: number): Promise<void>;
  incrementEngagement(views?: number, likes?: number, comments?: number): Promise<void>;
  
  // Virtuals
  id: string;
}

/**
 * User statistics summary for display
 */
export interface IUserStatsSummary {
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  totalSubscribers: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  engagementRate: number;
  
  // Growth metrics
  followersGrowth: number; // Percentage change from previous period
  viewsGrowth: number;
  engagementGrowth: number;
  
  // Time-based summaries
  today: IDailyStat;
  thisWeek: IWeeklyStat;
  thisMonth: IMonthlyStat;
  thisYear: IYearlyStat;
}

/**
 * Time range for statistics queries
 */
export type StatsTimeRange = '24h' | '7d' | '30d' | '90d' | '12m' | 'all' | 'custom';

/**
 * Statistics filter options
 */
export interface IStatsFilterOptions {
  startDate?: Date;
  endDate?: Date;
  timeRange?: StatsTimeRange;
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year';
  metric?: 'views' | 'engagement' | 'followers' | 'subscribers' | 'all';
}

/**
 * Statistics data point
 */
export interface IStatsDataPoint {
  date: Date;
  value: number;
  label: string;
}

/**
 * Statistics response
 */
export interface IStatsResponse {
  summary: IUserStatsSummary;
  data: IStatsDataPoint[];
  filter: IStatsFilterOptions;
}
