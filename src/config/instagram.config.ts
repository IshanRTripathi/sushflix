import { InstagramConfig } from '@/types/instagram';

export const instagramConfig: InstagramConfig = {
  featuredProfiles: [
    {
      username: 'miishi.khanna.official',
      displayName: 'Miishi Khanna',
      profilePicture: '', // Will be populated by scraper
      followerCount: 0, // Will be populated by scraper
      lastUpdated: new Date(0), // Will be populated by scraper
      isActive: true
    },
    {
      username: 'miishi.alt',
      displayName: 'Miishi Alt',
      profilePicture: '', // Will be populated by scraper
      followerCount: 0, // Will be populated by scraper
      lastUpdated: new Date(0), // Will be populated by scraper
      isActive: true
    }
  ]
}; 