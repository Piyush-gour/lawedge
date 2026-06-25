const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token from the Authorization header
 * and attaches the user document to req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    req.user = user;

    // Track active user heartbeat (update max once per minute)
    const now = Date.now();
    if (!user.lastActiveAt || (now - new Date(user.lastActiveAt).getTime()) > 60000) {
      // Fire and forget update (don't block the request)
      User.updateOne({ _id: user._id }, { lastActiveAt: new Date(now) }).catch(err => 
        console.error('Failed to update lastActiveAt', err)
      );
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

module.exports = authMiddleware;
