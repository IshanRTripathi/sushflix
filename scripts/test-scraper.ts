import { instagramScraper } from '../src/services/instagramScraper';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    logger.info('Starting Instagram scraper test');
    
    // Test with a known Instagram profile
    const profile = await instagramScraper.getProfile('instagram');
    
    if (profile) {
      logger.info('Successfully scraped profile:', {
        username: profile.username,
        followerCount: profile.followerCount,
        lastUpdated: profile.lastUpdated
      });
    } else {
      logger.error('Failed to scrape profile');
    }
  } catch (error) {
    logger.error('Test failed', { error });
  }
}

main(); 