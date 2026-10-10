const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  usernameNormalized: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, trim: true },
  emailNormalized: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  displayName: { type: String, trim: true },
  bio: { type: String, maxProgressBar: 250, default: '' },
  avatar: {
    type: { type: String, enum: ['preset', 'custom'], default: 'preset' },
    presetId: { type: String, default: 'chef' },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' }
  },
  location: { type: String, default: '', trim: true },
  website: { type: String, default: '', trim: true },
  cookingLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'professional'],
    default: 'beginner'
  },
  favoriteCuisines: [{ type: String }],
  dietaryPreferences: [{ type: String }],
  allergies: [{ type: String }],
  favoriteIngredients: [{ type: String }],
  socialLinks: {
    github: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  emailVerificationTokenHash: { type: String, select: false },
  emailVerificationTokenExpiresAt: { type: Date, select: false },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetTokenExpiresAt: { type: Date, select: false },
  newEmailPending: { type: String, select: false },
  emailChangeTokenHash: { type: String, select: false },
  emailChangeTokenExpiresAt: { type: Date, select: false },
  lastLoginAt: { type: Date, default: Date.now },
  passwordChangedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accountStatus: { type: String, enum: ['active', 'suspended', 'pending_deletion'], default: 'active' }
}, {
  timestamps: true
});

// Safe DTO Serializer
UserSchema.methods.toSafeUser = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationTokenExpiresAt;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetTokenExpiresAt;
  delete obj.newEmailPending;
  delete obj.emailChangeTokenHash;
  delete obj.emailChangeTokenExpiresAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
