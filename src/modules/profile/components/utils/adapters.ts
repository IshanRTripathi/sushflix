import { IUserProfile } from "@/modules/shared/types/user";

export function createUserProfileAdapter(user : IUserProfile) {
  return {
    displayName: user.displayName || 'Unknown',
    bio: user.bio || '',
    socialLinks: user.socialLinks || {},
    stats: {
      postCount: user.stats['posts'] || 0,
      followerCount: user.stats['followers'] || 0,
      followingCount: user.stats['following'] || 0,
      subscriberCount: 0,
    },
    isCreator: user.isCreator || false,
    isVerified: user.isVerified || false,
    profilePicture: user.profilePicture || '',
  };
}
