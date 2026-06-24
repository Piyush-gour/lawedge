const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (v) => v.length === 4,
      message: 'Exactly 4 options are required',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null, // null = full-length test
    },
    type: {
      type: String,
      enum: ['subject-wise', 'full-length', 'sectional'],
      default: 'subject-wise',
    },
    duration: {
      type: Number, // minutes
      required: true,
    },
    marksPerQuestion: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0.25 },
    questions: [questionSchema],
    totalMarks: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate totalMarks from number of questions * marksPerQuestion
testSchema.pre('save', function (next) {
  const marksPerQ = this.marksPerQuestion || 1;
  this.totalMarks = this.questions.length * marksPerQ;
  next();
});

module.exports = mongoose.model('Test', testSchema);
