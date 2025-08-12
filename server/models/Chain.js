import mongoose from 'mongoose';

const chainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chain name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  clips: [{
    clip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clip',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: [0, 'Order cannot be negative']
    },
    transition: {
      type: String,
      enum: ['cut', 'fade', 'crossfade', 'slide'],
      default: 'cut'
    },
    transitionDuration: {
      type: Number,
      default: 0.5,
      min: [0, 'Transition duration cannot be negative'],
      max: [5, 'Transition duration cannot exceed 5 seconds']
    }
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
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  
  category: {
    type: String,
    enum: ['tutorial', 'entertainment', 'education', 'music', 'gaming', 'other'],
    default: 'other'
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  totalDuration: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  plays: {
    type: Number,
    default: 0
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  metadata: {
    language: {
      type: String,
      default: 'en'
    },
    ageRating: {
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R'],
      default: 'G'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chainSchema.index({ name: 'text', description: 'text', tags: 'text' });
chainSchema.index({ author: 1 });
chainSchema.index({ category: 1 });
chainSchema.index({ difficulty: 1 });
chainSchema.index({ isPublic: 1 });
chainSchema.index({ isFeatured: 1 });
chainSchema.index({ createdAt: -1 });
chainSchema.index({ views: -1 });
chainSchema.index({ plays: -1 });

// Virtual for clip count
chainSchema.virtual('clipCount').get(function() {
  return this.clips.length;
});

// Method to calculate total duration
chainSchema.methods.calculateTotalDuration = async function() {
  let total = 0;
  
  for (const clipRef of this.clips) {
    const clip = await mongoose.model('Clip').findById(clipRef.clip);
    if (clip) {
      total += clip.duration || (clip.endTime - clip.startTime);
    }
  }
  
  this.totalDuration = total;
  return this.save();
};

// Method to add clip to chain
chainSchema.methods.addClip = function(clipId, order = null) {
  const newOrder = order !== null ? order : this.clips.length;
  
  this.clips.push({
    clip: clipId,
    order: newOrder,
    transition: 'cut',
    transitionDuration: 0.5
  });
  
  // Reorder if necessary
  if (order !== null) {
    this.reorderClips();
  }
  
  return this.save();
};

// Method to remove clip from chain
chainSchema.methods.removeClip = function(clipId) {
  this.clips = this.clips.filter(clipRef => clipRef.clip.toString() !== clipId.toString());
  this.reorderClips();
  return this.save();
};

// Method to reorder clips
chainSchema.methods.reorderClips = function() {
  this.clips.sort((a, b) => a.order - b.order);
  
  // Reassign order numbers
  this.clips.forEach((clipRef, index) => {
    clipRef.order = index;
  });
  
  return this.save();
};

// Method to increment views
chainSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment plays
chainSchema.methods.incrementPlays = function() {
  this.plays += 1;
  return this.save();
};

// Method to toggle like/dislike
chainSchema.methods.toggleReaction = function(userId, reactionType) {
  const likeIndex = this.likes.indexOf(userId);
  const dislikeIndex = this.dislikes.indexOf(userId);
  
  if (reactionType === 'like') {
    if (likeIndex > -1) {
      this.likes.splice(likeIndex, 1);
    } else {
      this.likes.push(userId);
      if (dislikeIndex > -1) {
        this.dislikes.splice(dislikeIndex, 1);
      }
    }
  } else if (reactionType === 'dislike') {
    if (dislikeIndex > -1) {
      this.dislikes.splice(dislikeIndex, 1);
    } else {
      this.dislikes.push(userId);
      if (likeIndex > -1) {
        this.likes.splice(likeIndex, 1);
      }
    }
  }
  
  return this.save();
};

// Method to get public data
chainSchema.methods.getPublicData = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    clipCount: this.clipCount,
    category: this.category,
    difficulty: this.difficulty,
    tags: this.tags,
    totalDuration: this.totalDuration,
    views: this.views,
    plays: this.plays,
    isFeatured: this.isFeatured,
    createdAt: this.createdAt
  };
};

export const Chain = mongoose.model('Chain', chainSchema);
