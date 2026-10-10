export const INITIAL_RECIPES = [
  {
    recipeId: "rec-1",
    id: "rec-1",
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
    id: "rec-2",
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
    id: "rec-3",
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
    id: "rec-4",
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
    id: "rec-5",
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
  }
];

export const PANTRY_INGREDIENTS_LIST = {
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
