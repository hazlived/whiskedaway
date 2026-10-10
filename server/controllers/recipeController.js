const Recipe = require('../models/Recipe');

// @desc    Get all recipes
// @route   GET /api/recipes
const getAllRecipes = async (req, res, next) => {
  try {
    const { search, cuisine, category, dietary, sort } = req.query;

    let query = {};

    // For custom recipes: show public/system recipes + user's own custom recipes
    if (req.user) {
      query.$or = [
        { isCustom: { $ne: true } },
        { user: req.user._id }
      ];
    } else {
      query.isCustom = { $ne: true };
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchCriteria = [
        { title: searchRegex },
        { cuisine: searchRegex },
        { summary: searchRegex },
        { 'ingredients.name': searchRegex }
      ];

      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { $or: searchCriteria }
          ]
        };
      } else {
        query.$or = searchCriteria;
      }
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: cuisine, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = { $regex: category, $options: 'i' };
    }

    if (dietary) {
      const dietaryArray = Array.isArray(dietary) ? dietary : dietary.split(',');
      query.dietary = { $all: dietaryArray };
    }

    let recipes = await Recipe.find(query);

    // Dynamic sorting
    if (sort === 'time') {
      recipes.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    } else if (sort === 'calories') {
      recipes.sort((a, b) => a.nutrition.calories - b.nutrition.calories);
    } else if (sort === 'rating') {
      recipes.sort((a, b) => b.rating - a.rating);
    }

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ recipeId: req.params.id });

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom recipe
// @route   POST /api/recipes
const createRecipe = async (req, res, next) => {
  try {
    const { title, summary, cuisine, category, difficulty, prepTime, cookTime, servings, image, ingredients, instructions, nutrition, dietary } = req.body;

    const recipeId = 'custom-' + Date.now();
    const userId = req.user ? req.user._id : null;

    const newRecipe = await Recipe.create({
      user: userId,
      recipeId,
      title,
      summary: summary || 'Custom user created recipe.',
      cuisine: cuisine || 'Custom',
      category: category || 'Dinner',
      difficulty: difficulty || 'Medium',
      prepTime: Number(prepTime) || 10,
      cookTime: Number(cookTime) || 15,
      servings: Number(servings) || 2,
      rating: 5.0,
      image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
      ingredients: ingredients || [],
      dietary: dietary || ['Custom'],
      instructions: instructions || [],
      nutrition: nutrition || { calories: 450, protein: 25, carbs: 40, fat: 15, fiber: 5, sodium: 420 },
      isCustom: true
    });

    res.status(201).json({ success: true, data: newRecipe });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom recipe
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const filter = { recipeId: req.params.id, isCustom: true, ...(userId ? { user: userId } : {}) };

    const recipe = await Recipe.findOneAndDelete(filter);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Custom recipe not found or cannot be deleted' });
    }

    res.status(200).json({ success: true, message: 'Recipe removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  deleteRecipe
};
