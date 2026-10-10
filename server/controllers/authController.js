const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const {
  sendVerificationCode,
  sendPasswordResetCode
} = require('../services/emailService');

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'support', 'root', 'api', 'auth',
  'account', 'settings', 'whiskedaway', 'official', 'help', 'system'
];

// Generate 6-Digit Numeric OTP Passcode
const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Token Helpers
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId, family) => {
  return jwt.sign({ id: userId, family }, JWT_SECRET, { expiresIn: '7d' });
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
};

const clearTokenCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth'
  });
};

// Username Format Validation
const validateUsernameFormat = (username) => {
  if (!username || typeof username !== 'string') return 'Username is required.';
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) return 'Username must be between 3 and 30 characters.';
  if (!/^[a-zA-Z0-9_.]+$/.test(trimmed)) return 'Username can only contain letters, numbers, underscores, and periods.';
  if (/^[._]|[._]$/.test(trimmed)) return 'Username cannot start or end with an underscore or period.';
  if (/[._]{2,}/.test(trimmed)) return 'Username cannot contain consecutive underscores or periods.';
  if (RESERVED_USERNAMES.includes(trimmed.toLowerCase())) return 'That username is reserved by the system.';
  return null;
};

// Email Format Validation
const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
};

// Password Policy Validation
const validatePasswordPolicy = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  if (password.length > 128) return 'Password cannot exceed 128 characters.';
  return null;
};

// @desc    Register User
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    const usernameErr = validateUsernameFormat(username);
    if (usernameErr) return res.status(400).json({ success: false, error: { code: 'INVALID_USERNAME', message: usernameErr, field: 'username' } });

    const emailErr = validateEmailFormat(email);
    if (emailErr) return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: emailErr, field: 'email' } });

    const passwordErr = validatePasswordPolicy(password);
    if (passwordErr) return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: passwordErr, field: 'password' } });

    const usernameNorm = username.trim().toLowerCase();
    const emailNorm = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ usernameNormalized: usernameNorm }, { emailNormalized: emailNorm }]
    });

    if (existingUser) {
      const field = existingUser.usernameNormalized === usernameNorm ? 'username' : 'email';
      return res.status(409).json({
        success: false,
        error: { code: field === 'username' ? 'USERNAME_TAKEN' : 'EMAIL_TAKEN', message: `That ${field} is already registered.`, field }
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate 6-Digit OTP Verification Code
    const verifyCode = generateOTPCode();
    const verifyTokenHash = crypto.createHash('sha256').update(verifyCode).digest('hex');
    const verifyExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const user = await User.create({
      username: username.trim(),
      usernameNormalized: usernameNorm,
      email: email.trim(),
      emailNormalized: emailNorm,
      passwordHash,
      displayName: displayName ? displayName.trim() : username.trim(),
      emailVerificationTokenHash: verifyTokenHash,
      emailVerificationTokenExpiresAt: verifyExpires
    });

    // Session & Tokens
    const family = crypto.randomBytes(16).toString('hex');
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id, family);

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await Session.create({
      user: user._id,
      refreshTokenHash: refreshHash,
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || ''
    });

    setTokenCookies(res, accessToken, refreshToken);

    // Send Verification Code via Resend
    sendVerificationCode(user.email, verifyCode).catch(() => { });

    res.status(201).json({
      success: true,
      data: user.toSafeUser(),
      accessToken
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = error.keyPattern.usernameNormalized ? 'username' : 'email';
      return res.status(409).json({
        success: false,
        error: { code: `${field.toUpperCase()}_TAKEN`, message: `That ${field} is already taken.`, field }
      });
    }
    next(error);
  }
};

// @desc    Login User
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { loginInput, password } = req.body;
    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email/username and password are required.' }
      });
    }

    const normInput = loginInput.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ usernameNormalized: normInput }, { emailNormalized: normInput }]
    }).select('+passwordHash');

    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/username or password.' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/username or password.' }
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const family = crypto.randomBytes(16).toString('hex');
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id, family);

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await Session.create({
      user: user._id,
      refreshTokenHash: refreshHash,
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || ''
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      data: user.toSafeUser(),
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await Session.deleteOne({ refreshTokenHash: refreshHash });
    }
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout All Sessions
// @route   POST /api/auth/logout-all
const logoutAll = async (req, res, next) => {
  try {
    if (req.user) {
      await Session.deleteMany({ user: req.user._id });
    }
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Signed out of all active sessions.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token Rotation
// @route   POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token missing.' } });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Expired or invalid refresh token.' } });
    }

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await Session.findOne({ refreshTokenHash: refreshHash });

    if (!session || session.isRevoked) {
      if (session) {
        await Session.updateMany({ family: session.family }, { isRevoked: true });
      }
      clearTokenCookies(res);
      return res.status(401).json({ success: false, error: { code: 'REVOKED_SESSION', message: 'Session revoked due to security violation.' } });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.accountStatus !== 'active') {
      clearTokenCookies(res);
      return res.status(401).json({ success: false, error: { code: 'INACTIVE_USER', message: 'User account inactive.' } });
    }

    const newRefreshToken = generateRefreshToken(user._id, session.family);
    const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    session.refreshTokenHash = newRefreshHash;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    const newAccessToken = generateAccessToken(user._id);
    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      data: user.toSafeUser(),
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user.toSafeUser() });
  } catch (error) {
    next(error);
  }
};

// @desc    Check Username Availability
// @route   GET /api/auth/check-username
const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query;
    const err = validateUsernameFormat(username);
    if (err) {
      return res.status(200).json({ success: true, available: false, reason: err });
    }

    const norm = username.trim().toLowerCase();
    const existing = await User.findOne({ usernameNormalized: norm });
    if (existing) {
      return res.status(200).json({ success: true, available: false, reason: 'That username is already taken.' });
    }

    res.status(200).json({ success: true, available: true, reason: 'Username is available!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check Email Availability
// @route   GET /api/auth/check-email
const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    const err = validateEmailFormat(email);
    if (err) {
      return res.status(200).json({ success: true, available: false, reason: err });
    }

    const norm = email.trim().toLowerCase();
    const existing = await User.findOne({ emailNormalized: norm });
    if (existing) {
      return res.status(200).json({ success: true, available: false, reason: 'That email is already registered.' });
    }

    res.status(200).json({ success: true, available: true, reason: 'Email is available!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email with 6-Digit Code
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { code, email } = req.body;
    if (!code) return res.status(400).json({ success: false, error: { code: 'MISSING_CODE', message: '6-digit passcode is required.' } });

    const codeHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');

    let query = {
      emailVerificationTokenHash: codeHash,
      emailVerificationTokenExpiresAt: { $gt: Date.now() }
    };

    if (email) {
      query.emailNormalized = email.trim().toLowerCase();
    } else if (req.user) {
      query._id = req.user._id;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_OR_EXPIRED_CODE', message: 'Invalid or expired 6-digit passcode.' } });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email address verified successfully!', data: user.toSafeUser() });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Verification Code
// @route   POST /api/auth/resend-verification
const resendVerification = async (req, res, next) => {
  try {
    let user;
    if (req.user) {
      user = req.user;
    } else if (req.body.email) {
      user = await User.findOne({ emailNormalized: req.body.email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(400).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found.' } });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_VERIFIED', message: 'Email is already verified.' } });
    }

    const verifyCode = generateOTPCode();
    const verifyTokenHash = crypto.createHash('sha256').update(verifyCode).digest('hex');

    user.emailVerificationTokenHash = verifyTokenHash;
    user.emailVerificationTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    sendVerificationCode(user.email, verifyCode).catch(() => { });

    res.status(200).json({ success: true, message: 'New 6-digit verification passcode sent!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request (Sends 6-Digit Code)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: { code: 'MISSING_EMAIL', message: 'Email is required.' } });

    const normEmail = email.trim().toLowerCase();
    const user = await User.findOne({ emailNormalized: normEmail });

    if (user) {
      const resetCode = generateOTPCode();
      const resetTokenHash = crypto.createHash('sha256').update(resetCode).digest('hex');

      user.passwordResetTokenHash = resetTokenHash;
      user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await user.save();

      sendPasswordResetCode(user.email, resetCode).catch(() => { });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email address, a 6-digit reset code has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Reset Code (Unlocks Reset Password Form)
// @route   POST /api/auth/verify-reset-code
const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'Email and 6-digit code are required.' } });
    }

    const codeHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
    const normEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      emailNormalized: normEmail,
      passwordResetTokenHash: codeHash,
      passwordResetTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_OR_EXPIRED_CODE', message: 'Invalid or expired 6-digit reset code.' } });
    }

    res.status(200).json({ success: true, message: 'Passcode verified! You can now reset your password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with 6-Digit Code
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'Email, code, and new password are required.' } });
    }

    const passwordErr = validatePasswordPolicy(newPassword);
    if (passwordErr) return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: passwordErr } });

    const codeHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
    const normEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      emailNormalized: normEmail,
      passwordResetTokenHash: codeHash,
      passwordResetTokenExpiresAt: { $gt: Date.now() }
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_OR_EXPIRED_CODE', message: 'Reset code is invalid or has expired.' } });
    }

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return res.status(400).json({ success: false, error: { code: 'PASSWORD_REUSE', message: 'New password must be different from current password.' } });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    await Session.deleteMany({ user: user._id });

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password (Authenticated)
// @route   POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'Current and new password are required.' } });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.' } });
    }

    const passwordErr = validatePasswordPolicy(newPassword);
    if (passwordErr) return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: passwordErr } });

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, error: { code: 'PASSWORD_REUSE', message: 'New password must be different from current password.' } });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    await user.save();

    await Session.deleteMany({ user: user._id });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refresh,
  getMe,
  checkUsername,
  checkEmail,
  verifyEmail,
  resendVerification,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
  validateUsernameFormat,
  validateEmailFormat,
  validatePasswordPolicy
};
