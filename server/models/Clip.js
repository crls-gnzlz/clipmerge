import mongoose from 'mongoose';

const clipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  videoId: {
    type: String,
    required: [true, 'Video ID is required'],
    trim: true
  },
  
  startTime: {
    type: Number,
    required: [true, 'Start time is required'],
    min: [0, 'Start time cannot be negative']
  },
  
  endTime: {
    type: Number,
    required: [true, 'End time is required'],
    min: [0, 'End time cannot be negative'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be greater than start time'
    }
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  duration: {
    type: Number,
    default: function() {
      return this.endTime - this.startTime;
    }
  },
  
  thumbnailUrl: {
    type: String,
    default: function() {
      return `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`;
    }
  },
  
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes to improve query performance
clipSchema.index({ videoId: 1 });
clipSchema.index({ author: 1 });
clipSchema.index({ tags: 1 });
clipSchema.index({ isPublic: 1 });
clipSchema.index({ createdAt: -1 });

// Method to increment views
clipSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Pre-save middleware to validate that endTime > startTime
clipSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be greater than start time'));
  } else {
    next();
  }
});

export const Clip = mongoose.model('Clip', clipSchema);
