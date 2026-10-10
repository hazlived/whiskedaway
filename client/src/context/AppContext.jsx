import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { INITIAL_RECIPES, PANTRY_INGREDIENTS_LIST } from '../data/defaultData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // App State
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [ingredientsData, setIngredientsData] = useState(PANTRY_INGREDIENTS_LIST);
  const [selectedPantry, setSelectedPantry] = useState(new Set(["Eggs", "Avocado", "Tomatoes", "Garlic", "Bread"]));
  const [customPantryItems, setCustomPantryItems] = useState(() => {
    return new Set(JSON.parse(localStorage.getItem("whisked_custom_pantry") || "[]"));
  });

  const [savedFavorites, setSavedFavorites] = useState(() => {
    return new Set(JSON.parse(localStorage.getItem("whisked_favorites") || "[]"));
  });

  const [shoppingList, setShoppingList] = useState(() => {
    return JSON.parse(localStorage.getItem("whisked_shopping") || "[]");
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState(new Set());
  const [currentMatchMode, setCurrentMatchMode] = useState("any");
  const [currentSort, setCurrentSort] = useState("match");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [activeTab, setActiveTab] = useState("explore");

  // Modal States
  const [selectedRecipeModal, setSelectedRecipeModal] = useState(null);
  const [isCookbookModalOpen, setIsCookbookModalOpen] = useState(false);
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [isCustomRecipeModalOpen, setIsCustomRecipeModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch initial data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRecipes = await axiosClient.get('/recipes');
        if (resRecipes.data && resRecipes.data.data && resRecipes.data.data.length > 0) {
          const formattedRecipes = resRecipes.data.data.map(r => ({
            ...r,
            id: r.recipeId || r._id
          }));
          setRecipes(formattedRecipes);
        }
      } catch (err) {
        console.log("Using default recipes fallback");
      }

      try {
        const resIng = await axiosClient.get('/ingredients');
        if (resIng.data && resIng.data.data) {
          setIngredientsData(resIng.data.data);
        }
      } catch (err) {
        console.log("Using default ingredients fallback");
      }

      try {
        const resFav = await axiosClient.get('/favorites');
        if (resFav.data && resFav.data.data) {
          setSavedFavorites(new Set(resFav.data.data));
        }
      } catch (err) { }

      try {
        const resShop = await axiosClient.get('/shopping');
        if (resShop.data && resShop.data.data) {
          setShoppingList(resShop.data.data);
        }
      } catch (err) { }
    };

    fetchData();
  }, []);

  // Save changes to localStorage & sync API
  const toggleFavorite = async (recipeId) => {
    const newFavs = new Set(savedFavorites);
    let isAdded = false;
    if (newFavs.has(recipeId)) {
      newFavs.delete(recipeId);
      showToast("Removed from Cookbook");
    } else {
      newFavs.add(recipeId);
      isAdded = true;
      showToast("Saved to your Cookbook");
    }
    setSavedFavorites(newFavs);
    localStorage.setItem("whisked_favorites", JSON.stringify(Array.from(newFavs)));

    try {
      await axiosClient.post('/favorites/toggle', { recipeId });
    } catch (e) { }
  };

  const togglePantryIngredient = (name) => {
    const newPantry = new Set(selectedPantry);
    if (newPantry.has(name)) {
      newPantry.delete(name);
    } else {
      newPantry.add(name);
    }
    setSelectedPantry(newPantry);
  };

  const addCustomPantryItem = async (rawName) => {
    const formatted = rawName.charAt(0).toUpperCase() + rawName.slice(1).trim();
    const newPantry = new Set(selectedPantry);
    newPantry.add(formatted);
    setSelectedPantry(newPantry);

    const newCustoms = new Set(customPantryItems);
    newCustoms.add(formatted);
    setCustomPantryItems(newCustoms);
    localStorage.setItem("whisked_custom_pantry", JSON.stringify(Array.from(newCustoms)));

    showToast(`Added "${formatted}" to your active pantry!`);

    try {
      await axiosClient.post('/ingredients', { name: formatted, category: 'Pantry' });
    } catch (e) { }
  };

  const clearSelectedPantry = () => {
    setSelectedPantry(new Set());
    showToast("Pantry cleared!");
  };

  const addMissingToShoppingList = async (missingItems, recipeTitle) => {
    const newItems = [...shoppingList];
    const addedBatch = [];

    missingItems.forEach(ing => {
      const exists = newItems.some(i => i.name.toLowerCase() === ing.name.toLowerCase());
      if (!exists) {
        const itemObj = {
          _id: 'shop-' + Date.now() + Math.random(),
          name: ing.name,
          amount: ing.amount || '1',
          unit: ing.unit || '',
          recipeTitle: recipeTitle || '',
          checked: false
        };
        newItems.push(itemObj);
        addedBatch.push(itemObj);
      }
    });

    setShoppingList(newItems);
    localStorage.setItem("whisked_shopping", JSON.stringify(newItems));
    showToast(`Added ${addedBatch.length} missing item(s) to shopping list!`);

    if (addedBatch.length > 0) {
      try {
        await axiosClient.post('/shopping', { items: addedBatch });
      } catch (e) { }
    }
  };

  const toggleShoppingCheck = async (itemId) => {
    const updated = shoppingList.map(item => {
      if ((item._id && item._id === itemId) || item.name === itemId) {
        const checkedVal = !item.checked;
        if (item._id && !item._id.startsWith('shop-')) {
          axiosClient.put(`/shopping/${item._id}`, { checked: checkedVal }).catch(() => { });
        }
        return { ...item, checked: checkedVal };
      }
      return item;
    });
    setShoppingList(updated);
    localStorage.setItem("whisked_shopping", JSON.stringify(updated));
  };

  const deleteShoppingItem = async (itemId) => {
    const updated = shoppingList.filter(item => (item._id || item.name) !== itemId);
    setShoppingList(updated);
    localStorage.setItem("whisked_shopping", JSON.stringify(updated));

    if (typeof itemId === 'string' && !itemId.startsWith('shop-')) {
      try {
        await axiosClient.delete(`/shopping/${itemId}`);
      } catch (e) { }
    }
  };

  const clearShoppingList = async () => {
    setShoppingList([]);
    localStorage.setItem("whisked_shopping", JSON.stringify([]));
    showToast("Shopping list cleared!");

    try {
      await axiosClient.delete('/shopping');
    } catch (e) { }
  };

  const addCustomRecipe = async (recipeData) => {
    const recipeObj = {
      ...recipeData,
      id: recipeData.recipeId || 'custom-' + Date.now(),
      isCustom: true
    };

    setRecipes(prev => [recipeObj, ...prev]);
    showToast(`Created custom recipe "${recipeObj.title}"!`);

    try {
      const res = await axiosClient.post('/recipes', recipeData);
      if (res.data && res.data.data) {
        setRecipes(prev => prev.map(r => r.id === recipeObj.id ? { ...res.data.data, id: res.data.data.recipeId } : r));
      }
    } catch (e) { }
  };

  return (
    <AppContext.Provider value={{
      recipes,
      ingredientsData,
      selectedPantry,
      customPantryItems,
      savedFavorites,
      shoppingList,
      activeCategory,
      setActiveCategory,
      selectedDietaryFilters,
      setSelectedDietaryFilters,
      currentMatchMode,
      setCurrentMatchMode,
      currentSort,
      setCurrentSort,
      ingredientSearch,
      setIngredientSearch,
      recipeSearch,
      setRecipeSearch,
      activeTab,
      setActiveTab,
      selectedRecipeModal,
      setSelectedRecipeModal,
      isCookbookModalOpen,
      setIsCookbookModalOpen,
      isShoppingModalOpen,
      setIsShoppingModalOpen,
      isCustomRecipeModalOpen,
      setIsCustomRecipeModalOpen,
      toastMessage,
      showToast,
      toggleFavorite,
      togglePantryIngredient,
      addCustomPantryItem,
      clearSelectedPantry,
      addMissingToShoppingList,
      toggleShoppingCheck,
      deleteShoppingItem,
      clearShoppingList,
      addCustomRecipe
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
