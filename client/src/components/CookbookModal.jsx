import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const CookbookModal = () => {
  const {
    isCookbookModalOpen,
    setIsCookbookModalOpen,
    recipes,
    savedFavorites,
    toggleFavorite,
    setSelectedRecipeModal,
    selectedPantry
  } = useApp();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fromPageIndex, setFromPageIndex] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' or 'prev'

  const favorites = recipes.filter(r => savedFavorites.has(r.id || r.recipeId));
  const totalPages = favorites.length === 0 ? 1 : favorites.length + 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isCookbookModalOpen) return;
      if (e.key === "ArrowLeft") {
        flipToPage(currentPageIndex - 1);
      } else if (e.key === "ArrowRight") {
        flipToPage(currentPageIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCookbookModalOpen, currentPageIndex, totalPages, isFlipping]);

  if (!isCookbookModalOpen) return null;

  const flipToPage = (newIndex) => {
    if (isFlipping) return;
    if (newIndex < 0 || newIndex >= totalPages) return;
    if (newIndex === currentPageIndex) return;

    const fromIdx = currentPageIndex;
    const isNext = newIndex > fromIdx;

    setFromPageIndex(fromIdx);
    setCurrentPageIndex(newIndex); // Target page loads in background immediately
    setIsFlipping(true);
    setFlipDirection(isNext ? 'next' : 'prev');

    // Reset scroll positions of page containers
    document.querySelectorAll('.book-page-left, .book-page-right, .book-page-mobile').forEach(el => {
      el.scrollTop = 0;
    });

    setTimeout(() => {
      setIsFlipping(false);
      setFlipDirection(null);
      setFromPageIndex(null);
    }, 340);
  };

  const renderLeftPage = (pageIdx) => {
    if (pageIdx === 0) {
      return (
        <div className="h-100 d-flex flex-column justify-content-between p-2">
          <div className="text-center my-auto">
            <div className="mb-3">
              <i className="bi bi-journal-bookmark-fill text-warning display-3"></i>
            </div>
            <h2 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--black-main)' }}>
              My Culinary Cookbook
            </h2>
            <p className="text-muted small mb-4">
              Your personal kitchen archive & saved recipe handbook
            </p>

            <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill border border-dark shadow-sm">
              <i className="bi bi-bookmark-heart-fill text-danger"></i>
              <span className="fw-bold fs-6">{favorites.length} Saved Recipe{favorites.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="border-top border-secondary-subtle pt-3 text-center small text-muted">
            <i className="bi bi-info-circle me-1"></i> Flip pages using bottom controls, page corners, or Table of Contents.
          </div>
        </div>
      );
    }

    const recipe = favorites[pageIdx - 1];
    if (!recipe) return null;

    return (
      <div className="h-100 d-flex flex-column justify-content-between p-1">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="badge bg-warning text-dark fw-bold rounded-pill" style={{ fontSize: '0.72rem' }}>
              Recipe #{pageIdx} of {favorites.length}
            </span>
            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-sm btn-outline-dark rounded-pill"
                style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', fontWeight: 700 }}
                onClick={() => flipToPage(0)}
                title="Back to Table of Contents"
              >
                <i className="bi bi-journal-text me-1"></i> Index
              </button>
              <button
                className="btn btn-sm btn-outline-danger border-0 p-1"
                onClick={() => toggleFavorite(recipe.id || recipe.recipeId)}
                title="Remove from Cookbook"
              >
                <i className="bi bi-bookmark-x-fill fs-5"></i>
              </button>
            </div>
          </div>

          <h4 className="fw-bold mb-1 text-dark book-recipe-title" style={{ fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
            {recipe.title}
          </h4>

          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap small fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>
            <span className="badge bg-dark text-white">{recipe.cuisine}</span>
            <span><i className="bi bi-clock me-1 text-warning"></i>{(recipe.prepTime || 10) + (recipe.cookTime || 15)} mins</span>
            <span><i className="bi bi-star-fill text-warning me-1"></i>{recipe.rating || '4.8'}</span>
          </div>

          <div className="position-relative rounded-3 overflow-hidden border border-dark mb-2 shadow-sm book-recipe-img-box">
            <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <p className="small text-muted mb-2 fst-italic" style={{ fontSize: '0.8rem', lineHeight: 1.25, maxHeight: '38px', overflow: 'hidden' }}>
            "{recipe.summary || 'A delicious homemade recipe ready in under 30 minutes.'}"
          </p>
        </div>

        <div>
          <div className="fw-bold small text-uppercase mb-1 text-muted" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            <i className="bi bi-activity text-warning me-1"></i>Nutritional Facts
          </div>
          <div className="row g-2 text-center">
            <div className="col-3">
              <div className="p-1 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-danger fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.calories || 450}</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>KCAL</div>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.protein || 20}g</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>PROT</div>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.carbs || 40}g</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>CARB</div>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.fat || 15}g</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>FAT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRightPage = (pageIdx) => {
    if (pageIdx === 0) {
      if (favorites.length === 0) {
        return (
          <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center p-3">
            <i className="bi bi-bookmark-plus text-warning display-4 mb-3 d-block"></i>
            <h4 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Your Cookbook is Empty</h4>
            <p className="text-muted small mb-4" style={{ maxWidth: '280px' }}>
              Explore recipes from the main screen and click the bookmark <i className="bi bi-bookmark-heart text-danger me-1"></i> button to save them to your cookbook!
            </p>
            <button className="btn btn-orange btn-sm text-white" onClick={() => setIsCookbookModalOpen(false)}>
              <i className="bi bi-compass me-1"></i> Explore Recipes
            </button>
          </div>
        );
      }

      return (
        <div className="h-100 d-flex flex-column justify-content-between p-1">
          <div>
            <h5 className="fw-bold border-bottom border-dark pb-2 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <i className="bi bi-list-stars me-2 text-warning"></i>Table of Contents
            </h5>
            <div className="list-group list-group-flush rounded-3 border border-dark overflow-hidden shadow-sm" style={{ maxHeight: '460px', overflowY: 'auto' }}>
              {favorites.map((rec, idx) => (
                <button
                  key={rec.id || rec.recipeId}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 text-dark border-bottom border-secondary-subtle"
                  onClick={() => flipToPage(idx + 1)}
                >
                  <div className="text-truncate me-2" style={{ maxWidth: '380px' }}>
                    <span className="fw-bold me-2 text-warning">{idx + 1}.</span>
                    <span className="fw-semibold">{rec.title}</span>
                  </div>
                  <span className="badge bg-dark rounded-pill">{(rec.prepTime || 10) + (rec.cookTime || 15)}m</span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-end text-muted small pt-2">
            Table of Contents &bull; whiskedaway
          </div>
        </div>
      );
    }

    const recipe = favorites[pageIdx - 1];
    if (!recipe) return null;

    const userPantryLower = Array.from(selectedPantry).map(i => i.toLowerCase().trim());

    return (
      <div className="h-100 d-flex flex-column justify-content-between p-1">
        <div>
          <h5 className="fw-bold border-bottom border-dark pb-1 mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
            <i className="bi bi-basket-fill text-warning me-2"></i>Ingredients
          </h5>
          <ul className="list-unstyled mb-2 small book-scroll-list">
            {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
              const ingLower = ing.name.toLowerCase().trim();
              const hasIt = userPantryLower.some(u => ingLower.includes(u) || u.includes(ingLower));
              return (
                <li key={idx} className="py-1 border-bottom border-secondary-subtle d-flex justify-content-between align-items-center" style={{ fontSize: '0.82rem' }}>
                  <span>
                    <i className={`bi ${hasIt ? 'bi-check-circle-fill text-success' : 'bi-dash-circle text-warning'} me-1.5`}></i>
                    {ing.name}
                  </span>
                  <span className="fw-semibold text-muted">{ing.amount} {ing.unit}</span>
                </li>
              );
            })}
          </ul>

          <h5 className="fw-bold border-bottom border-dark pb-1 mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
            <i className="bi bi-journal-check text-warning me-2"></i>Instructions
          </h5>
          <ol className="ps-3 mb-2 small book-scroll-list">
            {recipe.instructions && recipe.instructions.map((inst, idx) => (
              <li key={idx} className="mb-1">{inst}</li>
            ))}
          </ol>
        </div>

        <div className="pt-1 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
          <button
            className="btn btn-sm btn-black"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => {
              setIsCookbookModalOpen(false);
              setSelectedRecipeModal(recipe);
            }}
          >
            <i className="bi bi-arrows-fullscreen me-1"></i> Detailed View
          </button>
          <span className="small text-muted" style={{ fontSize: '0.78rem' }}>Spread #{pageIdx}</span>
        </div>
      </div>
    );
  };

  const renderMobileSinglePage = (pageIdx) => {
    if (pageIdx === 0) {
      return (
        <div className="p-2">
          <div className="text-center mb-4 pb-3 border-bottom border-dark">
            <div className="mb-2">
              <i className="bi bi-journal-bookmark-fill text-warning display-4"></i>
            </div>
            <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--black-main)' }}>
              My Culinary Cookbook
            </h2>
            <p className="text-muted small mb-3">
              Your personal kitchen archive & saved recipe handbook
            </p>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill border border-dark shadow-sm">
              <i className="bi bi-bookmark-heart-fill text-danger"></i>
              <span className="fw-bold fs-6">{favorites.length} Saved Recipe{favorites.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div>
            <h5 className="fw-bold border-bottom border-dark pb-2 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <i className="bi bi-list-stars me-2 text-warning"></i>Table of Contents
            </h5>
            {favorites.length === 0 ? (
              <div className="text-center p-3 my-2">
                <i className="bi bi-bookmark-plus text-warning display-5 mb-2 d-block"></i>
                <p className="text-muted small mb-3">Your cookbook is currently empty. Bookmark recipes to save them here!</p>
                <button className="btn btn-orange btn-sm text-white" onClick={() => setIsCookbookModalOpen(false)}>
                  <i className="bi bi-compass me-1"></i> Explore Recipes
                </button>
              </div>
            ) : (
              <div className="list-group list-group-flush rounded-3 border border-dark overflow-hidden shadow-sm mb-3">
                {favorites.map((rec, idx) => (
                  <button
                    key={rec.id || rec.recipeId}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 text-dark border-bottom border-secondary-subtle"
                    onClick={() => flipToPage(idx + 1)}
                  >
                    <div className="text-truncate me-2">
                      <span className="fw-bold me-2 text-warning">{idx + 1}.</span>
                      <span className="fw-semibold">{rec.title}</span>
                    </div>
                    <span className="badge bg-dark rounded-pill">{(rec.prepTime || 10) + (rec.cookTime || 15)}m</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    const recipe = favorites[pageIdx - 1];
    if (!recipe) return null;

    const userPantryLower = Array.from(selectedPantry).map(i => i.toLowerCase().trim());

    return (
      <div className="p-2">
        {/* Top Header Controls */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-warning text-dark fw-bold rounded-pill" style={{ fontSize: '0.75rem' }}>
            Recipe #{pageIdx} of {favorites.length}
          </span>
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm btn-outline-dark rounded-pill"
              style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', fontWeight: 700 }}
              onClick={() => flipToPage(0)}
              title="Back to Table of Contents"
            >
              <i className="bi bi-journal-text me-1"></i> Index
            </button>
            <button
              className="btn btn-sm btn-outline-danger border-0 p-1"
              onClick={() => toggleFavorite(recipe.id || recipe.recipeId)}
              title="Remove from Cookbook"
            >
              <i className="bi bi-bookmark-x-fill fs-5"></i>
            </button>
          </div>
        </div>

        {/* Recipe Title & Meta */}
        <h4 className="fw-bold mb-1 text-dark" style={{ fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
          {recipe.title}
        </h4>

        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap small fw-semibold text-muted" style={{ fontSize: '0.8rem' }}>
          <span className="badge bg-dark text-white">{recipe.cuisine}</span>
          <span><i className="bi bi-clock me-1 text-warning"></i>{(recipe.prepTime || 10) + (recipe.cookTime || 15)} mins</span>
          <span><i className="bi bi-star-fill text-warning me-1"></i>{recipe.rating || '4.8'}</span>
        </div>

        {/* Recipe Image */}
        <div className="position-relative rounded-3 overflow-hidden border border-dark mb-2 shadow-sm" style={{ height: '180px' }}>
          <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Summary */}
        <p className="small text-muted mb-3 fst-italic" style={{ fontSize: '0.85rem', lineHeight: 1.3 }}>
          "{recipe.summary || 'A delicious homemade recipe ready in under 30 minutes.'}"
        </p>

        {/* Nutrition */}
        <div className="mb-3">
          <div className="fw-bold small text-uppercase mb-2 text-muted" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            <i className="bi bi-activity text-warning me-1"></i>Nutritional Facts
          </div>
          <div className="row g-2 text-center">
            <div className="col-3">
              <div className="p-1.5 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-danger fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.calories || 450}</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>KCAL</div>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1.5 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.protein || 20}g</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>PROT</div>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1.5 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.carbs || 40}g</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>CARB</div>
              </div>
            </div>
            <div className="col-3">
              <div className="p-1.5 rounded bg-white border border-secondary-subtle">
                <div className="fw-bold text-dark fs-6 mb-0" style={{ lineHeight: 1 }}>{recipe.nutrition?.fat || 15}g</div>
                <div className="small text-muted fw-bold" style={{ fontSize: '0.65rem' }}>FAT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-3">
          <h5 className="fw-bold border-bottom border-dark pb-1 mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
            <i className="bi bi-basket-fill text-warning me-2"></i>Ingredients
          </h5>
          <ul className="list-unstyled mb-0 small">
            {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
              const ingLower = ing.name.toLowerCase().trim();
              const hasIt = userPantryLower.some(u => ingLower.includes(u) || u.includes(ingLower));
              return (
                <li key={idx} className="py-1 border-bottom border-secondary-subtle d-flex justify-content-between align-items-center" style={{ fontSize: '0.82rem' }}>
                  <span>
                    <i className={`bi ${hasIt ? 'bi-check-circle-fill text-success' : 'bi-dash-circle text-warning'} me-1.5`}></i>
                    {ing.name}
                  </span>
                  <span className="fw-semibold text-muted">{ing.amount} {ing.unit}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-3">
          <h5 className="fw-bold border-bottom border-dark pb-1 mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
            <i className="bi bi-journal-check text-warning me-2"></i>Instructions
          </h5>
          <ol className="ps-3 mb-0 small">
            {recipe.instructions && recipe.instructions.map((inst, idx) => (
              <li key={idx} className="mb-1.5" style={{ lineHeight: 1.35 }}>{inst}</li>
            ))}
          </ol>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
          <button
            className="btn btn-sm btn-black w-100"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            onClick={() => {
              setIsCookbookModalOpen(false);
              setSelectedRecipeModal(recipe);
            }}
          >
            <i className="bi bi-arrows-fullscreen me-1"></i> Open Detailed View
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="custom-modal-backdrop" onClick={() => setIsCookbookModalOpen(false)}>
      <div className="cookbook-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="book-wrapper">
          <div className="book-cover">
            <div className="d-flex justify-content-between align-items-center mb-2 px-2 text-white">
              <span className="fw-bold fs-5" style={{ fontFamily: 'var(--font-heading)' }}>
                <i className="bi bi-journal-bookmark-fill text-warning me-2"></i>My Cookbook
              </span>
              <button className="modal-close-btn position-static me-0" onClick={() => setIsCookbookModalOpen(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="book-spread">
              <div className="book-spine-line d-none d-md-block"></div>
              <div className="book-spine-shadow d-none d-md-block"></div>

              <div className={`book-page-shadow-overlay d-none d-md-block ${flipDirection === 'next' ? 'shadow-left' : flipDirection === 'prev' ? 'shadow-right' : ''}`} style={{ opacity: isFlipping ? 1 : 0 }}></div>

              {/* Desktop Dual-Page Layout (>= 768px) */}
              <div className="book-page-left d-none d-md-block">
                {renderLeftPage(currentPageIndex)}
              </div>

              <div className="book-page-right d-none d-md-block">
                {renderRightPage(currentPageIndex)}
              </div>

              {/* Mobile Single-Page Layout (< 768px) */}
              <div className="book-page-mobile d-block d-md-none w-100 h-100 p-2 overflow-y-auto">
                {renderMobileSinglePage(currentPageIndex)}
              </div>

              {isFlipping && fromPageIndex !== null && (
                <>
                  {/* Desktop 3D Dual-Page Flip */}
                  <div className="flipping-leaf-wrapper d-none d-md-block">
                    <div className={`flipping-leaf ${flipDirection === 'next' ? 'flip-next' : 'flip-prev'}`}>
                      <div className="leaf-face leaf-front">
                        <div className="leaf-lighting"></div>
                        {flipDirection === 'next' ? renderRightPage(fromPageIndex) : renderLeftPage(fromPageIndex)}
                      </div>
                      <div className="leaf-face leaf-back">
                        <div className="leaf-lighting"></div>
                        {flipDirection === 'next' ? renderLeftPage(currentPageIndex) : renderRightPage(currentPageIndex)}
                      </div>
                    </div>
                  </div>

                  {/* Mobile 3D Single-Page Flip */}
                  <div className="flipping-leaf-mobile-wrapper d-block d-md-none">
                    <div className={`flipping-leaf-mobile ${flipDirection === 'next' ? 'flip-mobile-next' : 'flip-mobile-prev'}`}>
                      <div className="leaf-face leaf-front">
                        <div className="leaf-lighting"></div>
                        {renderMobileSinglePage(fromPageIndex)}
                      </div>
                      <div className="leaf-face leaf-back">
                        <div className="leaf-lighting"></div>
                        {renderMobileSinglePage(currentPageIndex)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="page-click-zone left-click-zone" onClick={() => flipToPage(currentPageIndex - 1)} title="Turn to Previous Page">
                <div className="corner-curl corner-curl-left"></div>
              </div>
              <div className="page-click-zone right-click-zone" onClick={() => flipToPage(currentPageIndex + 1)} title="Turn to Next Page">
                <div className="corner-curl corner-curl-right"></div>
              </div>
            </div>

            <div className="book-nav-bar">
              <button
                className="btn btn-black btn-sm"
                disabled={currentPageIndex === 0 || isFlipping}
                onClick={() => flipToPage(currentPageIndex - 1)}
              >
                <i className="bi bi-arrow-left me-1"></i> Prev Page
              </button>

              <span className="book-page-badge">Page {currentPageIndex + 1} of {totalPages}</span>

              <button
                className="btn btn-black btn-sm"
                disabled={currentPageIndex >= totalPages - 1 || isFlipping}
                onClick={() => flipToPage(currentPageIndex + 1)}
              >
                Next Page <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookbookModal;
