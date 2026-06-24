const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the PYQ'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please specify the year'],
      min: 2000,
      max: new Date().getFullYear() + 1,
    },
    driveUrl: {
      type: String,
      required: [true, 'Please provide the Google Drive URL'],
    },
  },
  {
    timestamps: true,
  }
);

// Sort by year descending by default
pyqSchema.index({ year: -1 });

module.exports = mongoose.model('PYQ', pyqSchema);
