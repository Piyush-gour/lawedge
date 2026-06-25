const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// @route   GET /api/admin/users
// @desc    Get all users with their basic analytics
// @access  Private/Admin
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get all users, excluding password
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

    // Fetch analytics for each user
    const usersWithAnalytics = await Promise.all(
      users.map(async (user) => {
        const attempts = await TestAttempt.find({ user: user._id, status: 'completed' }).lean();
        
        let averageScore = 0;
        let totalTestsCompleted = attempts.length;

        if (totalTestsCompleted > 0) {
          const totalPercentage = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
          averageScore = Math.round(totalPercentage / totalTestsCompleted);
        }

        return {
          ...user,
          analytics: {
            totalTestsCompleted,
            averageScore
          }
        };
      })
    );

    res.json({ users: usersWithAnalytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Private/Admin
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hardcoded protection for Super Admin
    if (userToDelete.email === 'piyushgour988@gmail.com') {
      return res.status(403).json({ message: 'The Super Admin cannot be deleted.' });
    }

    // Prevent an admin from deleting another admin
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot be deleted.' });
    }

    // Delete associated test attempts
    await TestAttempt.deleteMany({ user: userToDelete._id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

// @route   GET /api/admin/active-users
// @desc    Get users active within the last 5 minutes (Owner only)
// @access  Private/Owner
router.get('/active-users', authMiddleware, async (req, res) => {
  try {
    // Only grafiqly.in@gmail.com can access this
    if (req.user.email !== 'grafiqly.in@gmail.com') {
      return res.status(403).json({ message: 'Access denied. Owner only feature.' });
    }

    // 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await User.find({
      lastActiveAt: { $gte: fiveMinutesAgo }
    })
    .select('name email role lastActiveAt avatar')
    .sort({ lastActiveAt: -1 })
    .lean();

    res.json({ success: true, activeUsers });
  } catch (err) {
    console.error('Error fetching active users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
