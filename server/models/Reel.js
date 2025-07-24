const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true // Duration in seconds
    },
    thumbnail: {
      type: String,
      required: true
    }
  },
  caption: {
    type: String,
    maxlength: 2200
  },
  audio: {
    name: {
      type: String,
      default: 'Original audio'
    },
    url: {
      type: String
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ views: -1 });

module.exports = mongoose.model('Reel', reelSchema);