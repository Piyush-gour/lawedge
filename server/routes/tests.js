const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');

const router = express.Router();

// GET /api/tests — List all active tests (Student)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true })
      .populate('subject', 'name icon color')
      .select('-questions.correctAnswer -questions.explanation')
      .sort({ createdAt: -1 });

    // For each test, check if the user has attempted it
    const testIds = tests.map((t) => t._id);
    const attempts = await TestAttempt.find({
      user: req.user._id,
      test: { $in: testIds },
    }).select('test status score percentage');

    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[a.test.toString()] = a;
    });

    const testsWithStatus = tests.map((t) => ({
      ...t.toObject(),
      attempt: attemptMap[t._id.toString()] || null,
    }));

    res.json({ success: true, tests: testsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tests/:id — Get a single test with questions for taking (Student)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('subject', 'name icon color');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Strip correct answers from the response so students can't cheat
    const sanitizedQuestions = test.questions.map((q, i) => ({
      _id: q._id,
      index: i,
      question: q.question,
      options: q.options,
    }));

    res.json({
      success: true,
      test: {
        _id: test._id,
        title: test.title,
        subject: test.subject,
        type: test.type,
        duration: test.duration,
        totalMarks: test.totalMarks,
        difficulty: test.difficulty,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tests/:id/submit — Submit test answers (Student)
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body; // answers: [{ questionIndex, selectedAnswer }]

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Grade the test
    let score = 0;
    const marksPerQ = test.marksPerQuestion || 1;
    const negMarks = test.negativeMarks || 0.25;

    const gradedAnswers = answers.map((a) => {
      const question = test.questions[a.questionIndex];
      const isAttempted = a.status === 'answered' || a.status === 'answered-marked';
      let isCorrect = false;

      if (isAttempted && question) {
        if (a.selectedAnswer === question.correctAnswer) {
          isCorrect = true;
          score += marksPerQ;
        } else {
          score -= negMarks;
        }
      }

      return {
        questionIndex: a.questionIndex,
        selectedAnswer: a.selectedAnswer,
        status: a.status || 'not-visited',
        isCorrect,
      };
    });

    const totalQuestions = test.questions.length;
    const maxScore = totalQuestions * marksPerQ;
    // Don't let percentage go below 0
    const percentage = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;

    // Save or update attempt
    const attempt = await TestAttempt.findOneAndUpdate(
      { user: req.user._id, test: test._id },
      {
        answers: gradedAnswers,
        score,
        totalQuestions,
        percentage,
        timeTaken: timeTaken || 0,
        status: 'completed',
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Return results with correct answers and explanations for review
    const results = test.questions.map((q, i) => {
      const userAnswer = gradedAnswers.find((a) => a.questionIndex === i);
      return {
        index: i,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect: userAnswer ? userAnswer.isCorrect : false,
      };
    });

    res.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      results,
    });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Admin Routes ───

// GET /api/tests/admin/all — List ALL tests including inactive (Admin)
router.get('/admin/all', adminMiddleware, async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('subject', 'name icon color')
      .sort({ createdAt: -1 });
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tests — Create a test (Admin)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/tests/:id — Update a test (Admin)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/tests/:id — Delete a test (Admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    await TestAttempt.deleteMany({ test: req.params.id });
    res.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
