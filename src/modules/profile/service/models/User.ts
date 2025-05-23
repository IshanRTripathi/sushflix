import mongoose, { Document, Model, Schema, Types, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

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
    googleId: {
      type: String,
      sparse: true,
    },
    githubId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
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

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (excludes sensitive data)
UserSchema.methods.getPublicProfile = function (this: IUser) {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  delete user.updatedAt;
  return user as Omit<this, 'password' | 'refreshToken' | 'updatedAt'>;
};

// Static method to find or create user for OAuth
UserSchema.statics.findOrCreate = async function (
  this: IUserModel,
  { provider, id, email, name, picture }: {
    provider: 'google' | 'github' | 'facebook';
    id: string;
    email: string;
    name: string;
    picture: string;
  }
): Promise<HydratedDocument<IUser>> {
  // First try to find by provider ID
  let user = await this.findOne({ [`${provider}Id`]: id });

  if (!user) {
    // If not found, try to find by email
    user = await this.findOne({ email });

    if (user) {
      // If user exists but doesn't have this provider ID, add it
      user[`${provider}Id`] = id;
      await user.save();
    } else {
      // Create new user
      const username = await generateUniqueUsername(this, name);
      
      const userData: any = {
        email,
        username,
        displayName: name,
        profilePicture: picture,
        emailVerified: true,
        isCreator: false,
      };
      
      // Set the provider ID dynamically
      userData[`${provider}Id`] = id;
      
      user = await this.create(userData);
    }
  }

  return user;
};

// Helper function to generate unique username
async function generateUniqueUsername(
  model: Model<IUser>,
  baseName: string
): Promise<string> {
  // Convert to URL-friendly string
  let username = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  // Ensure username meets length requirements
  if (username.length < 3) {
    username = `user${Math.floor(Math.random() * 10000)}`;
  } else if (username.length > 20) {
    username = username.substring(0, 20);
  }

  // Check if username exists
  let exists = await model.exists({ username });
  let counter = 1;
  let newUsername = username;

  while (exists) {
    newUsername = `${username}${counter}`;
    exists = await model.exists({ username: newUsername });
    counter++;
  }

  return newUsername;
}

// Create and export the model
const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
