import React from 'react';
import { useApp } from '../context/AppContext';

const ShoppingListModal = () => {
  const {
    isShoppingModalOpen,
    setIsShoppingModalOpen,
    shoppingList,
    toggleShoppingCheck,
    deleteShoppingItem,
    clearShoppingList,
    showToast
  } = useApp();

  if (!isShoppingModalOpen) return null;

  const handleCopy = () => {
    if (shoppingList.length === 0) return;
    const lines = shoppingList.map(item =>
      `${item.checked ? '[x]' : '[ ]'} ${item.name} (${item.amount} ${item.unit}) ${item.recipeTitle ? `- for ${item.recipeTitle}` : ''}`
    );
    const fullText = `whiskedaway Shopping List:\n\n` + lines.join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        showToast("Copied shopping list to clipboard!");
      }).catch(() => {
        showToast("Shopping list copied!");
      });
    } else {
      showToast("Shopping list copied!");
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={() => setIsShoppingModalOpen(false)}>
      <div className="modal-content-custom" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-bottom border-dark p-3 bg-light d-flex justify-content-between align-items-center">
          <h5 className="modal-title fw-bold mb-0"><i className="bi bi-cart3 text-warning me-2"></i>My Shopping List</h5>
          <button type="button" className="btn-close" onClick={() => setIsShoppingModalOpen(false)}></button>
        </div>
        <div className="modal-body p-3">
          {shoppingList.length === 0 ? (
            <div className="empty-state-box p-4">
              <i className="bi bi-cart-x fs-1 text-muted"></i>
              <h5 className="fw-bold mt-2">Shopping List Empty</h5>
              <p className="text-muted small">Add missing ingredients from recipes to build your shopping list!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {shoppingList.map((item, idx) => (
                <div key={item._id || idx} className="shopping-list-item">
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      id={`shop_${idx}`}
                      checked={item.checked}
                      onChange={() => toggleShoppingCheck(item._id || item.name)}
                    />
                    <label
                      className={`form-check-label ${item.checked ? "text-decoration-line-through text-muted" : "fw-bold"}`}
                      htmlFor={`shop_${idx}`}
                    >
                      {item.name} <small className="text-muted">({item.amount} {item.unit})</small>
                    </label>
                    {item.recipeTitle && (
                      <div className="small text-muted">For: {item.recipeTitle}</div>
                    )}
                  </div>
                  <button
                    className="btn btn-sm btn-link text-danger p-0 delete-shop-item"
                    onClick={() => deleteShoppingItem(item._id || item.name)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer border-top border-dark p-3 d-flex justify-content-between">
          <button className="btn btn-sm btn-outline-danger rounded-pill fw-bold" onClick={clearShoppingList}>
            <i className="bi bi-trash me-1"></i> Clear All
          </button>
          <button className="btn btn-sm btn-black" onClick={handleCopy} disabled={shoppingList.length === 0}>
            <i className="bi bi-clipboard me-1"></i> Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListModal;
