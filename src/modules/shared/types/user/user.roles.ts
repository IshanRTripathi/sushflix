/**
 * User roles and permissions
 * Defines the different user roles and their associated permissions
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  CREATOR: 'creator'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Checks if a value is a valid user role
 * @param role The value to check
 * @returns boolean indicating if the value is a valid role
 */
export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && Object.values(USER_ROLES).includes(role as UserRole);
}

/**
 * Type guard for user role
 * @param role The value to check
 * @returns The role if valid, otherwise throws an error
 * @throws {Error} If the role is invalid
 */
export function assertUserRole(role: unknown): asserts role is UserRole {
  if (!isUserRole(role)) {
    throw new Error(`Invalid user role: ${role}`);
  }
}
