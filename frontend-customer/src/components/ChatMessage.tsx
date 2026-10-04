import type { ChatMessage as ChatMessageType, AvailableSlot } from '../types';
import { SlotPicker } from './SlotPicker';
import { BookingConfirmation } from './BookingConfirmation';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectSlot?: (slot: AvailableSlot, messageId: string) => void;
  disabled?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectSlot,
  disabled = false,
}) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`message-wrapper ${isUser ? 'user-wrapper' : 'assistant-wrapper'}`}
    >
      {!isUser && (
        <div className="assistant-avatar" aria-hidden="true">
          ✂️
        </div>
      )}

      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        {/* Render text if present */}
        {message.text && (
          <p className="message-text">{message.text}</p>
        )}

        {/* Special tag for approval required */}
        {message.responseType === 'approval_required' && (
          <div className="approval-notice">
            <span className="notice-icon">⏳</span>
            <span>Needs Salon Owner Approval</span>
          </div>
        )}

        {/* Render interactive slot suggestions */}
        {message.slots && message.slots.length > 0 && onSelectSlot && (
          <SlotPicker
            slots={message.slots}
            onSelectSlot={(slot) => onSelectSlot(slot, message.id)}
            disabled={disabled || message.isSlotSelected}
          />
        )}

        {/* Render confirmed booking card */}
        {message.booking && (
          <div className="confirmation-wrapper">
            <BookingConfirmation booking={message.booking} />
          </div>
        )}

        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
  );
};
