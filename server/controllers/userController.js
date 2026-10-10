const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Session = require('../models/Session');
const Favorite = require('../models/Favorite');
const ShoppingItem = require('../models/ShoppingItem');
const Recipe = require('../models/Recipe');
const { validateUsernameFormat, validateEmailFormat } = require('./authController');
const { sendEmailChangeCode } = require('../services/emailService');

const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Get Current User Profile & Application Stats
// @route   GET /api/users/me
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const favCount = await Favorite.countDocuments({ user: user._id });
    const customRecipeCount = await Recipe.countDocuments({ user: user._id, isCustom: true });
    const shoppingCount = await ShoppingItem.countDocuments({ user: user._id });

    const safeUser = user.toSafeUser();
    safeUser.stats = {
      savedRecipesCount: favCount,
      customRecipesCount: customRecipeCount,
      shoppingItemsCount: shoppingCount
    };

    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Profile Details
// @route   PATCH /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const {
      displayName,
      bio,
      location,
      website,
      cookingLevel,
      favoriteCuisines,
      dietaryPreferences,
      allergies,
      favoriteIngredients,
      socialLinks,
      profileVisibility
    } = req.body;

    if (displayName !== undefined) user.displayName = String(displayName).trim();
    if (bio !== undefined) user.bio = String(bio).slice(0, 250);
    if (location !== undefined) user.location = String(location).trim();
    if (website !== undefined) user.website = String(website).trim();
    if (cookingLevel && ['beginner', 'intermediate', 'advanced', 'professional'].includes(cookingLevel)) {
      user.cookingLevel = cookingLevel;
    }
    if (Array.isArray(favoriteCuisines)) user.favoriteCuisines = favoriteCuisines.map(s => String(s).trim());
    if (Array.isArray(dietaryPreferences)) user.dietaryPreferences = dietaryPreferences.map(s => String(s).trim());
    if (Array.isArray(allergies)) user.allergies = allergies.map(s => String(s).trim());
    if (Array.isArray(favoriteIngredients)) user.favoriteIngredients = favoriteIngredients.map(s => String(s).trim());

    if (socialLinks && typeof socialLinks === 'object') {
      user.socialLinks = {
        github: socialLinks.github ? String(socialLinks.github).trim() : '',
        instagram: socialLinks.instagram ? String(socialLinks.instagram).trim() : '',
        twitter: socialLinks.twitter ? String(socialLinks.twitter).trim() : '',
        youtube: socialLinks.youtube ? String(socialLinks.youtube).trim() : ''
      };
    }

    if (profileVisibility && ['public', 'private'].includes(profileVisibility)) {
      user.profileVisibility = profileVisibility;
    }

    await user.save();
    res.status(200).json({ success: true, data: user.toSafeUser(), message: 'Profile updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Username
// @route   PATCH /api/users/me/username
const updateUsername = async (req, res, next) => {
  try {
    const { newUsername } = req.body;
    const err = validateUsernameFormat(newUsername);
    if (err) return res.status(400).json({ success: false, error: { code: 'INVALID_USERNAME', message: err } });

    const norm = newUsername.trim().toLowerCase();
    if (norm === req.user.usernameNormalized) {
      return res.status(400).json({ success: false, error: { code: 'SAME_USERNAME', message: 'New username must be different from current username.' } });
    }

    const existing = await User.findOne({ usernameNormalized: norm });
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'USERNAME_TAKEN', message: 'That username is already taken.', field: 'username' } });
    }

    const user = await User.findById(req.user._id);
    user.username = newUsername.trim();
    user.usernameNormalized = norm;
    await user.save();

    res.status(200).json({ success: true, data: user.toSafeUser(), message: 'Username updated successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: { code: 'USERNAME_TAKEN', message: 'That username is already taken.', field: 'username' } });
    }
    next(error);
  }
};

// @desc    Request Email Change (Sends 6-digit code)
// @route   POST /api/users/me/change-email
const requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'New email and current password are required.' } });
    }

    const emailErr = validateEmailFormat(newEmail);
    if (emailErr) return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: emailErr } });

    const norm = newEmail.trim().toLowerCase();
    if (norm === req.user.emailNormalized) {
      return res.status(400).json({ success: false, error: { code: 'SAME_EMAIL', message: 'New email must be different from current email.' } });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect.' } });
    }

    const existing = await User.findOne({ emailNormalized: norm });
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'That email is already registered.' } });
    }

    const code = generateOTPCode();
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');

    user.newEmailPending = norm;
    user.emailChangeTokenHash = tokenHash;
    user.emailChangeTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

    sendEmailChangeCode(norm, code).catch(() => { });

    res.status(200).json({ success: true, message: '6-digit confirmation code sent to your new email address.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm Email Change with 6-Digit Code
// @route   POST /api/users/me/confirm-email-change
const confirmEmailChange = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: { code: 'MISSING_CODE', message: '6-digit code required.' } });

    const tokenHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
    const user = await User.findOne({
      _id: req.user._id,
      emailChangeTokenHash: tokenHash,
      emailChangeTokenExpiresAt: { $gt: Date.now() }
    }).select('+newEmailPending');

    if (!user || !user.newEmailPending) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_CODE', message: 'Email change passcode is invalid or expired.' } });
    }

    user.email = user.newEmailPending;
    user.emailNormalized = user.newEmailPending;
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.newEmailPending = undefined;
    user.emailChangeTokenHash = undefined;
    user.emailChangeTokenExpiresAt = undefined;

    await user.save();
    res.status(200).json({ success: true, data: user.toSafeUser(), message: 'Email address updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Choose Preset Avatar
// @route   PATCH /api/users/me/avatar/preset
const setPresetAvatar = async (req, res, next) => {
  try {
    const { presetId } = req.body;
    const allowedPresets = ['chef', 'baker', 'chili', 'avocado', 'tomato', 'pancake', 'egg', 'mushroom', 'strawberry', 'ramen', 'whisk', 'pot'];

    if (!presetId || !allowedPresets.includes(presetId)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PRESET', message: 'Invalid preset avatar selection.' } });
    }

    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar.type === 'custom' && user.avatar.imageUrl) {
      const filename = path.basename(user.avatar.imageUrl);
      const filePath = path.join(__dirname, '../../uploads/avatars', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.avatar = {
      type: 'preset',
      presetId,
      imageUrl: '',
      imagePublicId: ''
    };

    await user.save();
    res.status(200).json({ success: true, data: user.toSafeUser(), message: 'Avatar updated.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Custom Profile Image
// @route   POST /api/users/me/avatar/upload
const uploadCustomAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Image file required.' } });
    }

    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar.type === 'custom' && user.avatar.imageUrl) {
      const oldFilename = path.basename(user.avatar.imageUrl);
      const oldPath = path.join(__dirname, '../../uploads/avatars', oldFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const relativeUrl = `/uploads/avatars/${req.file.filename}`;

    user.avatar = {
      type: 'custom',
      presetId: '',
      imageUrl: relativeUrl,
      imagePublicId: req.file.filename
    };

    await user.save();
    res.status(200).json({ success: true, data: user.toSafeUser(), message: 'Profile avatar uploaded successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Custom Avatar
// @route   DELETE /api/users/me/avatar
const deleteCustomAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar.type === 'custom' && user.avatar.imageUrl) {
      const filename = path.basename(user.avatar.imageUrl);
      const filePath = path.join(__dirname, '../../uploads/avatars', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.avatar = {
      type: 'preset',
      presetId: 'chef',
      imageUrl: '',
      imagePublicId: ''
    };

    await user.save();
    res.status(200).json({ success: true, data: user.toSafeUser(), message: 'Custom avatar removed.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Account
// @route   DELETE /api/users/me
const deleteAccount = async (req, res, next) => {
  try {
    const { password, confirmationPhrase } = req.body;
    if (!password || confirmationPhrase !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CONFIRMATION', message: 'Requires current password and exact confirmation phrase "DELETE MY ACCOUNT".' }
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Password is incorrect.' } });
    }

    if (user.avatar && user.avatar.type === 'custom' && user.avatar.imageUrl) {
      const filename = path.basename(user.avatar.imageUrl);
      const filePath = path.join(__dirname, '../../uploads/avatars', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Session.deleteMany({ user: user._id });
    await Favorite.deleteMany({ user: user._id });
    await ShoppingItem.deleteMany({ user: user._id });
    await Recipe.deleteMany({ user: user._id, isCustom: true });

    await User.findByIdAndDelete(user._id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth' });

    res.status(200).json({ success: true, message: 'Account and associated data deleted permanently.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync / Merge Guest Data to User Account
// @route   POST /api/users/me/sync-guest-data
const syncGuestData = async (req, res, next) => {
  try {
    const { favorites, shoppingList, customRecipes } = req.body;
    const userId = req.user._id;

    let mergedFavsCount = 0;
    let mergedShopCount = 0;
    let mergedRecipesCount = 0;

    if (Array.isArray(favorites)) {
      for (const recipeId of favorites) {
        const exists = await Favorite.findOne({ user: userId, recipeId });
        if (!exists) {
          await Favorite.create({ user: userId, recipeId });
          mergedFavsCount++;
        }
      }
    }

    if (Array.isArray(shoppingList)) {
      for (const item of shoppingList) {
        if (!item.name) continue;
        const exists = await ShoppingItem.findOne({ user: userId, name: item.name, recipeTitle: item.recipeTitle || '' });
        if (!exists) {
          await ShoppingItem.create({
            user: userId,
            name: item.name,
            amount: item.amount || '1',
            unit: item.unit || '',
            recipeTitle: item.recipeTitle || '',
            checked: Boolean(item.checked)
          });
          mergedShopCount++;
        }
      }
    }

    if (Array.isArray(customRecipes)) {
      for (const r of customRecipes) {
        if (!r.title) continue;
        const rId = r.recipeId || r.id || 'custom-' + Date.now();
        const exists = await Recipe.findOne({ user: userId, recipeId: rId });
        if (!exists) {
          await Recipe.create({
            user: userId,
            recipeId: rId,
            title: r.title,
            summary: r.summary || 'Custom user recipe',
            cuisine: r.cuisine || 'Custom',
            category: r.category || 'Dinner',
            difficulty: r.difficulty || 'Medium',
            prepTime: r.prepTime || 10,
            cookTime: r.cookTime || 15,
            servings: r.servings || 2,
            image: r.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
            ingredients: r.ingredients || [],
            dietary: r.dietary || ['Custom'],
            instructions: r.instructions || [],
            nutrition: r.nutrition || { calories: 450, protein: 25, carbs: 40, fat: 15, fiber: 5, sodium: 420 },
            isCustom: true
          });
          mergedRecipesCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Guest data merged successfully.',
      merged: {
        favorites: mergedFavsCount,
        shoppingList: mergedShopCount,
        customRecipes: mergedRecipesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  updateUsername,
  requestEmailChange,
  confirmEmailChange,
  setPresetAvatar,
  uploadCustomAvatar,
  deleteCustomAvatar,
  deleteAccount,
  syncGuestData
};
