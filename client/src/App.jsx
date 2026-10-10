import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PantrySection from './components/PantrySection';
import FilterBar from './components/FilterBar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetailModal from './components/RecipeDetailModal';
import CookbookModal from './components/CookbookModal';
import ShoppingListModal from './components/ShoppingListModal';
import CustomRecipeModal from './components/CustomRecipeModal';
import AuthModal from './components/AuthModal';
import AccountModal from './components/AccountModal';
import VerifyEmailView from './components/VerifyEmailView';
import ResetPasswordView from './components/ResetPasswordView';
import Toast from './components/Toast';

const MainContent = () => {
  const { verifyModalOpen, setVerifyModalOpen } = useAuth();
  const [recipeCount, setRecipeCount] = useState(0);
  const [verifyToken, setVerifyToken] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    const tokenParam = params.get('token');
    if (tokenParam) {
      if (pathname.includes('verify-email')) {
        setVerifyToken(tokenParam);
      } else if (pathname.includes('reset-password') || pathname.includes('confirm-email-change')) {
        setResetToken(tokenParam);
      }
    }
  }, []);

  return (
    <>
      <Navbar />
      <Hero />

      <main className="container my-4">
        <PantrySection />
        <FilterBar filteredCount={recipeCount} />
        <RecipeGrid onCountUpdate={setRecipeCount} />
      </main>

      <footer className="bg-dark text-white py-4 mt-5 border-top border-4 border-warning">
        <div className="container text-center">
          <div className="brand-logo justify-content-center text-white mb-2 fs-4">
            <i className="bi bi-fire text-warning"></i>
            <span>whiskedaway</span>
          </div>
          <p className="text-muted small mb-0">Reducing food waste & empowering healthy home cooks worldwide.</p>
        </div>
      </footer>

      {/* Interactive Modals & Overlays */}
      <RecipeDetailModal />
      <CookbookModal />
      <ShoppingListModal />
      <CustomRecipeModal />
      <AuthModal />
      <AccountModal />

      {(verifyModalOpen || verifyToken) && (
        <VerifyEmailView
          token={verifyToken}
          onClose={() => {
            setVerifyToken(null);
            setVerifyModalOpen(false);
          }}
        />
      )}
      {resetToken && <ResetPasswordView token={resetToken} onClose={() => setResetToken(null)} />}

      <Toast />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
