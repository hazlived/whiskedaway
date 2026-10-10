const Favorite = require('../models/Favorite');

// @desc    Get favorite recipe IDs (User-scoped or guest)
// @route   GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user._id } : { user: null };
    const favorites = await Favorite.find(filter).select('recipeId -_id');
    const ids = favorites.map(f => f.recipeId);
    res.status(200).json({ success: true, data: ids });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite recipe ID
// @route   POST /api/favorites/toggle
const toggleFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'recipeId is required' });
    }

    const filter = req.user ? { user: req.user._id, recipeId } : { user: null, recipeId };
    const existing = await Favorite.findOne(filter);

    if (existing) {
      await Favorite.deleteOne(filter);
      return res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({ user: req.user ? req.user._id : null, recipeId });
      return res.status(200).json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  toggleFavorite
};
