const mongoose = require('mongoose');

const ShoppingItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  amount: { type: String, default: '1' },
  unit: { type: String, default: '' },
  recipeTitle: { type: String, default: '' },
  checked: { type: Boolean, default: false }
}, {
  timestamps: true
});

ShoppingItemSchema.index({ user: 1 });

module.exports = mongoose.model('ShoppingItem', ShoppingItemSchema);
