import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  displayName: {
    type: String,
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150x150'
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de']
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  stats: {
    totalClips: {
      type: Number,
      default: 0
    },
    totalChains: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    }
  },
  
  social: {
    youtube: String,
    twitter: String,
    instagram: String,
    website: String
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isVerified: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.displayName || this.username;
});

// Method to encrypt password
userSchema.pre('save', async function(next) {
  // Only encrypt if password has been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and encrypt password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update statistics
userSchema.methods.updateStats = function(type, increment = 1) {
  switch (type) {
    case 'clips':
      this.stats.totalClips += increment;
      break;
    case 'chains':
      this.stats.totalChains += increment;
      break;
    case 'views':
      this.stats.totalViews += increment;
      break;
  }
  return this.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    bio: this.bio,
    stats: this.stats,
    social: this.social,
    createdAt: this.createdAt
  };
};

// Static method to find users by username or email
userSchema.statics.findByUsernameOrEmail = function(query) {
  return this.findOne({
    $or: [
      { username: query },
      { email: query }
    ]
  });
};

// Static method to check if user exists
userSchema.statics.exists = function(field, value) {
  const query = {};
  query[field] = value;
  return this.exists(query);
};

export const User = mongoose.model('User', userSchema);
