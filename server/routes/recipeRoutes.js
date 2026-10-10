const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  deleteRecipe
} = require('../controllers/recipeController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.route('/')
  .get(getAllRecipes)
  .post(createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .delete(deleteRecipe);

module.exports = router;
