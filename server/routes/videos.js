const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Video = require('../models/Video');
const VideoProgress = require('../models/VideoProgress');

const router = express.Router();

// GET /api/videos — list all videos, optionally filter by subject
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;

    const videos = await Video.find(filter)
      .populate('subject', 'name slug color icon')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/videos/:id — get single video details
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      'subject',
      'name slug color icon'
    );

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/videos/progress/all — get user's progress for all videos
router.get('/progress/all', authMiddleware, async (req, res) => {
  try {
    const progress = await VideoProgress.find({ user: req.user._id });
    // Return a map of videoId → progress object for easy lookup
    const progressMap = {};
    progress.forEach((p) => {
      progressMap[p.video.toString()] = {
        watched: p.watched,
        watchedAt: p.watchedAt,
        notes: p.notes,
      };
    });
    res.json({ success: true, progress: progressMap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/videos/:id/progress — toggle watched status for a video
router.post('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { watched, notes } = req.body;

    const progress = await VideoProgress.findOneAndUpdate(
      { user: req.user._id, video: req.params.id },
      {
        watched,
        watchedAt: watched ? new Date() : null,
        ...(notes !== undefined && { notes }),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/videos — Create a new video (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/videos/:id — Update a video (Admin only)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/videos/:id — Delete a video (Admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    await VideoProgress.deleteMany({ video: req.params.id }); // cascade delete progress
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
