import logger from '../utils/logger';
import { UserProfile } from '../types/user';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 7200; // 2 hours in seconds

  private constructor() {
    this.cache = new Map();
    logger.info('Cache service initialized');
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public getProfile(username: string): UserProfile | null {
    return this.get<UserProfile>(`profile_${username}`);
  }

  public setProfile(profile: UserProfile): void {
    this.set(`profile_${profile.username}`, profile);
  }

  public deleteProfile(username: string): void {
    this.delete(`profile_${username}`);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getSize(): number {
    return this.cache.size;
  }
}

export const cacheService = CacheService.getInstance(); 