import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <header className="chat-header">
      <div className="chat-header-main">
        <div className="salon-brand-icon" aria-hidden="true">
          💺
        </div>
        <div className="chat-header-info">
          <div className="title-row">
            <h1 className="salon-title">BookMyChair</h1>
            <span className="online-badge">
              <span className="online-dot" /> Online
            </span>
          </div>
          <p className="salon-subtitle">AI Booking Assistant</p>
        </div>
      </div>
      <div className="trust-banner" role="note">
        <span className="trust-icon">ℹ️</span>
        <span>You're chatting with an automated booking assistant.</span>
      </div>
    </header>
  );
};
