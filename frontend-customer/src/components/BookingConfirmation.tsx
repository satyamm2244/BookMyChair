import type { Booking } from '../types';

interface BookingConfirmationProps {
  booking: Booking;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking }) => {
  return (
    <div className="confirmation-card" role="region" aria-label="Booking Confirmation">
      <div className="confirmation-badge">
        <span className="check-icon">✓</span>
        <span>Booking Confirmed</span>
      </div>

      <div className="confirmation-body">
        <div className="detail-item">
          <span className="detail-label">Service</span>
          <span className="detail-value service-highlight">{booking.service}</span>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-value">{booking.date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Time</span>
            <span className="detail-value">{booking.time}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Stylist</span>
            <span className="detail-value">{booking.stylist}</span>
          </div>
          {booking.customerName && (
            <div className="detail-item">
              <span className="detail-label">Guest</span>
              <span className="detail-value">{booking.customerName}</span>
            </div>
          )}
        </div>

        <div className="detail-item">
          <span className="detail-label">Booking ID</span>
          <span className="detail-value mono-id">{booking.id}</span>
        </div>
      </div>

      <div className="confirmation-footer">
        <p className="confirmation-note">
          ✨ Your appointment is confirmed. You'll receive a reminder before your visit.
        </p>
      </div>
    </div>
  );
};
