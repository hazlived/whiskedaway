const Ingredient = require('../models/Ingredient');

// Default backup categorized ingredient list
const PANTRY_INGREDIENTS_LIST = {
  "Vegetables": [
    "Avocado", "Asparagus", "Bell Peppers", "Broccoli", "Carrots", "Celery",
    "Cherry Tomatoes", "Cucumber", "Garlic", "Ginger", "Green Onion", "Mushrooms",
    "Onion", "Potatoes", "Red Onion", "Spinach", "Tomatoes", "Zucchini"
  ],
  "Proteins": [
    "Chicken Breast", "Eggs", "Salmon Fillet", "Shrimp", "Tofu"
  ],
  "Dairy & Pantry": [
    "Butter", "Cheddar Cheese", "Feta Cheese", "Heavy Cream", "Milk",
    "Mozzarella Cheese", "Parmesan Cheese", "Peanut Butter", "Sour Cream / Yogurt", "Yogurt / Milk"
  ],
  "Grains & Staples": [
    "Arborio Rice", "Black Beans", "Bread", "Chickpeas", "Flatbread / Naan",
    "Kidney Beans", "Oats", "Penne Pasta", "Pasta", "Rice", "Rice Noodles", "Tortillas"
  ],
  "Fruits": [
    "Banana", "Mixed Berries"
  ],
  "Pantry": [
    "Cornstarch", "Honey", "Lemon Juice", "Lime Juice", "Maple Syrup", "Olive Oil",
    "Salsa", "Sesame Oil", "Soy Sauce", "Sun-Dried Tomatoes", "Tomato Sauce", "Vegetable Broth"
  ],
  "Spices & Herbs": [
    "Basil", "Baking Powder", "Chia Seeds", "Chili Flakes", "Chili Powder", "Cumin",
    "Garam Masala", "Garlic Powder", "Italian Seasoning", "Oregano", "Paprika",
    "Salt & Black Pepper", "Turmeric"
  ]
};

// @desc    Get all ingredients categorized
// @route   GET /api/ingredients
// @access  Public
const getAllIngredients = async (req, res, next) => {
  try {
    const dbIngredients = await Ingredient.find();

    if (!dbIngredients || dbIngredients.length === 0) {
      return res.status(200).json({ success: true, data: PANTRY_INGREDIENTS_LIST });
    }

    const categorized = {};
    dbIngredients.forEach(item => {
      if (!categorized[item.category]) {
        categorized[item.category] = [];
      }
      categorized[item.category].push(item.name);
    });

    res.status(200).json({ success: true, data: categorized });
  } catch (error) {
    res.status(200).json({ success: true, data: PANTRY_INGREDIENTS_LIST });
  }
};

// @desc    Create new custom ingredient
// @route   POST /api/ingredients
// @access  Public
const createIngredient = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Ingredient name is required' });
    }

    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).trim();
    const formattedCategory = category || 'Pantry';

    let item = await Ingredient.findOne({ name: formattedName });
    if (!item) {
      item = await Ingredient.create({
        name: formattedName,
        category: formattedCategory,
        isCustom: true
      });
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIngredients,
  createIngredient,
  PANTRY_INGREDIENTS_LIST
};
