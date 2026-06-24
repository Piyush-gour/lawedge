const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({ email, password, name });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user signed up via social login (no password set)
    if (user.provider !== 'local') {
      return res.status(401).json({
        success: false,
        message: `This account uses ${user.provider} sign-in. Please use that method.`,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

// POST /api/auth/google
// Handles Google Sign-In — verifies the credential token from Google Identity Services,
// then either finds or creates a user in the database.
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists — update provider if they originally signed up with email
      if (user.provider === 'local') {
        user.provider = 'google';
        await user.save();
      }
    } else {
      // Create new user (no password needed for Google sign-in)
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        password: googleId + Date.now(), // Random password (won't be used)
        provider: 'google',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: user ? 'Logged in with Google successfully' : 'Account created with Google',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Google authentication failed. Please try again.',
    });
  }
});

// PUT /api/auth/profile
// Updates user profile details including base64 avatar
const authMiddleware = require('../middleware/authMiddleware');

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email is already in use.' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating profile.' });
  }
});

// PUT /api/auth/password
// Updates user password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating password.' });
  }
});

module.exports = router;
