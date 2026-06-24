const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    answers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: {
          type: Number,
          default: -1, // -1 = unanswered
        },
        status: {
          type: String,
          enum: ['not-visited', 'not-answered', 'answered', 'marked', 'answered-marked'],
          default: 'not-visited'
        },
        isCorrect: Boolean,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: Number,
    percentage: Number,
    timeTaken: Number, // total seconds
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    completedAt: Date,
  },
  { timestamps: true }
);

testAttemptSchema.index({ user: 1, test: 1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
