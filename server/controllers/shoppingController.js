const ShoppingItem = require('../models/ShoppingItem');

// @desc    Get shopping list (User-scoped or guest)
// @route   GET /api/shopping
const getShoppingList = async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user._id } : { user: null };
    const items = await ShoppingItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add items to shopping list
// @route   POST /api/shopping
const addShoppingItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array required' });
    }

    const userId = req.user ? req.user._id : null;
    const createdItems = [];

    for (const item of items) {
      if (!item.name) continue;
      const filter = { user: userId, name: item.name, recipeTitle: item.recipeTitle || '' };
      const exists = await ShoppingItem.findOne(filter);

      if (!exists) {
        const newItem = await ShoppingItem.create({
          user: userId,
          name: item.name,
          amount: item.amount || '1',
          unit: item.unit || '',
          recipeTitle: item.recipeTitle || '',
          checked: false
        });
        createdItems.push(newItem);
      }
    }

    res.status(201).json({ success: true, count: createdItems.length, data: createdItems });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item checked status
// @route   PUT /api/shopping/:id
const updateShoppingItem = async (req, res, next) => {
  try {
    const { checked } = req.body;
    const userId = req.user ? req.user._id : null;
    const item = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, ...(userId ? { user: userId } : {}) },
      { checked: Boolean(checked) },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Shopping item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single shopping item
// @route   DELETE /api/shopping/:id
const deleteShoppingItem = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const item = await ShoppingItem.findOneAndDelete({ _id: req.params.id, ...(userId ? { user: userId } : {}) });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Shopping item not found' });
    }
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all shopping items
// @route   DELETE /api/shopping
const clearShoppingList = async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user._id } : { user: null };
    await ShoppingItem.deleteMany(filter);
    res.status(200).json({ success: true, message: 'Shopping list cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShoppingList,
  addShoppingItems,
  updateShoppingItem,
  deleteShoppingItem,
  clearShoppingList
};
