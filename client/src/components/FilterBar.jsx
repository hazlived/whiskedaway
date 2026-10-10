import React from 'react';
import { useApp } from '../context/AppContext';

const FilterBar = ({ filteredCount }) => {
  const {
    recipeSearch,
    setRecipeSearch,
    currentMatchMode,
    setCurrentMatchMode,
    currentSort,
    setCurrentSort,
    selectedDietaryFilters,
    setSelectedDietaryFilters
  } = useApp();

  const dietaryTags = ["All", "Vegetarian", "Vegan", "Gluten-Free", "High-Protein", "Quick"];

  const handleDietaryClick = (tag) => {
    const nextSet = new Set(selectedDietaryFilters);
    if (tag === "All") {
      nextSet.clear();
    } else {
      if (nextSet.has(tag)) {
        nextSet.delete(tag);
      } else {
        nextSet.add(tag);
      }
    }
    setSelectedDietaryFilters(nextSet);
  };

  return (
    <section className="controls-card" id="controlsSection">
      <div className="row g-3 align-items-center">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-dark"><i className="bi bi-funnel"></i></span>
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Filter recipes by name or cuisine..."
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select custom-select-black"
            value={currentMatchMode}
            onChange={(e) => setCurrentMatchMode(e.target.value)}
          >
            <option value="any">Match Mode: Any Available</option>
            <option value="exact">Match Mode: 100% Exact Pantry</option>
            <option value="missing-1">Match Mode: Missing Max 1-2 Items</option>
          </select>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select custom-select-black"
            value={currentSort}
            onChange={(e) => setCurrentSort(e.target.value)}
          >
            <option value="match">Sort by: Highest Match %</option>
            <option value="time">Sort by: Quickest Cook Time</option>
            <option value="calories">Sort by: Lowest Calories</option>
            <option value="rating">Sort by: Top Rated</option>
          </select>
        </div>

        <div className="col-md-2 text-end">
          <span className="badge bg-dark text-white p-2 fw-bold w-100">{filteredCount} Recipes Found</span>
        </div>

        <div className="col-12 mt-3 border-top pt-3">
          <div className="d-flex align-items-center gap-2 flex-wrap" id="dietaryFiltersContainer">
            <small className="fw-bold text-muted me-2">Dietary Preferences:</small>
            {dietaryTags.map(tag => {
              const isAll = tag === "All";
              const isActive = isAll ? selectedDietaryFilters.size === 0 : selectedDietaryFilters.has(tag);
              return (
                <button
                  key={tag}
                  className={`btn btn-sm btn-outline-dark rounded-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleDietaryClick(tag)}
                >
                  {tag === "Quick" ? "Quick (<20 mins)" : tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
