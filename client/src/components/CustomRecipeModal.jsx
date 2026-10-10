import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PRESET_IMAGES = [
  { label: "Italian Pasta & Garlic Butter", url: "https://images.unsplash.com/photo-1621996346565-e3d5d6288339?auto=format&fit=crop&w=800&q=80" },
  { label: "Tacos & Mexican Plate", url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80" },
  { label: "Fresh Salad & Veggie Bowl", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
  { label: "Asian Stir-Fry & Fried Rice", url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80" },
  { label: "Grilled Cheese & Sandwich", url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80" },
  { label: "Aromatic Curry & Stew", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" },
  { label: "Pancakes & Breakfast", url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80" }
];

const CustomRecipeModal = () => {
  const {
    isCustomRecipeModalOpen,
    setIsCustomRecipeModalOpen,
    addCustomRecipe
  } = useApp();

  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [prepTime, setPrepTime] = useState(10);
  const [cookTime, setCookTime] = useState(15);
  const [calories, setCalories] = useState(450);
  const [protein, setProtein] = useState(25);
  const [imagePreset, setImagePreset] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [ingredientsRaw, setIngredientsRaw] = useState('');
  const [instructionsRaw, setInstructionsRaw] = useState('');

  if (!isCustomRecipeModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalImageUrl = imagePreset;
    if (imagePreset === 'custom' && customImageUrl.trim()) {
      finalImageUrl = customImageUrl.trim();
    } else if (imagePreset === 'custom') {
      finalImageUrl = PRESET_IMAGES[0].url;
    }

    const ingredients = ingredientsRaw.split("\n").filter(line => line.trim()).map(line => {
      const parts = line.split(",");
      return {
        name: parts[0] ? parts[0].trim() : "Ingredient",
        amount: parts[1] ? parts[1].trim() : "1",
        unit: parts[2] ? parts[2].trim() : "unit",
        category: "Pantry"
      };
    });

    const instructions = instructionsRaw.split("\n").filter(line => line.trim());

    const recipeData = {
      recipeId: "custom-" + Date.now(),
      title: title.trim(),
      summary: "Custom home cook recipe created by you.",
      cuisine: cuisine.trim() || "Custom",
      category: "Custom",
      difficulty: "Medium",
      prepTime: Number(prepTime) || 10,
      cookTime: Number(cookTime) || 15,
      servings: 2,
      rating: 5.0,
      image: finalImageUrl,
      ingredients,
      dietary: ["Custom"],
      instructions,
      nutrition: {
        calories: Number(calories) || 450,
        protein: Number(protein) || 25,
        carbs: Math.round((Number(calories) || 450) * 0.12),
        fat: Math.round((Number(calories) || 450) * 0.04),
        fiber: 5,
        sodium: 420
      }
    };

    addCustomRecipe(recipeData);
    setIsCustomRecipeModalOpen(false);

    // Reset Form
    setTitle('');
    setCuisine('');
    setIngredientsRaw('');
    setInstructionsRaw('');
  };

  return (
    <div className="custom-modal-backdrop" onClick={() => setIsCustomRecipeModalOpen(false)}>
      <div className="modal-content-custom" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-bottom border-dark p-3 bg-light d-flex justify-content-between align-items-center">
          <h5 className="modal-title fw-bold mb-0"><i className="bi bi-plus-circle-fill text-warning me-2"></i>Add Custom Recipe</h5>
          <button type="button" className="btn-close" onClick={() => setIsCustomRecipeModalOpen(false)}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row g-3">
              <div className="col-md-7">
                <label className="form-label fw-bold">Recipe Title <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control border-dark"
                  required
                  placeholder="e.g. Grandma's Secret Garlic Butter Penne"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="col-md-5">
                <label className="form-label fw-bold">Cuisine / Category</label>
                <input
                  type="text"
                  className="form-control border-dark"
                  required
                  placeholder="e.g. Italian / Dinner"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Prep Time (mins)</label>
                <input
                  type="number"
                  className="form-control border-dark"
                  min="1"
                  required
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Cook Time (mins)</label>
                <input
                  type="number"
                  className="form-control border-dark"
                  min="0"
                  required
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Calories (kcal)</label>
                <input
                  type="number"
                  className="form-control border-dark"
                  min="50"
                  required
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Protein (g)</label>
                <input
                  type="number"
                  className="form-control border-dark"
                  min="0"
                  required
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">Photo Preset or Custom Image URL</label>
                <div className="input-group">
                  <select
                    className="form-select border-dark"
                    value={imagePreset}
                    onChange={(e) => setImagePreset(e.target.value)}
                  >
                    {PRESET_IMAGES.map((preset, idx) => (
                      <option key={idx} value={preset.url}>{preset.label}</option>
                    ))}
                    <option value="custom">Custom Image Web URL...</option>
                  </select>
                  {imagePreset === 'custom' && (
                    <input
                      type="url"
                      className="form-control border-dark"
                      placeholder="Paste image URL (https://...)"
                      required
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">Required Ingredients <span className="text-danger">*</span></label>
                <small className="text-muted d-block mb-1">Format: <code>Ingredient Name, Amount, Unit</code> (1 per line)</small>
                <textarea
                  className="form-control border-dark font-monospace"
                  rows="4"
                  required
                  placeholder="Eggs, 2, large&#10;Bread, 2, slices&#10;Garlic, 3, cloves&#10;Butter, 2, tbsp"
                  value={ingredientsRaw}
                  onChange={(e) => setIngredientsRaw(e.target.value)}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">Step-by-Step Cooking Instructions <span className="text-danger">*</span></label>
                <small className="text-muted d-block mb-1">Enter 1 instruction step per line</small>
                <textarea
                  className="form-control border-dark"
                  rows="4"
                  required
                  placeholder="Melt butter in skillet over medium heat.&#10;Add minced garlic and sauté until golden.&#10;Toast bread slices and serve warm!"
                  value={instructionsRaw}
                  onChange={(e) => setInstructionsRaw(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top border-dark p-3">
            <button type="button" className="btn btn-outline-dark rounded-pill fw-bold" onClick={() => setIsCustomRecipeModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-orange">Save Custom Recipe</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomRecipeModal;
