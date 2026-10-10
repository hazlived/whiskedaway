import React from 'react';
import zxcvbn from 'zxcvbn';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['#D32F2F', '#ED6C02', '#F2994A', '#27AE60', '#2E7D32'];

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const result = zxcvbn(password);
  const score = result.score; // 0 to 4
  const label = STRENGTH_LABELS[score];
  const color = STRENGTH_COLORS[score];

  const feedback = [];
  if (result.feedback.warning) {
    feedback.push(result.feedback.warning);
  }
  if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
    feedback.push(...result.feedback.suggestions);
  }

  return (
    <div className="password-strength-container mt-2">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="fw-bold text-muted">Password Strength:</small>
        <small className="fw-bold" style={{ color }} aria-live="polite">
          {label} ({score}/4)
        </small>
      </div>

      <div
        className="progress"
        style={{ height: '8px', backgroundColor: '#E8E2D6', borderRadius: '4px', overflow: 'hidden' }}
        role="progressbar"
        aria-valuenow={(score + 1) * 20}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Password strength is ${label}`}
      >
        <div
          className="progress-bar"
          style={{
            width: `${(score + 1) * 20}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }}
        ></div>
      </div>

      {feedback.length > 0 && (
        <div className="small text-muted mt-1 p-2 bg-light rounded border border-secondary-subtle">
          <i className="bi bi-info-circle text-warning me-1"></i>
          {feedback.join(' ')}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
