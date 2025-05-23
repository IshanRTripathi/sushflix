/** Available user roles in the application */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  CREATOR: 'creator'
} as const;

/** Type representing a user role in the system */
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/** Checks if a value is a valid user role */
export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && Object.values(USER_ROLES).includes(role as UserRole);
}

/** Type guard that throws an error if the value is not a valid user role */
export function assertUserRole(role: unknown): asserts role is UserRole {
  if (!isUserRole(role)) {
    throw new Error(`Invalid user role: ${role}`);
  }
}
