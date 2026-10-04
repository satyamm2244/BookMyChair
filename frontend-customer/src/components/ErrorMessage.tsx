import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="error-banner" role="alert">
      <div className="error-content">
        <span className="error-icon" aria-hidden="true">⚠️</span>
        <span className="error-text">{message}</span>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button type="button" className="error-retry-btn" onClick={onRetry}>
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
