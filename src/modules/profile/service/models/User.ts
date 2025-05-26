import mongoose, { Document, Model, Schema, Types, HydratedDocument } from 'mongoose';

// User role types
export type UserRole = 'user' | 'creator' | 'admin' | 'moderator';

// Interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  displayName?: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  facebookId?: string;
  emailVerified: boolean;
  role: UserRole;
  lastLogin?: Date;
  isCreator: boolean;
  profilePicture: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Omit<this, 'password' | 'refreshToken' | 'updatedAt'>;
}

// Interface for User model
export interface IUserModel extends Model<IUser> {
  findOrCreate(providerData: {
    provider: 'google' | 'github' | 'facebook';
    id: string;
    email: string;
    name: string;
    picture: string;
  }): Promise<HydratedDocument<IUser>>;
}

// Create the schema
const UserSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'creator', 'admin', 'moderator'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
    },
    isCreator: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
