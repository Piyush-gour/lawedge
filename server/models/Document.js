const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a document title']
  },
  type: {
    type: String,
    enum: ['bare_act', 'note', 'pyq', 'other'],
    required: true,
    default: 'bare_act'
  },
  subject: {
    type: String,
    required: true,
    default: 'General'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
