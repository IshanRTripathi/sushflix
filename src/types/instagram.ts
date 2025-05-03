export interface InstagramProfile {
  username: string;
  profilePicture: string;
  followerCount: number;
  lastUpdated: Date;
}

export interface FeaturedProfile extends InstagramProfile {
  displayName: string;
  isActive: boolean;
}

export interface InstagramConfig {
  featuredProfiles: FeaturedProfile[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
} 