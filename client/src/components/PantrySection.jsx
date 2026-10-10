import React from 'react';
import { useApp } from '../context/AppContext';

const PantrySection = () => {
  const {
    ingredientsData,
    selectedPantry,
    customPantryItems,
    togglePantryIngredient,
    addCustomPantryItem,
    clearSelectedPantry,
    activeCategory,
    setActiveCategory,
    ingredientSearch,
    setIngredientSearch
  } = useApp();

  const categories = ["All", ...Object.keys(ingredientsData || {})];

  let currentList = [];
  if (activeCategory === "All") {
    Object.values(ingredientsData || {}).forEach(list => {
      currentList.push(...list);
    });
    currentList.push(...customPantryItems);
  } else {
    currentList = ingredientsData[activeCategory] || [];
  }

  const uniqueSorted = Array.from(new Set(currentList)).sort();
  const filtered = uniqueSorted.filter(ing =>
    ing.toLowerCase().includes(ingredientSearch.toLowerCase().trim())
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = ingredientSearch.trim();
      if (val) {
        addCustomPantryItem(val);
        setIngredientSearch("");
      }
    }
  };

  const selectedArray = Array.from(selectedPantry);

  return (
    <section className="pantry-card mb-5" id="pantrySection">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-bag-check-fill text-warning me-2"></i>What's in your Kitchen?</h4>
          <p className="text-muted small mb-0">Click ingredient chips below or search to toggle items in your active pantry.</p>
        </div>
        <button className="btn btn-sm btn-outline-dark rounded-pill fw-bold" onClick={clearSelectedPantry}>
          <i className="bi bi-trash me-1"></i> Clear Selected
        </button>
      </div>

      <div className="search-input-group mb-3">
        <i className="bi bi-search"></i>
        <input
          type="text"
          className="form-control"
          placeholder="Search ingredients (e.g. Eggs, Avocado, Spinach, Cheese, Pasta)..."
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="category-nav-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-pill ${cat === activeCategory ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="ingredient-chips-container">
        {ingredientSearch.trim() && !filtered.some(i => i.toLowerCase() === ingredientSearch.toLowerCase().trim()) && (
          <div
            className="chip-item bg-dark text-white border-warning"
            onClick={() => {
              addCustomPantryItem(ingredientSearch);
              setIngredientSearch("");
            }}
          >
            <i className="bi bi-plus-lg text-warning"></i>
            <span>Add "{ingredientSearch}" to Pantry</span>
          </div>
        )}

        {filtered.length === 0 && !ingredientSearch.trim() ? (
          <div className="text-muted p-2 small">No ingredients in this category.</div>
        ) : (
          filtered.map(ing => {
            const isSelected = selectedPantry.has(ing);
            return (
              <div
                key={ing}
                className={`chip-item ${isSelected ? "selected" : ""}`}
                onClick={() => togglePantryIngredient(ing)}
              >
                <i className={`bi ${isSelected ? "bi-check-circle-fill" : "bi-plus-circle"}`}></i>
                <span>{ing}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="selected-pantry-bar mt-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <small className="fw-bold text-uppercase tracking-wider">
            <i className="bi bi-check-all text-success me-1"></i> Active Pantry (<span>{selectedArray.length}</span>)
          </small>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {selectedArray.length === 0 ? (
            <span className="text-muted small">No ingredients selected yet. Click any chip above to select ingredients!</span>
          ) : (
            selectedArray.map(ing => (
              <span key={ing} className="selected-chip">
                {ing}
                <i className="bi bi-x-circle-fill" onClick={() => togglePantryIngredient(ing)}></i>
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PantrySection;
