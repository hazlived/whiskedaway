const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const shoppingRoutes = require('./routes/shoppingRoutes');

const Recipe = require('./models/Recipe');
const { INITIAL_RECIPES } = require('./seeders/seedData');

dotenv.config();

const app = express();

// Trust reverse proxy for Render / Vercel HTTPS cookies
app.set('trust proxy', 1);

// Database Connection & Auto-Seed check
connectDB().then(async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      console.log('No recipes found in DB. Auto-seeding initial dataset...');
      await Recipe.insertMany(INITIAL_RECIPES);
      console.log('Auto-seed completed successfully!');
    }
  } catch (err) {
    console.log('DB initial check complete.');
  }
});

// Security & Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow origin in production
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Uploads Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Cache-Control headers for security
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/shopping', shoppingRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'whiskedaway MERN API is healthy', timestamp: new Date() });
});

// Production Setup: Serve React Static Build
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('whiskedaway API Server is running in development mode...');
  });
}

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Self-ping heartbeat to keep Render free tier awake
  if (process.env.NODE_ENV === 'production') {
    const https = require('https');
    const RENDER_HEALTH_URL = 'https://whiskedaway.onrender.com/api/health';

    setInterval(() => {
      https.get(RENDER_HEALTH_URL, (res) => {
        console.log(`[KEEP-ALIVE] Heartbeat ping sent to Render. Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.log('[KEEP-ALIVE] Self-ping failed:', err.message);
      });
    }, 14 * 60 * 1000); // Ping every 14 minutes
  }
});
