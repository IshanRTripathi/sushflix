// Type definitions for settings module

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    showEmail: boolean;
    showActivity: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
  };
}

export type SettingsTab = 'account' | 'notifications' | 'privacy' | 'billing' | 'appearance';

export interface SettingsUpdatePayload {
  path: string;
  value: unknown;
}
