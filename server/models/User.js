import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
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
  },
  
  // Sistema de referidos
  referralId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  
  referralStats: {
    totalReferrals: {
      type: Number,
      default: 0
    }
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
userSchema.index({ referralId: 1 }, { unique: true, sparse: true });
userSchema.index({ referredBy: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.username;
});

// Method to encrypt password
userSchema.pre('save', async function(next) {
  // Only encrypt if password has been modified
  if (!this.isModified('password')) {
    console.log('🔑 Password not modified, skipping encryption');
    return next();
  }
  
  try {
    console.log('🔑 Encrypting password...');
    // Generate salt and encrypt password
    const salt = await bcrypt.genSalt(12);
    console.log('🔑 Salt generated, hashing password...');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔑 Password encrypted successfully');
    next();
  } catch (error) {
    console.error('❌ Error encrypting password:', error);
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔑 Comparing passwords...');
    console.log('🔑 Candidate password provided:', !!candidatePassword);
    console.log('🔑 Stored password hash exists:', !!this.password);
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔑 Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error comparing passwords:', error);
    throw error;
  }
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
  return this.countDocuments(query).then(count => count > 0);
};

// Static method to generate unique referral ID
userSchema.statics.generateReferralId = async function() {
  const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  let referralId;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    referralId = generateId();
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Unable to generate unique referral ID after multiple attempts');
    }
  } while (await this.countDocuments({ referralId }).then(count => count > 0));

  return referralId;
};

// Method to get referral link
userSchema.methods.getReferralLink = function() {
  if (!this.referralId) return null;
  
  // Nota: Este método no tiene acceso a config, se recomienda usar el controlador
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://clipchain.app' 
    : 'http://localhost:5173';
    
  return `${baseUrl}/ref/${this.referralId}`;
};

// Method to update referral stats
userSchema.methods.updateReferralStats = function(increment = 1) {
  this.referralStats.totalReferrals += increment;
  return this.save();
};

export const User = mongoose.model('User', userSchema);
