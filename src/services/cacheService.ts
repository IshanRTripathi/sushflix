import { UserProfile, CacheEntry } from '../types/user';
import { logger } from '../utils/logger';

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

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

  private getCacheKey(key: string): string {
    return `profile:${key}`;
  }

  public async getProfile(username: string): Promise<UserProfile | null> {
    const cacheKey = this.getCacheKey(username);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry.timestamp)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data as UserProfile;
  }

  public async setProfile(profile: UserProfile): Promise<void> {
    const cacheKey = this.getCacheKey(profile.username);
    this.cache.set(cacheKey, {
      data: profile,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL
    });
  }

  public async deleteProfile(username: string): Promise<void> {
    const cacheKey = this.getCacheKey(username);
    this.cache.delete(cacheKey);
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.DEFAULT_TTL;
  }

  public clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  public getSize(): number {
    return this.cache.size;
  }

  public set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);
    logger.debug('Cache set', { key, ttl });
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      logger.debug('Cache miss', { key });
      return null;
    }

    if (this.isExpired(entry.timestamp)) {
      logger.debug('Cache expired', { key });
      this.cache.delete(key);
      return null;
    }

    logger.debug('Cache hit', { key });
    return entry.data;
  }

  public delete(key: string): void {
    this.cache.delete(key);
    logger.debug('Cache deleted', { key });
  }

  public getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheService = CacheService.getInstance(); 