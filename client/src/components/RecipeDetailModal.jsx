import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateMatchScore } from './RecipeGrid';

const RecipeDetailModal = () => {
  const {
    selectedRecipeModal,
    setSelectedRecipeModal,
    selectedPantry,
    addMissingToShoppingList,
    showToast
  } = useApp();

  if (!selectedRecipeModal) return null;

  const recipe = selectedRecipeModal;
  const [multiplier, setMultiplier] = useState(1.0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Cooking Timer State
  const [timerTotalSecs, setTimerTotalSecs] = useState(recipe.cookTime * 60);
  const [timerRemaining, setTimerRemaining] = useState(recipe.cookTime * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    setMultiplier(1.0);
    setCompletedSteps(new Set());
    const total = (recipe.cookTime || 10) * 60;
    setTimerTotalSecs(total);
    setTimerRemaining(total);
    setIsTimerRunning(false);

    // Escape key listener to dismiss modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedRecipeModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recipe]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playBeepSound();
            showToast("Timer finished! Meal is ready!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) { }
  };

  const match = calculateMatchScore(recipe, selectedPantry);
  const userPantryLower = Array.from(selectedPantry).map(i => i.toLowerCase().trim());

  const scaledCalories = Math.round((recipe.nutrition?.calories || 450) * multiplier);
  const scaledProtein = Math.round((recipe.nutrition?.protein || 20) * multiplier);
  const scaledCarbs = Math.round((recipe.nutrition?.carbs || 40) * multiplier);
  const scaledFat = Math.round((recipe.nutrition?.fat || 15) * multiplier);
  const scaledFiber = Math.round((recipe.nutrition?.fiber || 5) * multiplier);
  const scaledSodium = Math.round((recipe.nutrition?.sodium || 400) * multiplier);
  const scaledServings = Math.round((recipe.servings || 2) * multiplier);

  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleStep = (idx) => {
    const next = new Set(completedSteps);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setCompletedSteps(next);
  };

  return (
    <div className="custom-modal-backdrop" onClick={() => setSelectedRecipeModal(null)}>
      <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <button className="modal-close-btn" onClick={() => setSelectedRecipeModal(null)} aria-label="Close recipe">
            <i className="bi bi-x-lg"></i>
          </button>
          <img
            src={recipe.image}
            alt={recipe.title}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="modal-header-overlay">
            <div className="d-flex gap-2 mb-2 flex-wrap align-items-center">
              <span className="badge bg-warning text-dark px-3 py-2 fw-bold">
                <i className="bi bi-pie-chart-fill me-1"></i>{match.matchPercentage}% Match
              </span>
              <span className="badge bg-dark px-3 py-2 fw-bold">{recipe.cuisine} • {recipe.category}</span>
              <span className="badge bg-success px-3 py-2 fw-bold">{recipe.difficulty}</span>
            </div>
            <h2 className="fw-bold mb-1">{recipe.title}</h2>
            <p className="mb-0 opacity-75">{recipe.summary}</p>
          </div>
        </div>

        <div className="p-4">
          {/* Portion Scaler */}
          <div className="d-flex justify-content-between align-items-center bg-white p-3 border border-dark rounded-3 mb-4 shadow-sm flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold"><i className="bi bi-people-fill text-warning me-1"></i>Servings:</span>
              <div className="btn-group border border-dark rounded-pill overflow-hidden">
                <button
                  className="btn btn-sm btn-light fw-bold px-3"
                  onClick={() => setMultiplier(prev => Math.max(0.5, prev - 0.5))}
                >-</button>
                <span className="btn btn-sm btn-white fw-bold px-3 disabled text-dark">{scaledServings} Portion(s)</span>
                <button
                  className="btn btn-sm btn-light fw-bold px-3"
                  onClick={() => setMultiplier(prev => prev + 0.5)}
                >+</button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-dark rounded-pill fw-bold" onClick={() => window.print()}>
                <i className="bi bi-printer me-1"></i> Print
              </button>
              <button className="btn btn-sm btn-outline-dark rounded-pill fw-bold" onClick={() => showToast("Recipe link copied!")}>
                <i className="bi bi-share me-1"></i> Share
              </button>
            </div>
          </div>

          {/* Nutrition Facts */}
          <h5 className="fw-bold mb-3"><i className="bi bi-activity text-danger me-2"></i>Nutritional Facts (Scaled)</h5>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-2">
              <div className="nutrition-card">
                <div className="nutrition-val">{scaledCalories}</div>
                <div className="nutrition-lbl">Calories</div>
                <div className="macro-bar-container"><div className="macro-bar-fill" style={{ width: `${Math.min(scaledCalories / 8, 100)}%` }}></div></div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="nutrition-card">
                <div className="nutrition-val">{scaledProtein}g</div>
                <div className="nutrition-lbl">Protein</div>
                <div className="macro-bar-container"><div className="macro-bar-fill bg-success" style={{ width: `${Math.min(scaledProtein * 2, 100)}%` }}></div></div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="nutrition-card">
                <div className="nutrition-val">{scaledCarbs}g</div>
                <div className="nutrition-lbl">Carbs</div>
                <div className="macro-bar-container"><div className="macro-bar-fill bg-info" style={{ width: `${Math.min(scaledCarbs * 1.5, 100)}%` }}></div></div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="nutrition-card">
                <div className="nutrition-val">{scaledFat}g</div>
                <div className="nutrition-lbl">Fat</div>
                <div className="macro-bar-container"><div className="macro-bar-fill bg-warning" style={{ width: `${Math.min(scaledFat * 2.5, 100)}%` }}></div></div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="nutrition-card">
                <div className="nutrition-val">{scaledFiber}g</div>
                <div className="nutrition-lbl">Fiber</div>
                <div className="macro-bar-container"><div className="macro-bar-fill bg-secondary" style={{ width: `${Math.min(scaledFiber * 6, 100)}%` }}></div></div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="nutrition-card">
                <div className="nutrition-val">{scaledSodium}mg</div>
                <div className="nutrition-lbl">Sodium</div>
                <div className="macro-bar-container"><div className="macro-bar-fill bg-danger" style={{ width: `${Math.min(scaledSodium / 10, 100)}%` }}></div></div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Ingredients Checklist */}
            <div className="col-md-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0"><i className="bi bi-basket2-fill text-warning me-2"></i>Ingredients Needed</h5>
                {match.missing.length > 0 && (
                  <button
                    className="btn btn-sm btn-orange"
                    onClick={() => addMissingToShoppingList(match.missing, recipe.title)}
                  >
                    <i className="bi bi-cart-plus me-1"></i> Add Missing to List
                  </button>
                )}
              </div>

              <div className="ingredients-list-wrapper">
                {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
                  const ingLower = ing.name.toLowerCase().trim();
                  const isHave = userPantryLower.some(u => ingLower.includes(u) || u.includes(ingLower));

                  let scaledAmountStr = ing.amount;
                  const numVal = parseFloat(ing.amount);
                  if (!isNaN(numVal)) {
                    scaledAmountStr = (Math.round(numVal * multiplier * 10) / 10).toString();
                  }

                  return (
                    <div key={idx} className={`ingredient-check-item ${isHave ? "have-it" : "need-it"}`}>
                      <div>
                        <span className="fw-bold">{ing.name}</span>
                        <small className="text-muted d-block">{scaledAmountStr} {ing.unit}</small>
                      </div>
                      <span className={`badge ${isHave ? "bg-success" : "bg-warning text-dark"}`}>
                        <i className={`bi ${isHave ? "bi-check-lg" : "bi-cart me-1"}`}></i> {isHave ? "In Pantry" : "Need"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cooking Directions & Timer */}
            <div className="col-md-7">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0"><i className="bi bi-journal-text me-2 text-primary"></i>Step-by-Step Directions</h5>

                <div className="timer-widget py-1 px-3">
                  <i className="bi bi-stopwatch text-warning fs-5"></i>
                  <span className="timer-display fs-6">{timerRemaining === 0 ? "DONE!" : formatTimerTime(timerRemaining)}</span>
                  <button
                    className={`btn btn-sm ${isTimerRunning ? "btn-light" : "btn-outline-light"} py-0 px-2`}
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    className="btn btn-sm btn-link text-white-50 p-0"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerRemaining(timerTotalSecs);
                    }}
                    title="Reset Timer"
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                  </button>
                </div>
              </div>

              <small className="text-muted d-block mb-3"><i className="bi bi-info-circle me-1"></i>Click any step below to check it off as you cook!</small>

              <div className="cooking-steps-wrapper">
                {recipe.instructions && recipe.instructions.map((step, idx) => {
                  const isDone = completedSteps.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`cooking-step-card ${isDone ? "completed" : ""}`}
                      onClick={() => toggleStep(idx)}
                    >
                      <div className="step-number-pill">{idx + 1}</div>
                      <div>
                        <p className="mb-0 fw-medium">{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-4 pt-3 border-top border-dark d-flex justify-content-between align-items-center flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-dark rounded-pill fw-bold"
              onClick={() => setSelectedRecipeModal(null)}
            >
              <i className="bi bi-arrow-left me-1"></i> Back to Recipes
            </button>
            <button
              type="button"
              className="btn btn-orange rounded-pill fw-bold"
              onClick={() => setSelectedRecipeModal(null)}
            >
              <i className="bi bi-check2-circle me-1"></i> Close Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
