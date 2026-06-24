const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/syllabus/progress
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, completedTopics: user.completedSyllabusTopics || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/syllabus/toggle
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const { topicId, completed } = req.body;
    
    if (completed) {
      // Add topic if not exists
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { completedSyllabusTopics: topicId }
      });
    } else {
      // Remove topic
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { completedSyllabusTopics: topicId }
      });
    }
    
    // Fetch updated list
    const updatedUser = await User.findById(req.user._id);
    res.json({ success: true, completedTopics: updatedUser.completedSyllabusTopics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
