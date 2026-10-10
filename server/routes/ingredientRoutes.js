const express = require('express');
const router = express.Router();
const { getAllIngredients, createIngredient } = require('../controllers/ingredientController');

router.route('/')
  .get(getAllIngredients)
  .post(createIngredient);

module.exports = router;
