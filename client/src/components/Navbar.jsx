import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from './PresetAvatarGrid';

const Navbar = () => {
  const {
    activeTab,
    setActiveTab,
    savedFavorites,
    shoppingList,
    setIsCookbookModalOpen,
    setIsShoppingModalOpen,
    setIsCustomRecipeModalOpen
  } = useApp();

  const {
    user,
    isAuthenticated,
    setAuthModalOpen,
    setAuthModalMode,
    setAccountModalOpen,
    logout
  } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'cookbook') {
      setIsCookbookModalOpen(true);
    }
    setIsMobileMenuOpen(false);
  };

  const renderUserAccountControls = () => {
    if (isAuthenticated) {
      return (
        <div className="position-relative">
          <button
            className="btn btn-sm border border-dark rounded-pill bg-white d-flex align-items-center gap-2 p-1 pe-3 shadow-sm"
            style={{ boxShadow: '2px 2px 0px #111' }}
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-label="User Account Menu"
          >
            <AvatarDisplay avatar={user.avatar} size={32} />
            <span className="fw-bold text-dark me-1 text-truncate" style={{ fontSize: '0.85rem', maxWidth: '120px' }}>
              {user.displayName || user.username}
            </span>
            <i className="bi bi-chevron-down small text-muted"></i>
          </button>

          {userDropdownOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white border border-dark rounded-3 shadow-lg p-2"
              style={{ zIndex: 1100, minWidth: '200px', boxShadow: '4px 4px 0px #111' }}
            >
              <div className="px-3 py-2 border-bottom mb-1">
                <div className="fw-bold text-dark">{user.displayName || user.username}</div>
                <small className="text-muted d-block text-truncate">@{user.username}</small>
              </div>

              <button
                className="dropdown-item p-2 rounded fw-bold text-dark small d-flex align-items-center gap-2"
                onClick={() => {
                  setUserDropdownOpen(false);
                  setAccountModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <i className="bi bi-person-gear text-warning"></i> My Account & Settings
              </button>

              <button
                className="dropdown-item p-2 rounded fw-bold text-danger small d-flex align-items-center gap-2"
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        className="btn btn-black btn-sm"
        onClick={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
          setIsMobileMenuOpen(false);
        }}
      >
        <i className="bi bi-person-circle me-1"></i> Sign In
      </button>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container d-flex align-items-center justify-content-between">
        <a className="brand-logo" href="#" onClick={(e) => { e.preventDefault(); handleTabClick('explore'); }}>
          <i className="bi bi-fire"></i>
          <span>whiskedaway</span>
        </a>

        {/* Mobile-Only Header Controls: Account Button + Hamburger Toggle */}
        <div className="d-flex align-items-center gap-2 d-lg-none ms-auto">
          {renderUserAccountControls()}
          <button
            className="navbar-toggler border-0 ms-1 p-0"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <i className="bi bi-list fs-2 text-dark"></i>
          </button>
        </div>

        {/* Collapsible Nav Links & Desktop Controls */}
        <div className={`collapse navbar-collapse navbar-collapse-mobile ${isMobileMenuOpen ? 'show' : ''}`}>
          <div className="ms-auto d-flex align-items-center gap-2 flex-wrap mt-3 mt-lg-0">
            <button
              className={`nav-pill-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => handleTabClick('explore')}
            >
              <i className="bi bi-compass"></i> Explore Recipes
            </button>

            <button
              className={`nav-pill-btn ${activeTab === 'cookbook' ? 'active' : ''}`}
              onClick={() => {
                handleTabClick('cookbook');
                setIsCookbookModalOpen(true);
              }}
            >
              <i className="bi bi-journal-bookmark"></i> My Cookbook
              <span className="badge-count">{savedFavorites.size}</span>
            </button>

            <button
              className="nav-pill-btn"
              onClick={() => {
                setIsShoppingModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <i className="bi bi-cart3"></i> Shopping List
              <span className="badge-count">{shoppingList.length}</span>
            </button>

            <button
              className="btn btn-orange btn-sm ms-lg-2"
              onClick={() => {
                setIsCustomRecipeModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Custom Recipe
            </button>

            {/* Desktop-Only User Account Controls (Far Right) */}
            <div className="d-none d-lg-block ms-lg-2">
              {renderUserAccountControls()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
