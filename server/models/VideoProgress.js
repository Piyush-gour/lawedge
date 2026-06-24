const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    watched: {
      type: Boolean,
      default: false,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure one progress record per user per video
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model('VideoProgress', videoProgressSchema);
