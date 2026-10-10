const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refreshTokenHash: { type: String, required: true, unique: true },
  family: { type: String, required: true },
  isRevoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
}, {
  timestamps: true
});

// TTL index for auto-cleanup of expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1 });

module.exports = mongoose.model('Session', SessionSchema);
