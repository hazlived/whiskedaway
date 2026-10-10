const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const { PANTRY_INGREDIENTS_LIST } = require('../controllers/ingredientController');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const INITIAL_RECIPES = [
  {
    recipeId: "rec-1",
    title: "Creamy Garlic Tuscan Chicken & Pasta",
    summary: "Seared chicken thighs and penne coated in a velvety garlic sun-dried tomato cream sauce with fresh spinach.",
    cuisine: "Italian",
    category: "Dinner",
    difficulty: "Medium",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6288339?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Chicken Breast", amount: "500", unit: "g", category: "Proteins" },
      { name: "Penne Pasta", amount: "250", unit: "g", category: "Grains & Staples" },
      { name: "Spinach", amount: "2", unit: "cups", category: "Vegetables" },
      { name: "Sun-Dried Tomatoes", amount: "0.5", unit: "cup", category: "Pantry" },
      { name: "Heavy Cream", amount: "1", unit: "cup", category: "Dairy & Pantry" },
      { name: "Garlic", amount: "4", unit: "cloves", category: "Vegetables" },
      { name: "Parmesan Cheese", amount: "0.5", unit: "cup", category: "Dairy & Pantry" },
      { name: "Olive Oil", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Salt & Black Pepper", amount: "to taste", unit: "", category: "Spices & Herbs" }
    ],
    dietary: ["High-Protein"],
    instructions: [
      "Boil penne pasta in salted water according to package instructions until al dente. Reserve 1/2 cup pasta water, then drain.",
      "Season chicken breast with salt, pepper, and garlic powder. Heat olive oil in a large skillet over medium-high heat and sear chicken for 6 minutes per side until golden and cooked through. Remove chicken and slice.",
      "In the same skillet, add minced garlic and sun-dried tomatoes. Sauté for 1 minute until fragrant.",
      "Pour in heavy cream and chicken broth (or reserved pasta water). Bring to a simmer, then stir in grated parmesan cheese until smooth.",
      "Add fresh spinach and let it wilt in the cream sauce for 2 minutes.",
      "Stir in the cooked penne and sliced chicken. Toss well to coat everything evenly. Serve hot with extra parmesan!"
    ],
    nutrition: { calories: 580, protein: 42, carbs: 48, fat: 24, fiber: 4, sodium: 620 }
  },
  {
    recipeId: "rec-2",
    title: "Avocado & Egg Breakfast Toast",
    summary: "Crispy sourdough topped with creamy mashed avocado, soft-boiled eggs, chili flakes, and microgreens.",
    cuisine: "American",
    category: "Breakfast",
    difficulty: "Easy",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Bread", amount: "2", unit: "slices", category: "Grains & Staples" },
      { name: "Avocado", amount: "1", unit: "medium", category: "Vegetables" },
      { name: "Eggs", amount: "2", unit: "large", category: "Proteins" },
      { name: "Lemon Juice", amount: "1", unit: "tsp", category: "Pantry" },
      { name: "Chili Flakes", amount: "0.5", unit: "tsp", category: "Spices & Herbs" },
      { name: "Salt & Black Pepper", amount: "to taste", unit: "", category: "Spices & Herbs" },
      { name: "Olive Oil", amount: "1", unit: "tsp", category: "Pantry" }
    ],
    dietary: ["Vegetarian", "Quick", "High-Protein"],
    instructions: [
      "Toast bread slices until golden brown and crispy.",
      "In a small bowl, mash the avocado with lemon juice, salt, and black pepper until desired chunkiness.",
      "Bring a small pot of water to a boil. Gently lower eggs in and boil for 6.5 minutes for jammy yolks. Transfer immediately to ice water, peel, and slice in half.",
      "Spread thick layer of mashed avocado over toasted bread.",
      "Top with halved jammy eggs, drizzle with olive oil, and sprinkle with red chili flakes and fresh pepper."
    ],
    nutrition: { calories: 340, protein: 15, carbs: 28, fat: 20, fiber: 8, sodium: 380 }
  },
  {
    recipeId: "rec-3",
    title: "Zesty Chickpea & Avocado Mediterranean Salad",
    summary: "Refreshing protein-rich salad packed with chickpeas, cucumber, cherry tomatoes, avocado, and tangy feta cheese.",
    cuisine: "Mediterranean",
    category: "Lunch",
    difficulty: "Easy",
    prepTime: 15,
    cookTime: 0,
    servings: 3,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Chickpeas", amount: "1", unit: "can (400g)", category: "Grains & Staples" },
      { name: "Cucumber", amount: "1", unit: "large", category: "Vegetables" },
      { name: "Cherry Tomatoes", amount: "1", unit: "cup", category: "Vegetables" },
      { name: "Avocado", amount: "1", unit: "cubed", category: "Vegetables" },
      { name: "Feta Cheese", amount: "100", unit: "g", category: "Dairy & Pantry" },
      { name: "Red Onion", amount: "0.5", unit: "medium", category: "Vegetables" },
      { name: "Olive Oil", amount: "3", unit: "tbsp", category: "Pantry" },
      { name: "Lemon Juice", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Oregano", amount: "1", unit: "tsp", category: "Spices & Herbs" }
    ],
    dietary: ["Vegetarian", "Gluten-Free", "Quick", "High-Protein"],
    instructions: [
      "Rinse and drain canned chickpeas thoroughly.",
      "Dice cucumber, cherry tomatoes, red onion, and avocado into bite-sized pieces.",
      "In a large salad bowl, whisk together olive oil, fresh lemon juice, dried oregano, salt, and pepper to make dressing.",
      "Add chickpeas, diced vegetables, and crumbled feta cheese into the bowl.",
      "Toss gently until dressing evenly covers all ingredients. Serve chilled or at room temperature."
    ],
    nutrition: { calories: 390, protein: 14, carbs: 36, fat: 22, fiber: 11, sodium: 490 }
  },
  {
    recipeId: "rec-4",
    title: "15-Minute Veggie & Egg Fried Rice",
    summary: "The ultimate quick fridge-clearing meal made with day-old rice, scrambled eggs, garlic, soy sauce, and mixed vegetables.",
    cuisine: "Asian",
    category: "Dinner",
    difficulty: "Easy",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Rice", amount: "2", unit: "cups (cooked)", category: "Grains & Staples" },
      { name: "Eggs", amount: "3", unit: "large", category: "Proteins" },
      { name: "Garlic", amount: "3", unit: "cloves", category: "Vegetables" },
      { name: "Carrots", amount: "1", unit: "diced", category: "Vegetables" },
      { name: "Peas", amount: "0.5", unit: "cup", category: "Vegetables" },
      { name: "Soy Sauce", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Sesame Oil", amount: "1", unit: "tbsp", category: "Pantry" },
      { name: "Green Onion", amount: "2", unit: "stalks", category: "Vegetables" }
    ],
    dietary: ["Vegetarian", "Quick"],
    instructions: [
      "Heat 1 tbsp oil in a wok or large frying pan over high heat.",
      "Push oil to side, beat eggs, and pour into pan. Scramble quickly until soft curds form. Remove eggs and set aside.",
      "Add sesame oil, minced garlic, diced carrots, and green peas to the pan. Stir-fry for 2-3 minutes until vegetables soften.",
      "Add chilled day-old cooked rice to the pan, breaking up any clumps with a spatula.",
      "Drizzle soy sauce over rice and stir-fry vigorously for 3 minutes until rice absorbs flavor and gets slightly crispy.",
      "Fold scrambled eggs and chopped green onions back into rice. Serve piping hot!"
    ],
    nutrition: { calories: 410, protein: 16, carbs: 56, fat: 14, fiber: 4, sodium: 710 }
  },
  {
    recipeId: "rec-5",
    title: "Sheet-Pan Chicken Fajitas",
    summary: "Colorful bell peppers, sliced onions, and tender spiced chicken breast baked together on one pan for effortless cleanup.",
    cuisine: "Mexican",
    category: "Dinner",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Chicken Breast", amount: "600", unit: "g", category: "Proteins" },
      { name: "Bell Peppers", amount: "3", unit: "sliced", category: "Vegetables" },
      { name: "Onion", amount: "1", unit: "large sliced", category: "Vegetables" },
      { name: "Olive Oil", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Cumin", amount: "1", unit: "tsp", category: "Spices & Herbs" },
      { name: "Chili Powder", amount: "1", unit: "tbsp", category: "Spices & Herbs" },
      { name: "Garlic Powder", amount: "1", unit: "tsp", category: "Spices & Herbs" },
      { name: "Tortillas", amount: "8", unit: "small", category: "Grains & Staples" },
      { name: "Lime", amount: "1", unit: "juiced", category: "Vegetables" }
    ],
    dietary: ["High-Protein", "Quick"],
    instructions: [
      "Preheat oven to 200°C (400°F) and line a large baking sheet with parchment paper.",
      "Slice chicken breast, bell peppers, and onion into thin strips.",
      "In a bowl, combine olive oil, cumin, chili powder, garlic powder, salt, and pepper.",
      "Spread chicken and veggies onto sheet pan. Drizzle spiced oil mixture over top and toss until evenly coated.",
      "Bake for 20 minutes until chicken is cooked through and vegetables are tender with charred edges.",
      "Squeeze fresh lime juice over pan. Serve inside warm tortillas with your favorite toppings!"
    ],
    nutrition: { calories: 460, protein: 40, carbs: 42, fat: 14, fiber: 6, sodium: 540 }
  },
  {
    recipeId: "rec-6",
    title: "Classic Shakshuka with Feta & Herbs",
    summary: "Eggs poached in a simmering, rich spiced tomato and red pepper sauce, topped with fresh herbs and crumbled feta.",
    cuisine: "Mediterranean",
    category: "Breakfast",
    difficulty: "Medium",
    prepTime: 10,
    cookTime: 20,
    servings: 3,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Eggs", amount: "4", unit: "large", category: "Proteins" },
      { name: "Tomatoes", amount: "1", unit: "can (400g crushed)", category: "Vegetables" },
      { name: "Bell Peppers", amount: "1", unit: "diced", category: "Vegetables" },
      { name: "Onion", amount: "1", unit: "diced", category: "Vegetables" },
      { name: "Garlic", amount: "3", unit: "cloves", category: "Vegetables" },
      { name: "Cumin", amount: "1", unit: "tsp", category: "Spices & Herbs" },
      { name: "Paprika", amount: "1", unit: "tsp", category: "Spices & Herbs" },
      { name: "Feta Cheese", amount: "60", unit: "g", category: "Dairy & Pantry" },
      { name: "Bread", amount: "for serving", unit: "", category: "Grains & Staples" }
    ],
    dietary: ["Vegetarian", "Gluten-Free", "High-Protein"],
    instructions: [
      "Heat olive oil in a deep skillet over medium heat. Add onion and bell pepper, sauté for 5 minutes until soft.",
      "Add garlic, cumin, paprika, and chili powder. Cook for 1 minute until fragrant.",
      "Pour in crushed canned tomatoes, season with salt and pepper, and simmer sauce for 10 minutes until thickened.",
      "Use a spoon to create 4 small wells in the sauce. Gently crack an egg into each well.",
      "Cover skillet with lid and cook on low heat for 5-8 minutes until egg whites are set but yolks remain runny.",
      "Garnish with crumbled feta and fresh cilantro/parsley. Serve straight out of skillet with warm bread for dipping!"
    ],
    nutrition: { calories: 310, protein: 18, carbs: 22, fat: 17, fiber: 5, sodium: 590 }
  },
  {
    recipeId: "rec-7",
    title: "Quick Chickpea & Spinach Curry (Chana Saag)",
    summary: "A comforting 20-minute plant-based Indian curry packed with chickpeas, tender spinach, ginger, and warm aromatic spices.",
    cuisine: "Indian",
    category: "Dinner",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Chickpeas", amount: "2", unit: "cans (800g)", category: "Grains & Staples" },
      { name: "Spinach", amount: "4", unit: "cups fresh", category: "Vegetables" },
      { name: "Tomatoes", amount: "1", unit: "can (400g tomato puree)", category: "Vegetables" },
      { name: "Onion", amount: "1", unit: "finely chopped", category: "Vegetables" },
      { name: "Garlic", amount: "4", unit: "cloves", category: "Vegetables" },
      { name: "Ginger", amount: "1", unit: "tbsp minced", category: "Vegetables" },
      { name: "Garam Masala", amount: "1", unit: "tbsp", category: "Spices & Herbs" },
      { name: "Turmeric", amount: "1", unit: "tsp", category: "Spices & Herbs" },
      { name: "Coconut Milk", amount: "0.5", unit: "cup", category: "Dairy & Pantry" },
      { name: "Rice", amount: "for serving", unit: "", category: "Grains & Staples" }
    ],
    dietary: ["Vegan", "Vegetarian", "Gluten-Free", "Quick"],
    instructions: [
      "Heat oil in a heavy pot over medium heat. Sauté onion, garlic, and ginger until onions are golden brown.",
      "Add garam masala, turmeric, cumin, and salt. Stir for 30 seconds.",
      "Pour in tomato puree and simmer for 5 minutes until oil separates.",
      "Add rinsed chickpeas and 1/2 cup water. Cover and simmer for 8 minutes to let flavors meld.",
      "Stir in fresh spinach and coconut milk. Cook for 3 minutes until spinach is wilted and sauce is creamy.",
      "Serve hot over steamed basmati rice or with garlic naan."
    ],
    nutrition: { calories: 360, protein: 15, carbs: 52, fat: 10, fiber: 12, sodium: 480 }
  },
  {
    recipeId: "rec-8",
    title: "Crispy Garlic Butter Salmon & Asparagus",
    summary: "Pan-seared salmon fillet with crispy golden skin, drizzled with lemon garlic butter sauce alongside tender asparagus.",
    cuisine: "American",
    category: "Dinner",
    difficulty: "Medium",
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Salmon Fillet", amount: "2", unit: "pieces (350g)", category: "Proteins" },
      { name: "Asparagus", amount: "1", unit: "bunch", category: "Vegetables" },
      { name: "Butter", amount: "2", unit: "tbsp", category: "Dairy & Pantry" },
      { name: "Garlic", amount: "3", unit: "cloves minced", category: "Vegetables" },
      { name: "Lemon Juice", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Olive Oil", amount: "1", unit: "tbsp", category: "Pantry" },
      { name: "Salt & Black Pepper", amount: "to taste", unit: "", category: "Spices & Herbs" }
    ],
    dietary: ["Gluten-Free", "High-Protein", "Low-Carb", "Quick"],
    instructions: [
      "Pat salmon fillets dry with paper towels and season liberally with salt and pepper.",
      "Heat olive oil in a non-stick skillet over medium-high heat. Place salmon skin-side down and sear for 4-5 minutes until skin is crispy.",
      "Flip salmon fillets and add trimmed asparagus to the pan surrounding the fish.",
      "Add butter and minced garlic to pan. As butter melts, spoon garlic butter continuously over salmon for 3 minutes.",
      "Drizzle fresh lemon juice over everything and remove from heat.",
      "Serve salmon immediately with asparagus and extra pan juices spooned over top."
    ],
    nutrition: { calories: 470, protein: 38, carbs: 6, fat: 32, fiber: 3, sodium: 390 }
  },
  {
    recipeId: "rec-9",
    title: "Crispy Tofu & Peanut Sauce Noodle Bowl",
    summary: "Golden pan-crisped tofu cubes served over rice noodles with crunchy cucumber, carrots, and rich peanut lime dressing.",
    cuisine: "Asian",
    category: "Lunch",
    difficulty: "Medium",
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Tofu", amount: "1", unit: "block (400g)", category: "Proteins" },
      { name: "Rice Noodles", amount: "150", unit: "g", category: "Grains & Staples" },
      { name: "Peanut Butter", amount: "3", unit: "tbsp", category: "Dairy & Pantry" },
      { name: "Soy Sauce", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Maple Syrup", amount: "1", unit: "tbsp", category: "Pantry" },
      { name: "Lime Juice", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Carrots", amount: "1", unit: "shredded", category: "Vegetables" },
      { name: "Cucumber", amount: "1", unit: "sliced", category: "Vegetables" },
      { name: "Cornstarch", amount: "1", unit: "tbsp", category: "Pantry" }
    ],
    dietary: ["Vegan", "Vegetarian", "High-Protein"],
    instructions: [
      "Press tofu with paper towels to drain excess water, then cut into bite-sized cubes. Toss tofu cubes in cornstarch and salt.",
      "Heat 1 tbsp oil in skillet over medium-high heat. Fry tofu cubes for 8-10 minutes, flipping occasionally until golden and crispy on all sides.",
      "Cook rice noodles according to package instructions, rinse under cold water, and drain.",
      "Whisk peanut butter, soy sauce, maple syrup, lime juice, and 2 tbsp warm water together until smooth.",
      "Assemble bowls: place rice noodles at bottom, top with crispy tofu, shredded carrots, and cucumber slices.",
      "Drizzle generously with creamy peanut sauce and sprinkle with crushed peanuts or chili oil if desired."
    ],
    nutrition: { calories: 520, protein: 24, carbs: 64, fat: 20, fiber: 6, sodium: 680 }
  },
  {
    recipeId: "rec-10",
    title: "Ultimate Crispy Cheese & Tomato Grilled Sandwich",
    summary: "Golden buttered sourdough stuffed with melted cheddar, mozzarella, and juicy sliced tomatoes served with garlic dip.",
    cuisine: "American",
    category: "Lunch",
    difficulty: "Easy",
    prepTime: 5,
    cookTime: 8,
    servings: 1,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Bread", amount: "2", unit: "thick slices", category: "Grains & Staples" },
      { name: "Cheddar Cheese", amount: "2", unit: "slices", category: "Dairy & Pantry" },
      { name: "Mozzarella Cheese", amount: "0.5", unit: "cup shredded", category: "Dairy & Pantry" },
      { name: "Tomatoes", amount: "1", unit: "sliced", category: "Vegetables" },
      { name: "Butter", amount: "1.5", unit: "tbsp", category: "Dairy & Pantry" },
      { name: "Oregano", amount: "0.5", unit: "tsp", category: "Spices & Herbs" }
    ],
    dietary: ["Vegetarian", "Quick"],
    instructions: [
      "Spread butter generously on one side of each bread slice.",
      "On unbuttered side, layer cheddar slice, tomato slices sprinkled with oregano and salt, and shredded mozzarella cheese.",
      "Top with second bread slice, butter side facing up.",
      "Heat skillet over medium-low heat. Place sandwich in pan and press gently with spatula.",
      "Cook for 3-4 minutes per side until bread is deep golden brown and cheese is completely melted and gooey.",
      "Slice diagonally and serve immediately while hot!"
    ],
    nutrition: { calories: 490, protein: 21, carbs: 38, fat: 28, fiber: 3, sodium: 760 }
  },
  {
    recipeId: "rec-11",
    title: "Classic Margherita Pizza Flatbread",
    summary: "Quick oven-baked flatbread topped with rich tomato sauce, fresh mozzarella rounds, basil leaves, and olive oil.",
    cuisine: "Italian",
    category: "Lunch",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Flatbread / Naan", amount: "2", unit: "pieces", category: "Grains & Staples" },
      { name: "Tomato Sauce", amount: "0.5", unit: "cup", category: "Pantry" },
      { name: "Mozzarella Cheese", amount: "150", unit: "g fresh", category: "Dairy & Pantry" },
      { name: "Tomatoes", amount: "1", unit: "sliced", category: "Vegetables" },
      { name: "Basil", amount: "1", unit: "handful", category: "Spices & Herbs" },
      { name: "Olive Oil", amount: "1", unit: "tbsp", category: "Pantry" },
      { name: "Garlic", amount: "1", unit: "clove minced", category: "Vegetables" }
    ],
    dietary: ["Vegetarian", "Quick"],
    instructions: [
      "Preheat oven to 220°C (425°F). Place flatbreads on a baking sheet.",
      "Mix tomato sauce with minced garlic, pinch of salt, and oregano.",
      "Spread tomato sauce evenly over flatbreads, leaving a small border.",
      "Top with sliced fresh mozzarella and tomato slices.",
      "Bake for 8-10 minutes until cheese is melted and bubbling and edges are crisp.",
      "Garnish with fresh basil leaves and a drizzle of extra virgin olive oil before slicing."
    ],
    nutrition: { calories: 420, protein: 19, carbs: 46, fat: 18, fiber: 3, sodium: 640 }
  },
  {
    recipeId: "rec-12",
    title: "Loaded Black Bean & Corn Tacos",
    summary: "Smoky spiced black beans and sweet corn loaded into warm tortillas with avocado, salsa, and cilantro lime cream.",
    cuisine: "Mexican",
    category: "Dinner",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Black Beans", amount: "1", unit: "can (400g)", category: "Grains & Staples" },
      { name: "Corn", amount: "1", unit: "cup canned/frozen", category: "Vegetables" },
      { name: "Tortillas", amount: "6", unit: "small corn", category: "Grains & Staples" },
      { name: "Avocado", amount: "1", unit: "sliced", category: "Vegetables" },
      { name: "Onion", amount: "0.5", unit: "diced", category: "Vegetables" },
      { name: "Cumin", amount: "1", unit: "tsp", category: "Spices & Herbs" },
      { name: "Salsa", amount: "0.5", unit: "cup", category: "Pantry" },
      { name: "Sour Cream / Yogurt", amount: "3", unit: "tbsp", category: "Dairy & Pantry" }
    ],
    dietary: ["Vegetarian", "Vegan", "Gluten-Free", "Quick"],
    instructions: [
      "Heat 1 tbsp oil in skillet over medium heat. Sauté diced onion for 3 minutes.",
      "Add drained black beans, corn, cumin, chili powder, and salt. Cook for 5 minutes, mashing a portion of beans slightly with a fork.",
      "Warm tortillas in a dry skillet for 30 seconds per side.",
      "Fill warm tortillas with bean and corn mixture.",
      "Top with avocado slices, spoonful of salsa, sour cream, and fresh cilantro."
    ],
    nutrition: { calories: 380, protein: 13, carbs: 58, fat: 12, fiber: 14, sodium: 520 }
  },
  {
    recipeId: "rec-13",
    title: "Creamy Garlic Parmesan Mushroom Risotto",
    summary: "Slow-simmered arborio rice cooked with garlic, sautéed cremini mushrooms, white wine, butter, and parmesan.",
    cuisine: "Italian",
    category: "Dinner",
    difficulty: "Hard",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Arborio Rice", amount: "1.5", unit: "cups", category: "Grains & Staples" },
      { name: "Mushrooms", amount: "300", unit: "g sliced", category: "Vegetables" },
      { name: "Vegetable Broth", amount: "4", unit: "cups warm", category: "Pantry" },
      { name: "Parmesan Cheese", amount: "0.75", unit: "cup grated", category: "Dairy & Pantry" },
      { name: "Butter", amount: "3", unit: "tbsp", category: "Dairy & Pantry" },
      { name: "Garlic", amount: "4", unit: "cloves minced", category: "Vegetables" },
      { name: "Onion", amount: "1", unit: "finely diced", category: "Vegetables" }
    ],
    dietary: ["Vegetarian", "Gluten-Free"],
    instructions: [
      "In a skillet, melt 1 tbsp butter and sauté sliced mushrooms until golden brown. Season with salt and set aside.",
      "In a large pot, melt remaining butter and sauté diced onion and garlic until translucent.",
      "Add arborio rice and toast for 2 minutes, stirring constantly.",
      "Add warm broth 1 ladle at a time, stirring frequently and waiting until liquid is absorbed before adding next ladle.",
      "Continue adding broth and stirring for 20 minutes until rice is creamy and tender.",
      "Stir in sautéed mushrooms and parmesan cheese. Season with pepper and serve warm."
    ],
    nutrition: { calories: 450, protein: 14, carbs: 62, fat: 16, fiber: 4, sodium: 610 }
  },
  {
    recipeId: "rec-14",
    title: "Honey Garlic Glazed Chicken & Broccoli",
    summary: "Tender pan-fried chicken bites coated in a sticky honey garlic soy glaze served alongside steamed broccoli.",
    cuisine: "Asian",
    category: "Dinner",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Chicken Breast", amount: "500", unit: "g cubed", category: "Proteins" },
      { name: "Broccoli", amount: "2", unit: "cups florets", category: "Vegetables" },
      { name: "Honey", amount: "3", unit: "tbsp", category: "Pantry" },
      { name: "Soy Sauce", amount: "3", unit: "tbsp", category: "Pantry" },
      { name: "Garlic", amount: "4", unit: "cloves minced", category: "Vegetables" },
      { name: "Ginger", amount: "1", unit: "tsp minced", category: "Vegetables" },
      { name: "Cornstarch", amount: "1", unit: "tsp", category: "Pantry" },
      { name: "Sesame Oil", amount: "1", unit: "tbsp", category: "Pantry" }
    ],
    dietary: ["High-Protein", "Quick"],
    instructions: [
      "Mix honey, soy sauce, minced garlic, ginger, cornstarch, and 2 tbsp water in a small bowl.",
      "Heat sesame oil in skillet over high heat. Add cubed chicken breast and sear for 6-8 minutes until golden.",
      "Add broccoli florets and 2 tbsp water to pan. Cover for 2 minutes to steam broccoli.",
      "Pour honey garlic sauce over chicken and broccoli.",
      "Simmer for 2-3 minutes while stirring until sauce thickens into a glossy glaze.",
      "Serve over hot rice or enjoy as a low-carb meal."
    ],
    nutrition: { calories: 380, protein: 39, carbs: 28, fat: 12, fiber: 3, sodium: 780 }
  },
  {
    recipeId: "rec-15",
    title: "Greek Lemon Garlic Roasted Potatoes",
    summary: "Crispy-edged oven roasted potato wedges infused with lemon juice, oregano, garlic, and olive oil.",
    cuisine: "Mediterranean",
    category: "Side",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 35,
    servings: 4,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Potatoes", amount: "4", unit: "large cut into wedges", category: "Vegetables" },
      { name: "Lemon Juice", amount: "0.25", unit: "cup", category: "Pantry" },
      { name: "Olive Oil", amount: "3", unit: "tbsp", category: "Pantry" },
      { name: "Garlic", amount: "4", unit: "cloves minced", category: "Vegetables" },
      { name: "Oregano", amount: "1", unit: "tbsp dried", category: "Spices & Herbs" },
      { name: "Salt & Black Pepper", amount: "to taste", unit: "", category: "Spices & Herbs" }
    ],
    dietary: ["Vegan", "Vegetarian", "Gluten-Free"],
    instructions: [
      "Preheat oven to 210°C (410°F).",
      "In a large bowl, toss potato wedges with olive oil, lemon juice, minced garlic, oregano, salt, and pepper.",
      "Arrange potato wedges in a single layer on a large rimmed baking sheet.",
      "Roast for 35-40 minutes, flipping halfway through until edges are golden brown and crispy while inside is fluffy.",
      "Garnish with extra oregano and lemon zest before serving."
    ],
    nutrition: { calories: 240, protein: 4, carbs: 38, fat: 9, fiber: 5, sodium: 320 }
  },
  {
    recipeId: "rec-16",
    title: "Fluffy Banana Peanut Butter Oat Pancakes",
    summary: "Naturally sweetened blender pancakes made with rolled oats, ripe banana, egg, and peanut butter.",
    cuisine: "American",
    category: "Breakfast",
    difficulty: "Easy",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Oats", amount: "1", unit: "cup rolled", category: "Grains & Staples" },
      { name: "Banana", amount: "1", unit: "ripe", category: "Fruits" },
      { name: "Eggs", amount: "1", unit: "large", category: "Proteins" },
      { name: "Milk", amount: "0.5", unit: "cup", category: "Dairy & Pantry" },
      { name: "Peanut Butter", amount: "2", unit: "tbsp", category: "Dairy & Pantry" },
      { name: "Baking Powder", amount: "1", unit: "tsp", category: "Pantry" },
      { name: "Maple Syrup", amount: "for serving", unit: "", category: "Pantry" }
    ],
    dietary: ["Vegetarian", "Gluten-Free", "Quick"],
    instructions: [
      "Place rolled oats, ripe banana, egg, milk, peanut butter, and baking powder into a blender.",
      "Blend on high speed for 45 seconds until smooth batter forms.",
      "Heat a lightly buttered non-stick skillet over medium heat.",
      "Pour 1/4 cup batter for each pancake. Cook for 2-3 minutes until bubbles form on surface.",
      "Flip and cook for another 1-2 minutes until golden brown.",
      "Serve stacked high with sliced bananas, extra peanut butter, and maple syrup."
    ],
    nutrition: { calories: 360, protein: 14, carbs: 48, fat: 13, fiber: 6, sodium: 260 }
  },
  {
    recipeId: "rec-17",
    title: "Garlic Butter Shrimp & Spinach Pasta",
    summary: "Juicy jumbo shrimp sautéed in garlic, lemon, white wine, and butter sauce tossed with spaghetti and spinach.",
    cuisine: "Italian",
    category: "Dinner",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 12,
    servings: 3,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Shrimp", amount: "400", unit: "g peeled", category: "Proteins" },
      { name: "Pasta", amount: "250", unit: "g spaghetti", category: "Grains & Staples" },
      { name: "Spinach", amount: "2", unit: "cups fresh", category: "Vegetables" },
      { name: "Garlic", amount: "5", unit: "cloves minced", category: "Vegetables" },
      { name: "Butter", amount: "3", unit: "tbsp", category: "Dairy & Pantry" },
      { name: "Lemon Juice", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Chili Flakes", amount: "0.5", unit: "tsp", category: "Spices & Herbs" }
    ],
    dietary: ["High-Protein", "Quick"],
    instructions: [
      "Cook spaghetti in salted boiling water until al dente. Reserve 1/2 cup pasta water, then drain.",
      "Melt 2 tbsp butter in large skillet over medium-high heat. Add shrimp and red pepper flakes, sear for 2 minutes per side until pink. Remove shrimp.",
      "In same skillet, melt remaining butter and sauté minced garlic for 1 minute.",
      "Add lemon juice and reserved pasta water, simmer for 2 minutes.",
      "Toss in cooked spaghetti, fresh spinach, and cooked shrimp. Stir until spinach wilts.",
      "Season with fresh parsley and serve hot."
    ],
    nutrition: { calories: 460, protein: 36, carbs: 44, fat: 16, fiber: 3, sodium: 580 }
  },
  {
    recipeId: "rec-18",
    title: "Berry Banana Protein Smoothie Bowl",
    summary: "Thick creamy frozen berry smoothie topped with sliced strawberries, chia seeds, banana, and crunchy granola.",
    cuisine: "American",
    category: "Breakfast",
    difficulty: "Easy",
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Mixed Berries", amount: "1.5", unit: "cups frozen", category: "Fruits" },
      { name: "Banana", amount: "1", unit: "frozen", category: "Fruits" },
      { name: "Yogurt / Milk", amount: "0.5", unit: "cup", category: "Dairy & Pantry" },
      { name: "Honey", amount: "1", unit: "tbsp", category: "Pantry" },
      { name: "Oats", amount: "0.25", unit: "cup granola", category: "Grains & Staples" },
      { name: "Chia Seeds", amount: "1", unit: "tbsp", category: "Spices & Herbs" }
    ],
    dietary: ["Vegetarian", "Gluten-Free", "Quick"],
    instructions: [
      "Combine frozen mixed berries, frozen banana, yogurt/milk, and honey in a high-speed blender.",
      "Blend on low speed, using tamper to push down ingredients until ultra thick and smooth.",
      "Scoop thick smoothie mixture into a bowl.",
      "Artistically arrange toppings: fresh sliced banana, granola, chia seeds, and berries on top.",
      "Enjoy immediately with a spoon!"
    ],
    nutrition: { calories: 320, protein: 10, carbs: 62, fat: 6, fiber: 10, sodium: 90 }
  },
  {
    recipeId: "rec-19",
    title: "Rich Hearty Minestrone Soup",
    summary: "Traditional Italian vegetable soup with beans, small pasta, diced tomatoes, zucchini, and spinach in savory herb broth.",
    cuisine: "Italian",
    category: "Dinner",
    difficulty: "Medium",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Kidney Beans", amount: "1", unit: "can (400g)", category: "Grains & Staples" },
      { name: "Pasta", amount: "0.5", unit: "cup small ditalini", category: "Grains & Staples" },
      { name: "Tomatoes", amount: "1", unit: "can (400g diced)", category: "Vegetables" },
      { name: "Zucchini", amount: "1", unit: "diced", category: "Vegetables" },
      { name: "Carrots", amount: "2", unit: "diced", category: "Vegetables" },
      { name: "Celery", amount: "2", unit: "stalks diced", category: "Vegetables" },
      { name: "Spinach", amount: "2", unit: "cups", category: "Vegetables" },
      { name: "Garlic", amount: "3", unit: "cloves", category: "Vegetables" },
      { name: "Italian Seasoning", amount: "1", unit: "tbsp", category: "Spices & Herbs" }
    ],
    dietary: ["Vegan", "Vegetarian"],
    instructions: [
      "Heat 2 tbsp olive oil in large soup pot. Sauté diced carrots, celery, and onion for 5 minutes.",
      "Add garlic, diced zucchini, and Italian seasoning. Cook for 2 minutes.",
      "Pour in diced tomatoes, drained kidney beans, and 4 cups vegetable broth.",
      "Bring to a boil, then reduce heat and simmer for 15 minutes.",
      "Add small pasta and cook for 8 minutes until pasta is tender.",
      "Stir in fresh spinach until wilted. Ladle into bowls and serve with crusty bread."
    ],
    nutrition: { calories: 280, protein: 12, carbs: 48, fat: 4, fiber: 11, sodium: 590 }
  },
  {
    recipeId: "rec-20",
    title: "Crispy Egg & Cheese Breakfast Burrito",
    summary: "Flour tortilla stuffed with fluffy scrambled eggs, black beans, melted cheddar, salsa, and pan-crisped to perfection.",
    cuisine: "Mexican",
    category: "Breakfast",
    difficulty: "Easy",
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Eggs", amount: "2", unit: "large", category: "Proteins" },
      { name: "Tortillas", amount: "1", unit: "large flour", category: "Grains & Staples" },
      { name: "Cheddar Cheese", amount: "0.25", unit: "cup shredded", category: "Dairy & Pantry" },
      { name: "Black Beans", amount: "3", unit: "tbsp", category: "Grains & Staples" },
      { name: "Salsa", amount: "2", unit: "tbsp", category: "Pantry" },
      { name: "Butter", amount: "1", unit: "tsp", category: "Dairy & Pantry" }
    ],
    dietary: ["Vegetarian", "Quick", "High-Protein"],
    instructions: [
      "Melt butter in skillet and scramble eggs over medium heat until soft. Season with salt and pepper.",
      "Warm flour tortilla for 15 seconds in microwave or skillet.",
      "Layer shredded cheddar, scrambled eggs, black beans, and salsa in the center of tortilla.",
      "Fold in sides of tortilla, then roll tightly into a burrito.",
      "Place burrito seam-side down in hot skillet and cook for 2 minutes per side until outer tortilla is golden and crispy!",
      "Slice in half and serve warm."
    ],
    nutrition: { calories: 420, protein: 22, carbs: 36, fat: 20, fiber: 5, sodium: 680 }
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whiskedaway');
    console.log('Seeding data to MongoDB...');

    // Clear existing
    await Recipe.deleteMany({ isCustom: { $ne: true } });
    await Ingredient.deleteMany({ isCustom: { $ne: true } });

    // Seed recipes
    await Recipe.insertMany(INITIAL_RECIPES);
    console.log(`Successfully seeded ${INITIAL_RECIPES.length} recipes.`);

    // Seed ingredients
    const ingredientDocs = [];
    Object.entries(PANTRY_INGREDIENTS_LIST).forEach(([category, items]) => {
      items.forEach(name => {
        ingredientDocs.push({ name, category, isCustom: false });
      });
    });

    await Ingredient.insertMany(ingredientDocs);
    console.log(`Successfully seeded ${ingredientDocs.length} ingredients.`);

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData, INITIAL_RECIPES };
