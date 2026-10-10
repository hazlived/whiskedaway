const express = require('express');
const router = express.Router();
const {
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
  changePassword
} = require('../controllers/authController');
const { protect, authRateLimiter, availabilityRateLimiter, csrfProtection } = require('../middleware/authMiddleware');

// Public Auth Endpoints with Rate Limiting & CSRF Checks
router.post('/register', authRateLimiter, csrfProtection, register);
router.post('/login', authRateLimiter, csrfProtection, login);
router.post('/logout', logout);
router.post('/refresh', refresh);

router.get('/check-username', availabilityRateLimiter, checkUsername);
router.get('/check-email', availabilityRateLimiter, checkEmail);

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authRateLimiter, csrfProtection, resendVerification);
router.post('/forgot-password', authRateLimiter, csrfProtection, forgotPassword);
router.post('/verify-reset-code', authRateLimiter, csrfProtection, verifyResetCode);
router.post('/reset-password', authRateLimiter, csrfProtection, resetPassword);

// Protected Auth Endpoints
router.use(protect);
router.get('/me', getMe);
router.post('/logout-all', csrfProtection, logoutAll);
router.post('/change-password', authRateLimiter, csrfProtection, changePassword);

module.exports = router;
