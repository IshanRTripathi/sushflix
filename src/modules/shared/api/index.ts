// Core
import apiClient from './apiClient';

// Auth
import * as authApi from './auth/auth.api';

// Profile
import * as profileApi from './profile/profile.api';

// Re-export everything
export { apiClient, authApi, profileApi };

// Export types
export * from './auth/auth.api';
export * from './profile/profile.api';
