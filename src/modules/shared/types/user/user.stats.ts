import { Types } from 'mongoose';

/** Daily metrics for tracking user activity and engagement */
export interface IDailyStat {
  date: Date;
  postViews: number;
  profileViews: number;
  newFollowers: number;
  newSubscribers: number;
  engagementRate: number;
  [key: string]: number | Date;
}

/** Weekly aggregated metrics for user activity and engagement */
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

/** Monthly aggregated metrics for tracking user growth and engagement */
export interface IMonthlyStat {
  month: number;
  year: number;
  totalViews: number;
  totalEngagement: number;
  newFollowers: number;
  newSubscribers: number;
  [key: string]: number; // Allow for additional metrics
}

/** Annual aggregated metrics for long-term user activity tracking */
export interface IYearlyStat {
  year: number;
  totalViews: number;
  totalEngagement: number;
  totalFollowers: number;
  totalSubscribers: number;
  [key: string]: number; // Allow for additional metrics
}

/** Comprehensive user statistics and engagement metrics */
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

/** Aggregated statistics summary for user profile display */
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
 * Time range options for filtering statistics queries.
 * 
 * @description This type represents the available time range options for filtering statistics queries, including 24 hours, 7 days, 30 days, 90 days, 12 months, and custom.
 */
export type StatsTimeRange = '24h' | '7d' | '30d' | '90d' | '12m' | 'all' | 'custom';

/**
 * Filtering and grouping options for statistics queries.
 * 
 * @description This interface represents the filtering and grouping options for statistics queries, including start date, end date, time range, group by, and metric.
 */
export interface IStatsFilterOptions {
  startDate?: Date;
  endDate?: Date;
  timeRange?: StatsTimeRange;
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year';
  metric?: 'views' | 'engagement' | 'followers' | 'subscribers' | 'all';
}

/** Single data point for time-series statistics visualization */
export interface IStatsDataPoint {
  date: Date;
  value: number;
  label: string;
}

/** Complete statistics response including data points and summary */
export interface IStatsResponse {
  summary: IUserStatsSummary;
  data: IStatsDataPoint[];
  filter: IStatsFilterOptions;
}
