const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isMongoConnected } = require('../config/db');
const { localUserStore } = require('../config/localStore');

/**
 * Middleware to verify JWT token and attach authenticated user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No authentication token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || 'practical13_fallback_secret';
    const decoded = jwt.verify(token, secret);

    let user;
    if (isMongoConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = await localUserStore.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

module.exports = { protect };
