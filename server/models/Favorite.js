const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipeId: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

FavoriteSchema.index({ user: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
