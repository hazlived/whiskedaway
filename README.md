# whiskedaway - Full MERN Stack Recipe Finder Web App

> Turn leftover ingredients into delicious meals, reduce food waste, and track complete macro nutritional facts effortlessly.

## Overview
**whiskedaway** is a full-stack MERN application (MongoDB, Express, React, Node.js) built for pantry-first recipe discovery. Users can select available pantry ingredients, instantly discover high-match recipes with portion scaling, view interactive cooking instructions with built-in timers, maintain a personal 3D interactive page-flipping cookbook, and manage a synchronized shopping list.

---

## Architecture & Stack
- **Frontend**: React 18 + Vite + Bootstrap Icons + Custom Neo-Brutalist CSS System
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB + Mongoose ORM
- **State & Data**: React Context API + LocalStorage fallback + Axios API sync
- **Deployment**: Production static-serving support via Express

---

## Directory Structure
```
whiskedaway/
├── package.json              # Main scripts & concurrently launcher
├── .env                      # Environment variables
├── .env.example              # Sample environment template
├── .gitignore                # Git exclusions
├── README.md                 # Deployment & setup documentation
├── server/                   # Node.js + Express Backend
│   ├── index.js              # Server entry point & static asset provider
│   ├── config/
│   │   └── db.js             # Mongoose database connector
│   ├── models/
│   │   ├── Recipe.js         # Mongoose Recipe Schema
│   │   ├── Ingredient.js     # Mongoose Ingredient Schema
│   │   ├── Favorite.js       # Saved Favorites Schema
│   │   └── ShoppingItem.js   # Shopping List Item Schema
│   ├── controllers/
│   │   ├── recipeController.js
│   │   ├── ingredientController.js
│   │   ├── favoriteController.js
│   │   └── shoppingController.js
│   ├── routes/
│   │   ├── recipeRoutes.js
│   │   ├── ingredientRoutes.js
│   │   ├── favoriteRoutes.js
│   │   └── shoppingRoutes.js
│   ├── middleware/
│   │   └── errorHandler.js   # Central Express error handling
│   └── seeders/
│       └── seedData.js       # Automated database seeder (20 initial recipes)
└── client/                   # React + Vite Frontend
    ├── package.json
    ├── vite.config.js        # Vite dev server with proxy to backend
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axiosClient.js
        ├── context/
        │   └── AppContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Hero.jsx
        │   ├── PantrySection.jsx
        │   ├── FilterBar.jsx
        │   ├── RecipeGrid.jsx
        │   ├── RecipeCard.jsx
        │   ├── RecipeDetailModal.jsx
        │   ├── CookbookModal.jsx (3D Realistic Page Flip)
        │   ├── ShoppingListModal.jsx
        │   ├── CustomRecipeModal.jsx
        │   └── Toast.jsx
        └── data/
            └── defaultData.js
```

---

## Installation & Local Setup

### 1. Install Dependencies
Run from the root folder:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables
Create or verify `.env` in the root folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/whiskedaway
NODE_ENV=development
```

### 3. Seed Database
Populate MongoDB with the 20 default curated recipes:
```bash
npm run seed
```

### 4. Launch Application in Development Mode
Run concurrent backend and frontend dev servers:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000/api`
- **Frontend App**: `http://localhost:3000`

---

## Deployment Instructions

### Option A: Deploy to Render / Railway / Heroku (Single Web Service)
1. Set the Build Command:
   ```bash
   npm install && npm run build
   ```
2. Set the Start Command:
   ```bash
   npm start
   ```
3. Add Environment Variables in your dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/whiskedaway?retryWrites=true&w=majority`
   - `PORT=5000`

The Express server automatically detects `NODE_ENV=production` and serves the built React static files from `client/dist`.

---

## Verification Commands
To test the production build locally:
```bash
npm run build
NODE_ENV=production node server/index.js
```
Then visit `http://localhost:5000`.
