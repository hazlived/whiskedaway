import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import OTPCodeInput from './OTPCodeInput';

const VerifyEmailView = ({ email: propEmail, onClose }) => {
  const { verifyEmailToken, resendVerification, user } = useAuth();
  const { showToast } = useApp();

  const [email, setEmail] = useState(propEmail || user?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit passcode.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await verifyEmailToken(code, email);
      setSuccessMsg(res.message);
      showToast('Email verified successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid or expired 6-digit passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Email address required to resend code.');
      return;
    }

    setErrorMsg(null);
    setResending(true);

    try {
      const res = await resendVerification(email);
      showToast(res.message || 'New 6-digit code sent!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div className="modal-content-custom" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header border-bottom border-dark p-3 bg-light d-flex justify-content-between align-items-center">
          <h5 className="modal-title fw-bold mb-0"><i className="bi bi-shield-check text-warning me-2"></i>Verify Your Email</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <div className="modal-body p-4 text-center">
          {errorMsg && (
            <div className="alert alert-danger border border-dark rounded-3 p-2 small mb-3 text-start">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="py-3">
              <i className="bi bi-patch-check-fill text-success display-3 mb-3 d-block"></i>
              <h4 className="fw-bold text-dark">Email Verified!</h4>
              <p className="text-muted small mb-4">{successMsg}</p>
              <button className="btn btn-orange" onClick={onClose}>Continue to App</button>
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              <p className="text-muted small mb-3">
                Enter the 6-digit passcode sent to <strong>{email || 'your email'}</strong>:
              </p>

              {!propEmail && !user?.email && (
                <div className="mb-3 text-start">
                  <label className="form-label fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control border-dark"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <OTPCodeInput value={code} onChange={setCode} />

              <button type="submit" className="btn btn-orange w-100 mt-2" disabled={loading || code.length < 6}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Verify Email Code
              </button>

              <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                <small className="text-muted">Didn't receive the code?</small>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-warning fw-bold p-0 text-decoration-none"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Resend 6-Digit Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailView;
