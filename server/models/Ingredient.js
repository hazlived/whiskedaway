const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  isCustom: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
