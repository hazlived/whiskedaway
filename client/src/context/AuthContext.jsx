import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'verify'
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountTab, setAccountTab] = useState('profile');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Configure custom headers for CSRF validation
  axiosClient.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axiosClient.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (loginInput, password) => {
    const res = await axiosClient.post('/auth/login', { loginInput, password });
    if (res.data && res.data.success) {
      setUser(res.data.data);
      setAuthModalOpen(false);
      return res.data;
    }
  };

  const register = async (username, email, password, displayName) => {
    const res = await axiosClient.post('/auth/register', { username, email, password, displayName });
    if (res.data && res.data.success) {
      setUser(res.data.data);
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) { }
    setUser(null);
    setAccountModalOpen(false);
  };

  const logoutAll = async () => {
    try {
      await axiosClient.post('/auth/logout-all');
    } catch (e) { }
    setUser(null);
    setAccountModalOpen(false);
  };

  const updateProfile = async (fields) => {
    const res = await axiosClient.patch('/users/me', fields);
    if (res.data && res.data.success) {
      setUser(res.data.data);
      return res.data;
    }
  };

  const updateUsername = async (newUsername) => {
    const res = await axiosClient.patch('/users/me/username', { newUsername });
    if (res.data && res.data.success) {
      setUser(res.data.data);
      return res.data;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await axiosClient.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  const requestEmailChange = async (newEmail, password) => {
    const res = await axiosClient.post('/users/me/change-email', { newEmail, password });
    return res.data;
  };

  const confirmEmailChange = async (code) => {
    const res = await axiosClient.post('/users/me/confirm-email-change', { code });
    if (res.data && res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const verifyEmailToken = async (code, email) => {
    const res = await axiosClient.post('/auth/verify-email', { code, email });
    if (res.data && res.data.success && user) {
      setUser(prev => ({ ...prev, emailVerified: true }));
    }
    return res.data;
  };

  const resendVerification = async (email) => {
    const res = await axiosClient.post('/auth/resend-verification', { email });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await axiosClient.post('/auth/forgot-password', { email });
    return res.data;
  };

  const verifyResetCode = async (email, code) => {
    const res = await axiosClient.post('/auth/verify-reset-code', { email, code });
    return res.data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await axiosClient.post('/auth/reset-password', { email, code, newPassword });
    return res.data;
  };

  const setPresetAvatar = async (presetId) => {
    const res = await axiosClient.patch('/users/me/avatar/preset', { presetId });
    if (res.data && res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const uploadCustomAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axiosClient.post('/users/me/avatar/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data && res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const deleteCustomAvatar = async () => {
    const res = await axiosClient.delete('/users/me/avatar');
    if (res.data && res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const deleteAccount = async (password, confirmationPhrase) => {
    const res = await axiosClient.delete('/users/me', { data: { password, confirmationPhrase } });
    if (res.data && res.data.success) {
      setUser(null);
      setAccountModalOpen(false);
    }
    return res.data;
  };

  const syncGuestData = async (guestData) => {
    try {
      const res = await axiosClient.post('/users/me/sync-guest-data', guestData);
      return res.data;
    } catch (e) { }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      authModalOpen,
      setAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      accountModalOpen,
      setAccountModalOpen,
      accountTab,
      setAccountTab,
      verifyModalOpen,
      setVerifyModalOpen,
      login,
      register,
      logout,
      logoutAll,
      updateProfile,
      updateUsername,
      changePassword,
      requestEmailChange,
      confirmEmailChange,
      verifyEmailToken,
      resendVerification,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      setPresetAvatar,
      uploadCustomAvatar,
      deleteCustomAvatar,
      deleteAccount,
      syncGuestData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
