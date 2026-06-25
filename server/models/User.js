const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    completedSyllabusTopics: [{
      type: String
    }],
    avatar: {
      type: String,
      default: '',
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastStudyDate: { type: Date, default: null },
    },
    lastActiveAt: {
      type: Date,
      default: null
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
