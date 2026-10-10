import React, { useRef } from 'react';

const OTPCodeInput = ({ value = '', onChange }) => {
  const inputsRef = useRef([]);

  const digits = (value + '      ').slice(0, 6).split('');

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newDigits = [...digits];
    newDigits[index] = val[val.length - 1];
    const newCode = newDigits.join('').trim();
    onChange(newCode);

    if (index < 5 && val) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] || digits[index] === ' ') {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      }
      const newDigits = [...digits];
      newDigits[index] = ' ';
      onChange(newDigits.join('').trim());
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, 5);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="d-flex justify-content-center gap-2 my-3" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="form-control text-center fw-bold fs-4 border-dark rounded-3"
          style={{ width: '48px', height: '56px', backgroundColor: '#FAF9F4', boxShadow: '2px 2px 0px #111' }}
          value={digits[idx] !== ' ' ? digits[idx] : ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPCodeInput;
