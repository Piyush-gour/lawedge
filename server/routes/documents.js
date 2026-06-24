const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/documents (Fetch all documents for logged-in user)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, documents: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/documents (Add a new document link)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, subject, fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'No Google Drive URL provided' });
    }

    const newDoc = new Document({
      title,
      type: type || 'bare_act',
      subject: subject || 'General',
      fileUrl,
      fileName: 'Google Drive Link',
      user: req.user._id
    });

    await newDoc.save();
    res.status(201).json({ success: true, document: newDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/documents/:id (Delete a document)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
