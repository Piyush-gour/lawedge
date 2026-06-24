const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeId: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    instructor: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['Hinglish', 'English', 'Hindi'],
      default: 'Hinglish',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Auto-generate thumbnail URL from YouTube ID if not provided
videoSchema.pre('save', function (next) {
  if (!this.thumbnailUrl && this.youtubeId) {
    this.thumbnailUrl = `https://img.youtube.com/vi/${this.youtubeId}/mqdefault.jpg`;
  }
  next();
});

module.exports = mongoose.model('Video', videoSchema);
