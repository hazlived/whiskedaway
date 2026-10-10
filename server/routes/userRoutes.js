const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  updateUsername,
  requestEmailChange,
  confirmEmailChange,
  setPresetAvatar,
  uploadCustomAvatar,
  deleteCustomAvatar,
  deleteAccount,
  syncGuestData
} = require('../controllers/userController');
const { protect, csrfProtection, authRateLimiter } = require('../middleware/authMiddleware');
const { uploadAvatar, verifyImageMagicBytes } = require('../middleware/uploadMiddleware');

// All User Routes are Protected
router.use(protect);

router.get('/me', getMyProfile);
router.patch('/me', csrfProtection, updateProfile);
router.patch('/me/username', csrfProtection, updateUsername);

router.post('/me/change-email', authRateLimiter, csrfProtection, requestEmailChange);
router.post('/me/confirm-email-change', csrfProtection, confirmEmailChange);

router.patch('/me/avatar/preset', csrfProtection, setPresetAvatar);
router.post('/me/avatar/upload', csrfProtection, uploadAvatar, verifyImageMagicBytes, uploadCustomAvatar);
router.delete('/me/avatar', csrfProtection, deleteCustomAvatar);

router.post('/me/sync-guest-data', csrfProtection, syncGuestData);
router.delete('/me', authRateLimiter, csrfProtection, deleteAccount);

module.exports = router;
