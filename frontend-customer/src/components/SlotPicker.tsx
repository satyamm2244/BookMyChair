import type { AvailableSlot } from '../types';

interface SlotPickerProps {
  slots: AvailableSlot[];
  onSelectSlot: (slot: AvailableSlot) => void;
  disabled?: boolean;
  selectedSlot?: AvailableSlot | null;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  onSelectSlot,
  disabled = false,
  selectedSlot = null,
}) => {
  if (!slots || slots.length === 0) {
    return null;
  }

  return (
    <div className="slot-picker-container">
      <div className="slot-picker-title">
        <span>Available Slots</span>
        <span className="slot-subtitle">Tap to confirm appointment</span>
      </div>
      <div className="slots-grid">
        {slots.map((slot, index) => {
          const isSelected =
            selectedSlot &&
            selectedSlot.start === slot.start &&
            selectedSlot.stylistId === slot.stylistId;

          return (
            <button
              key={`${slot.stylistId}-${slot.start}-${index}`}
              type="button"
              className={`slot-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectSlot(slot)}
              disabled={disabled}
              aria-label={`Select slot at ${slot.startIST} with stylist ${slot.stylistName}`}
            >
              <div className="slot-time">
                <span className="clock-icon" aria-hidden="true">🕒</span>
                <span className="time-text">{slot.startIST}</span>
              </div>
              <div className="slot-stylist">
                <span className="stylist-badge">
                  Stylist: <strong>{slot.stylistName}</strong>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
