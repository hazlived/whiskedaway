import React from 'react';
import { useApp } from '../context/AppContext';

const RecipeCard = ({ recipe, match }) => {
  const { savedFavorites, toggleFavorite, setSelectedRecipeModal } = useApp();

  const isFav = savedFavorites.has(recipe.id || recipe.recipeId);
  const totalTime = recipe.prepTime + recipe.cookTime;
  const { matchPercentage, matchedCount, totalCount, missing } = match;
  const highMatch = matchPercentage >= 65;

  return (
    <div className="col-md-6 col-lg-4 fade-in">
      <div className="recipe-card">
        <div className="card-img-wrapper">
          <img src={recipe.image} alt={recipe.title} loading="lazy" />
          <span className={`match-badge ${highMatch ? "high-match" : ""}`}>
            <i className={`bi ${highMatch ? "bi-fire text-warning" : "bi-pie-chart-fill"}`}></i> {matchPercentage}% Match
          </span>
          <button
            className={`fav-save-btn ${isFav ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe.id || recipe.recipeId);
            }}
            title={isFav ? "Remove from Saved" : "Save to Cookbook"}
          >
            <i className={`bi ${isFav ? "bi-bookmark-fill" : "bi-bookmark"}`}></i>
          </button>
          <span className="cuisine-tag">{recipe.cuisine}</span>
        </div>

        <div className="recipe-card-body">
          <h5 className="recipe-title">{recipe.title}</h5>
          <p className="recipe-summary">{recipe.summary}</p>

          <div className="recipe-meta-row">
            <span><i className="bi bi-clock me-1"></i>{totalTime} mins</span>
            <span><i className="bi bi-star-fill text-warning me-1"></i>{recipe.rating}</span>
            <span><i className="bi bi-fire me-1"></i>{recipe.nutrition?.calories || 450} kcal</span>
          </div>

          <div className="macro-pills-row">
            <span className="macro-pill">P: {recipe.nutrition?.protein || 20}g</span>
            <span className="macro-pill">C: {recipe.nutrition?.carbs || 40}g</span>
            <span className="macro-pill">F: {recipe.nutrition?.fat || 15}g</span>
            {recipe.dietary && recipe.dietary.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="macro-pill bg-warning text-dark">{tag}</span>
            ))}
          </div>

          <div className="ingredients-status-box">
            <span><i className="bi bi-check2-circle text-success me-1"></i>Have {matchedCount}/{totalCount} items</span>
            <span className={`${missing.length === 0 ? "text-success" : "text-danger"} fw-bold`}>
              {missing.length === 0 ? "Ready to Cook!" : `Missing ${missing.length}`}
            </span>
          </div>

          <button
            className="btn-view-recipe mt-2"
            onClick={() => setSelectedRecipeModal(recipe)}
          >
            <span>View Full Recipe</span>
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
