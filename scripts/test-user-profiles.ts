import { userProfileService } from '../src/services/userProfileService';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    logger.info('Starting user profile service test');
    
    // Test getting featured profiles
    const featuredProfiles = await userProfileService.getFeaturedProfiles();
    logger.info('Featured profiles:', { count: featuredProfiles.length });
    
    // Test getting individual profiles
    for (const profile of featuredProfiles) {
      // Test getting profile by username
      const userProfile = await userProfileService.getProfileByUsername(profile.username);
      
      if (userProfile) {
        logger.info('Successfully retrieved profile by username:', {
          username: userProfile.username,
          displayName: userProfile.displayName,
          lastUpdated: userProfile.lastUpdated
        });

        // Test updating profile
        const updateSuccess = await userProfileService.updateProfile(userProfile.userId, {
          displayName: `Updated ${userProfile.displayName}`,
          email: `updated_${userProfile.email}`,
          bio: 'This is an updated bio'
        });

        if (updateSuccess) {
          logger.info('Successfully updated profile:', {
            userId: userProfile.userId,
            username: userProfile.username
          });
        } else {
          logger.error(`Failed to update profile: ${userProfile.userId}`);
        }
      } else {
        logger.error(`Failed to retrieve profile: ${profile.username}`);
      }
    }
  } catch (error) {
    logger.error('Test failed', { error });
  }
}

main(); 