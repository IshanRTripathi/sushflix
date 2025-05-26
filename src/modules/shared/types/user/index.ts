// Core user types
export * from './user.roles';
export * from './user.core';
export * from './user.profile';
export * from './user.preferences';
export * from './user.stats';

// Re-export commonly used types for backward compatibility
export type { UserRole } from './user.roles';
export type { IUser, IUserModel } from './user.core';
export type { IUserProfile, IUserProfileBase, IUserProfileStats } from './user.profile';
export type { IUserStatsSummary } from './user.stats';

// Export types for API responses
export * from './api.types';
