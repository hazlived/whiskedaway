import React from 'react';
import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="toast-custom d-flex align-items-center">
      <i className="bi bi-info-circle-fill text-warning me-2 fs-5"></i>
      <span>{toastMessage}</span>
    </div>
  );
};

export default Toast;
