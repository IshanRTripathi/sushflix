/**
 * User notification preferences
 */
export interface INotificationPreferences {
  // Email notifications
  email: {
    enabled: boolean;
    marketing: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
    [key: string]: boolean; // Allow for additional email preferences
  };
  
  // Push notifications
  push: {
    enabled: boolean;
    newFollower: boolean;
    newComment: boolean;
    newLike: boolean;
    newMessage: boolean;
    [key: string]: boolean; // Allow for additional push preferences
  };
  
  // In-app notifications
  inApp: {
    enabled: boolean;
    mentions: boolean;
    comments: boolean;
    reactions: boolean;
    [key: string]: boolean; // Allow for additional in-app preferences
  };
}

/**
 * User display preferences
 */
export interface IDisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'normal' | 'comfortable';
  reduceMotion: boolean;
  reduceTransparency: boolean;
  [key: string]: any; // Allow for additional display preferences
}

/**
 * User privacy preferences
 */
export interface IPrivacyPreferences {
  profileVisibility: 'public' | 'followers' | 'private';
  activityStatus: 'everyone' | 'followers' | 'nobody';
  readReceipts: boolean;
  blockedUsers: string[];
  [key: string]: any; // Allow for additional privacy preferences
}

/**
 * Complete user preferences
 */
export interface IUserPreferences {
  notifications: INotificationPreferences;
  display: IDisplayPreferences;
  privacy: IPrivacyPreferences;
  language: string;
  timezone: string;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  [key: string]: any; // Allow for additional preferences
}

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: IUserPreferences = {
  notifications: {
    email: {
      enabled: true,
      marketing: true,
      productUpdates: true,
      securityAlerts: true,
      newsletter: true,
    },
    push: {
      enabled: true,
      newFollower: true,
      newComment: true,
      newLike: true,
      newMessage: true,
    },
    inApp: {
      enabled: true,
      mentions: true,
      comments: true,
      reactions: true,
    },
  },
  display: {
    theme: 'system',
    fontSize: 'medium',
    density: 'normal',
    reduceMotion: false,
    reduceTransparency: false,
  },
  privacy: {
    profileVisibility: 'public',
    activityStatus: 'everyone',
    readReceipts: true,
    blockedUsers: [],
  },
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  emailFrequency: 'daily',
};

/**
 * Updates user preferences with partial data
 * @param current Current preferences
 * @param updates Partial updates to apply
 * @returns New preferences object with updates applied
 */
export function updateUserPreferences(
  current: IUserPreferences,
  updates: Partial<IUserPreferences>
): IUserPreferences {
  // Deep merge updates into current preferences
  const merged = JSON.parse(JSON.stringify(current));
  
  for (const key in updates) {
    if (updates[key] !== undefined) {
      if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
        // Deep merge for nested objects
        merged[key] = {
          ...merged[key],
          ...(updates[key] as object),
        };
      } else {
        // Direct assignment for primitives and arrays
        merged[key] = updates[key];
      }
    }
  }
  
  return merged;
}
