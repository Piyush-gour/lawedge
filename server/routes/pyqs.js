const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const PYQ = require('../models/PYQ');

const router = express.Router();

// GET /api/pyqs — Fetch all PYQs (Student & Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pyqs = await PYQ.find().sort({ year: -1 });
    res.json({ success: true, pyqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/pyqs — Create a new PYQ (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { title, year, driveUrl } = req.body;
    
    // Ensure URL is provided
    if (!driveUrl || !driveUrl.includes('drive.google.com')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Google Drive URL' });
    }

    const pyq = await PYQ.create({ title, year, driveUrl });
    res.status(201).json({ success: true, pyq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/pyqs/:id — Update a PYQ (Admin only)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const pyq = await PYQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, pyq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/pyqs/:id — Delete a PYQ (Admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await PYQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'PYQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
