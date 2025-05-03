import { logger } from '../utils/logger';
import { CacheEntry } from '../types/instagram';

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;

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

  public set<T>(key: string, data: T, ttl: number = 2 * 60 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl,
    };

    this.cache.set(key, entry);
    logger.debug(`Cache set for key: ${key}`, { ttl });
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    if (this.isExpired(entry)) {
      logger.debug(`Cache expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit for key: ${key}`);
    return entry.data;
  }

  public delete(key: string): void {
    this.cache.delete(key);
    logger.debug(`Cache deleted for key: ${key}`);
  }

  public clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();
    return age > entry.ttl;
  }

  public getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheService = CacheService.getInstance(); 