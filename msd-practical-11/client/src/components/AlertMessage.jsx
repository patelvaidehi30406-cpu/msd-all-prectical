import React from 'react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">
        <span className="alert-icon">
          {type === 'error' && '⚠️'}
          {type === 'success' && '✅'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
