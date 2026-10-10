import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import OTPCodeInput from './OTPCodeInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const ResetPasswordView = ({ email: propEmail, onClose }) => {
  const { verifyResetCode, resetPassword, setAuthModalMode, setAuthModalOpen } = useAuth();
  const { showToast } = useApp();

  const [email, setEmail] = useState(propEmail || '');
  const [code, setCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || code.length < 6) {
      setErrorMsg('Please enter your email address and 6-digit passcode.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await verifyResetCode(email, code);
      setIsUnlocked(true);
      showToast('Passcode verified! Enter your new password.');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid or expired 6-digit passcode.');
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
      const res = await resetPassword(email, code, newPassword);
      setSuccessMsg(res.message);
      showToast('Password reset successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div className="modal-content-custom" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-bottom border-dark p-3 bg-light d-flex justify-content-between align-items-center">
          <h5 className="modal-title fw-bold mb-0">
            <i className="bi bi-key-fill text-warning me-2"></i>Reset Password
          </h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <div className="modal-body p-4">
          {errorMsg && (
            <div className="alert alert-danger border border-dark rounded-3 p-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="text-center py-3">
              <i className="bi bi-check-circle-fill text-success display-3 mb-3 d-block"></i>
              <h4 className="fw-bold">Password Reset Complete</h4>
              <p className="text-muted small mb-4">{successMsg}</p>
              <button
                className="btn btn-orange"
                onClick={() => {
                  onClose();
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
              >
                Sign In Now
              </button>
            </div>
          ) : !isUnlocked ? (
            <form onSubmit={handleVerifyCode}>
              <h6 className="fw-bold mb-2">Step 1: Verify 6-Digit Passcode</h6>
              <p className="text-muted small mb-3">Enter your registered email address and the 6-digit passcode sent to your inbox:</p>

              <div className="mb-3">
                <label className="form-label fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control border-dark"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3 text-center">
                <label className="form-label fw-bold">6-Digit Passcode</label>
                <OTPCodeInput value={code} onChange={setCode} />
              </div>

              <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading || code.length < 6}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Verify Code & Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit}>
              <h6 className="fw-bold mb-2 text-success"><i className="bi bi-unlock-fill me-1"></i>Step 2: Set New Password</h6>
              <p className="text-muted small mb-3">Code verified for <strong>{email}</strong>. Enter your new password below:</p>

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
      </div>
    </div>
  );
};

export default ResetPasswordView;
