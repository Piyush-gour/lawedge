const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const videoRoutes = require('./routes/videos');
const pyqRoutes = require('./routes/pyqs');
const testRoutes = require('./routes/tests');
const dashboardRoutes = require('./routes/dashboard');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development; tighten for production if needed
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // increased for test question payloads

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/news', require('./routes/news'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/admin', require('./routes/admin'));



// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
