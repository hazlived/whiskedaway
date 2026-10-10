const express = require('express');
const router = express.Router();
const {
  getShoppingList,
  addShoppingItems,
  updateShoppingItem,
  deleteShoppingItem,
  clearShoppingList
} = require('../controllers/shoppingController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.route('/')
  .get(getShoppingList)
  .post(addShoppingItems)
  .delete(clearShoppingList);

router.route('/:id')
  .put(updateShoppingItem)
  .delete(deleteShoppingItem);

module.exports = router;
