import React from 'react';
import { useApp } from '../context/AppContext';
import RecipeCard from './RecipeCard';

export const calculateMatchScore = (recipe, selectedPantry) => {
  const requiredList = recipe.ingredients || [];
  const totalCount = requiredList.length;

  if (totalCount === 0) return { matchPercentage: 0, matchedCount: 0, totalCount: 0, missing: [], matched: [] };

  const userPantryLower = Array.from(selectedPantry).map(i => i.toLowerCase().trim());

  const matched = [];
  const missing = [];

  requiredList.forEach(ing => {
    const ingLower = ing.name.toLowerCase().trim();

    const isMatched = userPantryLower.some(userItem => {
      if (ingLower === userItem) return true;
      if (ingLower.includes(userItem) || userItem.includes(ingLower)) return true;

      const singularIng = ingLower.replace(/s$/, "");
      const singularUser = userItem.replace(/s$/, "");
      return singularIng === singularUser || singularIng.includes(singularUser);
    });

    if (isMatched) {
      matched.push(ing);
    } else {
      missing.push(ing);
    }
  });

  const matchedCount = matched.length;
  const matchPercentage = Math.round((matchedCount / totalCount) * 100);

  return {
    matchPercentage,
    matchedCount,
    totalCount,
    missing,
    matched
  };
};

const RecipeGrid = ({ onCountUpdate }) => {
  const {
    recipes,
    selectedPantry,
    savedFavorites,
    activeTab,
    recipeSearch,
    selectedDietaryFilters,
    currentMatchMode,
    currentSort,
    setActiveTab
  } = useApp();

  let pool = [...recipes];

  if (activeTab === "cookbook") {
    pool = pool.filter(r => savedFavorites.has(r.id || r.recipeId));
  }

  let evaluated = pool.map(recipe => {
    const match = calculateMatchScore(recipe, selectedPantry);
    return { ...recipe, match };
  });

  if (recipeSearch.trim()) {
    const query = recipeSearch.toLowerCase().trim();
    evaluated = evaluated.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query) ||
      (r.ingredients && r.ingredients.some(ing => ing.name.toLowerCase().includes(query)))
    );
  }

  if (selectedDietaryFilters.size > 0) {
    evaluated = evaluated.filter(r => {
      return Array.from(selectedDietaryFilters).every(filterTag => {
        if (filterTag === "Quick") {
          return (r.prepTime + r.cookTime) <= 20 || (r.dietary && r.dietary.includes("Quick"));
        }
        return r.dietary && r.dietary.includes(filterTag);
      });
    });
  }

  if (currentMatchMode === "exact") {
    evaluated = evaluated.filter(r => r.match.matchPercentage === 100);
  } else if (currentMatchMode === "missing-1") {
    evaluated = evaluated.filter(r => r.match.missing.length <= 2);
  }

  evaluated.sort((a, b) => {
    if (currentSort === "match") {
      return b.match.matchPercentage - a.match.matchPercentage;
    } else if (currentSort === "time") {
      return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
    } else if (currentSort === "calories") {
      return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
    } else if (currentSort === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  React.useEffect(() => {
    if (onCountUpdate) {
      onCountUpdate(evaluated.length);
    }
  }, [evaluated.length]);

  if (evaluated.length === 0) {
    const isCookbookTab = activeTab === "cookbook";
    return (
      <div className="col-12">
        <div className="empty-state-box">
          <div className="empty-state-icon"><i className={`bi ${isCookbookTab ? "bi-journal-x" : "bi-search"}`}></i></div>
          <h4 className="fw-bold">{isCookbookTab ? "Your Cookbook is Empty" : "No Matching Recipes Found"}</h4>
          <p className="text-muted">
            {isCookbookTab
              ? "Click the bookmark icon on any recipe card to save it to your cookbook!"
              : "Try selecting more ingredients in your pantry or adjusting your search filters."}
          </p>
          <button
            className="btn btn-orange mt-2"
            onClick={() => {
              if (isCookbookTab) {
                setActiveTab("explore");
              } else {
                const el = document.getElementById("pantrySection");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <i className={`bi ${isCookbookTab ? "bi-compass" : "bi-plus-circle"} me-1`}></i>
            {isCookbookTab ? "Explore Recipes" : "Select Ingredients"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {evaluated.map(recipe => (
        <RecipeCard
          key={recipe.id || recipe.recipeId}
          recipe={recipe}
          match={recipe.match}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
