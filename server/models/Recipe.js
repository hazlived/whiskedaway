const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: String, required: true, trim: true },
  unit: { type: String, default: '', trim: true },
  category: { type: String, default: 'Pantry', trim: true }
});

const NutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }
});

const RecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipeId: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  cuisine: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  difficulty: { type: String, default: 'Medium', enum: ['Easy', 'Medium', 'Hard'] },
  prepTime: { type: Number, required: true },
  cookTime: { type: Number, required: true },
  servings: { type: Number, required: true, default: 2 },
  rating: { type: Number, default: 4.8 },
  image: { type: String, required: true },
  ingredients: [IngredientSchema],
  dietary: [{ type: String }],
  instructions: [{ type: String, required: true }],
  nutrition: { type: NutritionSchema, required: true },
  isCustom: { type: Boolean, default: false }
}, {
  timestamps: true
});

RecipeSchema.index({ user: 1 });
RecipeSchema.index({ recipeId: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);
