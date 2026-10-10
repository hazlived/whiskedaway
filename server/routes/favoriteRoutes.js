const express = require('express');
const router = express.Router();
const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.route('/')
  .get(getFavorites);

router.route('/toggle')
  .post(toggleFavorite);

module.exports = router;
