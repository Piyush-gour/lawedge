const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const VideoProgress = require('../models/VideoProgress');
const Video = require('../models/Video');
const PYQ = require('../models/PYQ');
const TestAttempt = require('../models/TestAttempt');
const Subject = require('../models/Subject');
const Todo = require('../models/Todo');
const Document = require('../models/Document');

const router = express.Router();

// GET /api/dashboard/badges (Student)
router.get('/badges', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. First Steps: Complete 1 study session (Todo or Test)
    const todoCount = await Todo.countDocuments({ user: userId, completed: true });
    const testCount = await TestAttempt.countDocuments({ user: userId });
    const hasFirstSteps = (todoCount + testCount) >= 1;

    // 2. Task Master: Complete 10 Daily Goals
    const hasTaskMaster = todoCount >= 10;

    // 3. Librarian: Upload 5 documents to the Vault
    const docCount = await Document.countDocuments({ user: userId });
    const hasLibrarian = docCount >= 5;

    // 4. Consistency King: Calculate streak from Heatmap data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTodos = await Todo.find({ user: userId, completed: true, updatedAt: { $gte: sevenDaysAgo } });
    const recentTests = await TestAttempt.find({ user: userId, startTime: { $gte: sevenDaysAgo } });
    
    const activeDates = new Set();
    recentTodos.forEach(t => activeDates.add(new Date(t.updatedAt).toDateString()));
    recentTests.forEach(t => activeDates.add(new Date(t.startTime).toDateString()));
    
    const hasConsistencyKing = activeDates.size >= 7;

    const badges = [
      { id: 'first_steps', name: 'First Steps', description: 'Complete 1 study session', icon: '🥉', unlocked: hasFirstSteps },
      { id: 'task_master', name: 'Task Master', description: 'Complete 10 Daily Goals', icon: '🎯', unlocked: hasTaskMaster },
      { id: 'librarian', name: 'Librarian', description: 'Upload 5 documents', icon: '📚', unlocked: hasLibrarian },
      { id: 'consistency_king', name: 'Consistency King', description: 'Study 7 days in a row', icon: '🔥', unlocked: hasConsistencyKing }
    ];

    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard — aggregated stats for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Videos stats
    const totalVideos = await Video.countDocuments();
    const watchedVideos = await VideoProgress.countDocuments({
      user: userId,
      watched: true,
    });

    // PYQ stats
    const totalPYQs = await PYQ.countDocuments();

    // Test stats
    const testAttempts = await TestAttempt.find({
      user: userId,
      status: 'completed',
    });
    const totalTests = testAttempts.length;
    const avgScore =
      totalTests > 0
        ? Math.round(
            testAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalTests
          )
        : 0;

    // Subject-wise video progress
    const subjects = await Subject.find().sort({ order: 1 });
    const subjectProgress = await Promise.all(
      subjects.map(async (subject) => {
        const subjectVideos = await Video.countDocuments({ subject: subject._id });
        const subjectWatched = await VideoProgress.countDocuments({
          user: userId,
          watched: true,
          video: {
            $in: await Video.find({ subject: subject._id }).distinct('_id'),
          },
        });
        return {
          subject: {
            _id: subject._id,
            name: subject.name,
            slug: subject.slug,
            color: subject.color,
            icon: subject.icon,
          },
          total: subjectVideos,
          watched: subjectWatched,
          percentage: subjectVideos > 0 ? Math.round((subjectWatched / subjectVideos) * 100) : 0,
        };
      })
    );

    // Recent activity (last 5 watched videos)
    const recentActivity = await VideoProgress.find({
      user: userId,
      watched: true,
    })
      .sort({ watchedAt: -1 })
      .limit(5)
      .populate({
        path: 'video',
        populate: { path: 'subject', select: 'name color icon' },
      });

    res.json({
      success: true,
      stats: {
        videos: { total: totalVideos, watched: watchedVideos },
        pyqs: { total: totalPYQs },
        tests: { total: totalTests, avgScore },
      },
      subjectProgress,
      recentActivity: recentActivity.map((a) => ({
        video: a.video,
        watchedAt: a.watchedAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/progress (Student)
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ user: req.user._id })
      .populate('test', 'title totalMarks duration subject')
      .sort({ completedAt: 1 }); // Oldest first for chronological chart

    let totalScore = 0;
    let totalQuestions = 0;
    let bestScore = 0;
    let bestPercentage = 0;

    const chartData = attempts.map((a, i) => {
      totalScore += a.score;
      totalQuestions += a.totalQuestions;
      
      if (a.percentage > bestPercentage) {
        bestPercentage = a.percentage;
        bestScore = a.score;
      }

      return {
        name: `Test ${i + 1}`,
        score: a.score,
        percentage: a.percentage,
        date: new Date(a.completedAt).toLocaleDateString('en-GB'),
        title: a.test?.title || 'Unknown Test',
      };
    });

    const averagePercentage = attempts.length > 0 
      ? Math.round((totalScore / totalQuestions) * 100) 
      : 0;

    // Send latest attempts sorted newest first for the activity feed
    const recentActivity = [...attempts].reverse().slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalTests: attempts.length,
        averagePercentage,
        bestPercentage,
      },
      chartData,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/todos (Student)
router.get('/todos', authMiddleware, async (req, res) => {
  try {
    const Todo = require('../models/Todo');
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, todos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/dashboard/todos (Student)
router.post('/todos', authMiddleware, async (req, res) => {
  try {
    const Todo = require('../models/Todo');
    const todo = await Todo.create({ user: req.user._id, text: req.body.text });
    res.json({ success: true, todo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/dashboard/todos/:id (Student) - Toggle status
router.put('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const Todo = require('../models/Todo');
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
    
    todo.completed = !todo.completed;
    await todo.save();
    res.json({ success: true, todo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/dashboard/todos/:id (Student)
router.delete('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const Todo = require('../models/Todo');
    await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/heatmap (Student)
router.get('/heatmap', authMiddleware, async (req, res) => {
  try {
    const Todo = require('../models/Todo');
    const TestAttempt = require('../models/TestAttempt');

    // Generate the entire year of 2026 (Jan 1 to Dec 31)
    const startDate = new Date(2026, 0, 1); // Jan 1, 2026
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(2026, 11, 31); // Dec 31, 2026
    endDate.setHours(23, 59, 59, 999);

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Initialize map with 0s to force calendar width
    const activityMap = {};
    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      activityMap[dateStr] = 0;
    }

    // Fetch activities
    const tests = await TestAttempt.find({ 
      user: req.user._id, 
      status: 'completed',
      completedAt: { $gte: startDate } 
    }).select('completedAt');

    const todos = await Todo.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    }).select('createdAt');

    const addActivity = (dateObj) => {
      if (!dateObj) return;
      const dateStr = dateObj.toISOString().split('T')[0];
      if (activityMap[dateStr] !== undefined) {
        activityMap[dateStr] += 1;
      }
    };

    tests.forEach(t => addActivity(t.completedAt));
    todos.forEach(t => addActivity(t.createdAt));

    // Convert to array format required by react-activity-calendar
    const data = Object.keys(activityMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        count: activityMap[date],
        level: Math.min(4, Math.ceil(activityMap[date] / 2)) // Scale 0-4
      }));

    res.json({ success: true, heatmap: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
