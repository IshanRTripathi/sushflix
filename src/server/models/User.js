// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only for local auth
    },
    select: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin', 'moderator'],
    default: 'user'
  },
  lastLogin: {
    type: Date
  },
  // Keep these for backward compatibility
  isCreator: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for profile data
UserSchema.virtual('profile', {
  ref: 'UserProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Check if the password is already hashed (starts with $2a$)
    if (this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    console.log('No password set for user');
    return false;
  }
  
  try {
    console.log('Comparing passwords...');
    console.log('Candidate password length:', candidatePassword.length);
    console.log('Stored hash length:', this.password.length);
    console.log('Stored hash starts with:', this.password.substring(0, 10));
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    
    if (!isMatch) {
      // Try with trimmed password in case of whitespace issues
      const trimmedPassword = candidatePassword.trim();
      if (trimmedPassword !== candidatePassword) {
        console.log('Trying with trimmed password...');
        return await bcrypt.compare(trimmedPassword, this.password);
      }
    }
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Method to get public user data (exclude sensitive info)
UserSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  
  // Remove sensitive data
  delete user.password;
  delete user.__v;
  delete user.updatedAt;
  
  return user;
};

// Static method to find or create user from OAuth
UserSchema.statics.findOrCreate = async function(providerData) {
  const { provider, id, email, name, picture } = providerData;
  
  // Try to find user by provider ID
  let user = await this.findOne({ [`${provider}Id`]: id });
  
  if (!user) {
    // If not found by provider ID, try to find by email
    user = await this.findOne({ email });
    
    if (user) {
      // Link provider to existing account
      user[`${provider}Id`] = id;
      if (!user.displayName) user.displayName = name;
      if (!user.profilePicture) user.profilePicture = picture;
      await user.save();
    } else {
      // Create new user
      user = await this.create({
        email,
        username: email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000),
        displayName: name,
        profilePicture: picture,
        emailVerified: true,
        [`${provider}Id`]: id
      });
    }
  }
  
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;