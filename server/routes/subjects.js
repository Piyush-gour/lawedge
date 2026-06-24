const express = require('express');
const Subject = require('../models/Subject');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// GET /api/subjects — list all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 });
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/subjects — Create a new subject (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, slug, icon, color, description, order } = req.body;
    const subject = await Subject.create({
      name, slug, icon, color, description, order
    });
    res.status(201).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/subjects/:id — Update a subject (Admin only)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/subjects/:id — Delete a subject (Admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
