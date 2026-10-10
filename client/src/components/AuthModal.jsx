import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import OTPCodeInput from './OTPCodeInput';
import axiosClient from '../api/axiosClient';

const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    verifyEmailToken,
    syncGuestData
  } = useAuth();

  const { showToast, savedFavorites, shoppingList, customRecipes } = useApp();

  // Login State
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifyStep, setIsVerifyStep] = useState(false);

  // Forgot Password & Reset State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotUnlocked, setForgotUnlocked] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Availability State
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsVerifyStep(false);
    setForgotUnlocked(false);
    setForgotCode('');
  }, [authModalMode, authModalOpen]);

  // Debounced Username Checker
  useEffect(() => {
    if (authModalMode !== 'register' || !username.trim()) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/auth/check-username?username=${encodeURIComponent(username.trim())}`);
        setUsernameStatus({ checking: false, available: res.data.available, reason: res.data.reason });
      } catch (err) {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, authModalMode]);

  // Debounced Email Checker
  useEffect(() => {
    if (authModalMode !== 'register' || !email.trim()) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/auth/check-email?email=${encodeURIComponent(email.trim())}`);
        setEmailStatus({ checking: false, available: res.data.available, reason: res.data.reason });
      } catch (err) {
        setEmailStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, authModalMode]);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(loginInput, password);
      showToast('Welcome back!');

      if (savedFavorites.size > 0 || shoppingList.length > 0 || customRecipes.length > 0) {
        syncGuestData({
          favorites: Array.from(savedFavorites),
          shoppingList,
          customRecipes
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await register(username, email, password, displayName);
      setIsVerifyStep(true);
      showToast('Account created! Enter the 6-digit code sent to your email.');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await verifyEmailToken(verifyCode, email);
      showToast('Email verified successfully!');
      setAuthModalOpen(false);

      if (savedFavorites.size > 0 || shoppingList.length > 0 || customRecipes.length > 0) {
        syncGuestData({
          favorites: Array.from(savedFavorites),
          shoppingList,
          customRecipes
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid or expired 6-digit passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      setSuccessMsg(res.message);
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotCode = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await verifyResetCode(forgotEmail, forgotCode);
      setForgotUnlocked(true);
      showToast('Passcode verified! Enter your new password.');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid or expired passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await resetPassword(forgotEmail, forgotCode, newPassword);
      setSuccessMsg(res.message);
      showToast('Password reset! Please sign in.');
      setForgotUnlocked(false);
      setAuthModalMode('login');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
      <div className="modal-content-custom" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-bottom border-dark p-3 bg-light d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-bold ${authModalMode === 'login' ? 'btn-black' : 'btn-outline-dark'}`}
              onClick={() => setAuthModalMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-bold ${authModalMode === 'register' ? 'btn-orange' : 'btn-outline-dark'}`}
              onClick={() => setAuthModalMode('register')}
            >
              Create Account
            </button>
          </div>
          <button type="button" className="btn-close" onClick={() => setAuthModalOpen(false)} aria-label="Close"></button>
        </div>

        <div className="modal-body p-4">
          {errorMsg && (
            <div className="alert alert-danger border border-dark rounded-3 p-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success border border-dark rounded-3 p-2 small mb-3">
              <i className="bi bi-check-circle-fill me-1"></i> {successMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <h4 className="fw-bold mb-3">Welcome Back to WhiskedAway</h4>

              <div className="mb-3">
                <label className="form-label fw-bold">Email or Username</label>
                <input
                  type="text"
                  className="form-control border-dark"
                  required
                  autoComplete="username"
                  placeholder="e.g. chef_john or john@example.com"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold mb-0">Password</label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                    onClick={() => setAuthModalMode('forgot')}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-dark"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-dark"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-box-arrow-in-right me-1"></i>}
                Sign In
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authModalMode === 'register' && !isVerifyStep && (
            <form onSubmit={handleRegisterSubmit}>
              <h4 className="fw-bold mb-3">Join WhiskedAway</h4>

              <div className="mb-3">
                <label className="form-label fw-bold">Username <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control border-dark"
                  required
                  autoComplete="username"
                  placeholder="e.g. home_cook_24"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {usernameStatus && (
                  <small className={`d-block mt-1 ${usernameStatus.checking ? 'text-muted' : usernameStatus.available ? 'text-success fw-bold' : 'text-danger'}`}>
                    {usernameStatus.checking ? <><span className="spinner-border spinner-border-sm me-1"></span>Checking availability...</> : usernameStatus.reason}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Email Address <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control border-dark"
                  required
                  autoComplete="email"
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailStatus && (
                  <small className={`d-block mt-1 ${emailStatus.checking ? 'text-muted' : emailStatus.available ? 'text-success fw-bold' : 'text-danger'}`}>
                    {emailStatus.checking ? <><span className="spinner-border spinner-border-sm me-1"></span>Checking availability...</> : emailStatus.reason}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Display Name (Optional)</label>
                <input
                  type="text"
                  className="form-control border-dark"
                  placeholder="e.g. Chef John"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Password <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-dark"
                    required
                    autoComplete="new-password"
                    placeholder="At least 12 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-dark"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
                <PasswordStrengthMeter password={password} />
              </div>

              <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-person-plus-fill me-1"></i>}
                Create Free Account
              </button>
            </form>
          )}

          {/* REGISTER STEP 2: 6-DIGIT VERIFICATION CODE */}
          {authModalMode === 'register' && isVerifyStep && (
            <form onSubmit={handleVerifySubmit} className="text-center">
              <h4 className="fw-bold mb-2">Verify Your Email</h4>
              <p className="text-muted small mb-3">Enter the 6-digit passcode sent via Resend to <strong>{email}</strong>:</p>

              <OTPCodeInput value={verifyCode} onChange={setVerifyCode} />

              <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading || verifyCode.length < 6}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Verify & Enter WhiskedAway
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authModalMode === 'forgot' && (
            <div>
              {!forgotUnlocked ? (
                <form onSubmit={handleVerifyForgotCode}>
                  <h4 className="fw-bold mb-2">Reset Password</h4>
                  <p className="text-muted small mb-3">Enter your registered email to receive a 6-digit passcode:</p>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Email Address</label>
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-control border-dark"
                        required
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-dark fw-bold"
                        onClick={handleForgotSubmit}
                        disabled={loading || !forgotEmail}
                      >
                        Send Code
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 text-center">
                    <label className="form-label fw-bold">6-Digit Passcode</label>
                    <OTPCodeInput value={forgotCode} onChange={setForgotCode} />
                  </div>

                  <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading || forgotCode.length < 6}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                    Verify Code & Unlock Reset Form
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link text-dark fw-bold btn-sm text-decoration-none"
                      onClick={() => setAuthModalMode('login')}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit}>
                  <h4 className="fw-bold mb-2 text-success"><i className="bi bi-unlock-fill me-1"></i>Set New Password</h4>
                  <p className="text-muted small mb-3">Enter your new password for <strong>{forgotEmail}</strong>:</p>

                  <div className="mb-3">
                    <label className="form-label fw-bold">New Password</label>
                    <input
                      type="password"
                      className="form-control border-dark"
                      required
                      placeholder="At least 12 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <PasswordStrengthMeter password={newPassword} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control border-dark"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                    Save New Password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
