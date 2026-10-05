import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="message-wrapper assistant-wrapper" aria-live="polite">
      <div className="assistant-avatar" aria-hidden="true">
        ✨
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
};
