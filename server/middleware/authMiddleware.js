const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'whiskedaway-super-secret-key-prod-2026';

// 1. Authenticate JWT Middleware
const protect = async (req, res, next) => {
  let token;

  // Check Cookies first, then Auth Header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User account inactive or not found.' }
      });
    }

    // Check if password changed after token issuance
    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          error: { code: 'SESSION_EXPIRED', message: 'Password recently changed. Please log in again.' }
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid token.' }
    });
  }
};

// 2. Optional Authenticate Middleware (Attaches user if token present, but doesn't block guests)
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
    } catch (e) { }
  }
  next();
};

// 3. Rate Limiters
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 min for auth actions
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again later.' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const availabilityRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 availability checks per min
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many checks. Please slow down.' }
  }
});

// 4. CSRF Protection Middleware for State-Changing Requests
const csrfProtection = (req, res, next) => {
  // Safe methods skip CSRF check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check header present for SPA requests
  const customHeader = req.headers['x-requested-with'] || req.headers['x-csrf-token'];
  if (!customHeader && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: { code: 'CSRF_VALIDATION_FAILED', message: 'Security token missing or invalid request header.' }
    });
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  authRateLimiter,
  availabilityRateLimiter,
  csrfProtection,
  JWT_SECRET
};
