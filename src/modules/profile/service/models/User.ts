import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User role types
export type UserRole = 'user' | 'creator' | 'admin' | 'moderator';

// Interface for instance methods
export interface IUser extends Document {
  username: string;
  displayName?: string;
  email: string;
  password?: string;
  googleId?: string;
  emailVerified: boolean;
  role: UserRole;
  lastLogin?: Date;
  isCreator: boolean;
  profilePicture: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Partial<IUser>;
}

// Interface for static methods
export interface IUserModel extends Model<IUser> {
  findOrCreate(providerData: {
    provider: 'google';
    id: string;
    email: string;
    name: string;
    picture: string;
  }): Promise<IUser>;
}

const UserSchema = new Schema<IUser>(
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
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required(this: IUser) {
        return !this.googleId;
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Methods
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getPublicProfile = function (this: IUser) {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.updatedAt;
  return user;
};

// Static: OAuth findOrCreate
UserSchema.statics.findOrCreate = async function (
  this: IUserModel,
  { provider, id, email, name, picture }
): Promise<IUser> {
  let user = await this.findOne({ [`${provider}Id`]: id });

  if (!user) {
    user = await this.findOne({ email });

    if (user) {
      user[`${provider}Id`] = id;
      if (!user.displayName) user.displayName = name;
      if (!user.profilePicture) user.profilePicture = picture;
      await user.save();
    } else {
      user = await this.create({
        email,
        username: email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000),
        displayName: name,
        profilePicture: picture,
        emailVerified: true,
        [`${provider}Id`]: id,
      });
    }
  }

  return user;
};

// Pre-save password hashing
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  if (!this.password.startsWith('$2a$')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err as Error);
    }
  }

  next();
});

// Model creation
const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
