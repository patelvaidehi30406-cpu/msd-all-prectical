const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isMongoConnected } = require('../config/db');
const { localUserStore } = require('../config/localStore');

/**
 * Helper to generate a signed JWT for a user ID
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'practical13_fallback_secret';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user;
    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });
    } else {
      const existingUser = await localUserStore.findOneByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      user = await localUserStore.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * @desc    Authenticate user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user;
    let isPasswordValid = false;

    if (isMongoConnected()) {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (user) {
        isPasswordValid = await user.matchPassword(password);
      }
    } else {
      user = await localUserStore.findOneByEmail(normalizedEmail);
      if (user) {
        isPasswordValid = await localUserStore.matchPassword(password, user.password);
      }
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
