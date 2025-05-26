import { Document, Model, Types } from 'mongoose';
import { UserRole } from './user.roles';

/** Core user interface representing the base user document in the database */
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  id: string;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

/** User model static methods for database operations */
export interface IUserModel extends Model<IUser> {
  /**
   * Find a user by email or username
   */
  findByEmailOrUsername(identifier: string): Promise<IUser | null>;
  
  /**
   * Find or create a user (useful for OAuth flows)
   */
  findOrCreate(profile: {
    email: string;
    username: string;
    name?: string;
    picture?: string;
  }): Promise<{ user: IUser; isNew: boolean }>;
  
  /**
   * Check if a username is available
   */
  isUsernameAvailable(username: string): Promise<boolean>;
  
  /**
   * Check if an email is available
   */
  isEmailAvailable(email: string): Promise<boolean>;
}

/** Data required to create a new user account */
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  emailVerified?: boolean;
}

/** Data required to update an existing user account */
export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  emailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  refreshToken?: string | null;
}

/** Authentication response containing user data and tokens */
export interface AuthUserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
