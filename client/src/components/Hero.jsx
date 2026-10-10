import React from 'react';
import { useApp } from '../context/AppContext';

const Hero = () => {
  const { selectedPantry, recipes } = useApp();

  return (
    <header className="hero-wrapper">
      <div className="container position-relative">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h1 className="hero-title mb-3">
              Turn Leftover Ingredients into <span>Delicious Meals</span>
            </h1>
            <p className="hero-subtitle mb-4">
              Select the ingredients sitting in your fridge or pantry right now. Instantly discover matching recipes with
              step-by-step instructions and complete macro nutritional details!
            </p>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="stat-pill">
                <div className="stat-icon"><i class="bi bi-basket3-fill"></i></div>
                <div>
                  <div className="fw-bold fs-5 leading-none">{selectedPantry.size}</div>
                  <small className="text-muted">Pantry Items Selected</small>
                </div>
              </div>

              <div className="stat-pill">
                <div className="stat-icon"><i class="bi bi-lightning-charge-fill"></i></div>
                <div>
                  <div className="fw-bold fs-5 leading-none">{recipes.length}+</div>
                  <small className="text-muted">Recipes Ready</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
