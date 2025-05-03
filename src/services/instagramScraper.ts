import { logger } from '../utils/logger';
import { InstagramProfile } from '../types/instagram';
import { cacheService } from './cacheService';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class InstagramScraper {
  private static instance: InstagramScraper;
  private readonly CACHE_KEY_PREFIX = 'instagram_profile_';
  private readonly RATE_LIMIT_DELAY = 5000; // 5 seconds between requests
  private readonly INSTAGRAM_URL = 'https://www.instagram.com';
  private lastRequestTime: number = 0;

  private constructor() {
    logger.info('Instagram scraper initialized');
  }

  public static getInstance(): InstagramScraper {
    if (!InstagramScraper.instance) {
      InstagramScraper.instance = new InstagramScraper();
    }
    return InstagramScraper.instance;
  }

  private async delay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const delayTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      logger.debug(`Rate limiting: waiting ${delayTime}ms`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private getCacheKey(username: string): string {
    return `${this.CACHE_KEY_PREFIX}${username}`;
  }

  public async getProfile(username: string): Promise<InstagramProfile | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(username);
      const cachedProfile = cacheService.get<InstagramProfile>(cacheKey);
      
      if (cachedProfile) {
        logger.debug(`Cache hit for profile: ${username}`);
        return cachedProfile;
      }

      // Rate limiting
      await this.delay();

      // Scrape profile data
      logger.info(`Scraping profile: ${username}`);
      const profile = await this.scrapeProfile(username);

      if (!profile) {
        logger.warn(`Failed to scrape profile: ${username}`);
        return null;
      }

      // Cache the result
      cacheService.set(cacheKey, profile);
      logger.debug(`Cached profile: ${username}`);

      return profile;
    } catch (error) {
      logger.error(`Error scraping profile: ${username}`, { error });
      return null;
    }
  }

  private async scrapeProfile(username: string): Promise<InstagramProfile | null> {
    try {
      logger.debug(`Scraping profile data for: ${username}`);
      
      // Make request to Instagram profile page with more realistic headers
      const response = await axios.get(`${this.INSTAGRAM_URL}/${username}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000,
        maxRedirects: 5
      });

      // Parse the HTML response
      const $ = cheerio.load(response.data);

      // First try to get data from meta tags
      let profileData = this.extractProfileDataFromMeta($);
      
      // If meta tags fail, try alternative selectors
      if (!profileData) {
        profileData = this.extractProfileDataFromHTML($, username);
      }

      if (!profileData) {
        logger.warn(`Could not extract profile data for: ${username}`);
        return null;
      }

      return {
        username,
        ...profileData,
        lastUpdated: new Date()
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Network error scraping ${username}:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers
        });
      } else {
        logger.error(`Error in scrapeProfile for ${username}:`, { error });
      }
      return null;
    }
  }

  private extractProfileDataFromMeta($: cheerio.Root): { profilePicture: string; followerCount: number } | null {
    try {
      const profilePicture = $('meta[property="og:image"]').attr('content');
      const description = $('meta[property="og:description"]').attr('content');
      
      if (!profilePicture || !description) {
        logger.debug('Could not find meta tags');
        return null;
      }

      const followerMatch = description.match(/([\d,]+)\s+[Ff]ollowers/);
      const followerCount = followerMatch ? parseInt(followerMatch[1].replace(/,/g, '')) : 0;

      if (!followerCount) {
        logger.debug('Could not extract follower count from meta description');
        return null;
      }

      return {
        profilePicture,
        followerCount
      };
    } catch (error) {
      logger.error('Error extracting profile data from meta tags', { error });
      return null;
    }
  }

  private extractProfileDataFromHTML($: cheerio.Root, username: string): { profilePicture: string; followerCount: number } | null {
    try {
      // Try to find profile picture from img tags
      const profilePicture = $('img[alt*="profile picture"]').attr('src') ||
                           $('img[alt*="' + username + '"]').attr('src');

      // Try to find follower count from various potential elements
      let followerCount = 0;
      const followerText = $('a[href*="/followers/"] span').text() ||
                          $('ul li span').filter((_, el) => $(el).text().includes('followers')).text();

      if (followerText) {
        const match = followerText.match(/(\d+(?:,\d+)*)/);
        if (match) {
          followerCount = parseInt(match[1].replace(/,/g, ''));
        }
      }

      if (!profilePicture || !followerCount) {
        logger.debug('Could not extract profile data from HTML');
        return null;
      }

      return {
        profilePicture,
        followerCount
      };
    } catch (error) {
      logger.error('Error extracting profile data from HTML', { error });
      return null;
    }
  }
}

export const instagramScraper = InstagramScraper.getInstance(); 