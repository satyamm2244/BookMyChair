import { useState } from 'react';
import type { Appointment, AppointmentStatus, ScheduleGap } from '../types/dashboard';

interface ScheduleViewProps {
  appointments: Appointment[];
  gaps: ScheduleGap[];
  activeDay: 'today' | 'tomorrow';
  onDayChange: (day: 'today' | 'tomorrow') => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  isProcessingId?: string | null;
}

const statusBadgeConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'status-badge-confirmed' },
  in_progress: { label: 'In Progress', className: 'status-badge-progress' },
  completed: { label: 'Completed', className: 'status-badge-completed' },
  cancelled: { label: 'Cancelled', className: 'status-badge-cancelled' },
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  gaps,
  activeDay,
  onDayChange,
  onStatusChange,
  isProcessingId,
}) => {
  const [showGaps, setShowGaps] = useState<boolean>(true);

  const filteredAppointments = appointments.filter((apt) => apt.date === activeDay);
  const filteredGaps = gaps.filter((gap) => gap.date === activeDay);

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Schedule Overview</h2>
          <p className="section-subtitle">Real-time chair bookings, stylist allocations & gaps</p>
        </div>

        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill ${activeDay === 'today' ? 'active' : ''}`}
            onClick={() => onDayChange('today')}
          >
            Today ({appointments.filter((a) => a.date === 'today').length})
          </button>
          <button
            type="button"
            className={`tab-pill ${activeDay === 'tomorrow' ? 'active' : ''}`}
            onClick={() => onDayChange('tomorrow')}
          >
            Tomorrow ({appointments.filter((a) => a.date === 'tomorrow').length})
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments booked for {activeDay}.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((apt) => {
            const badge = statusBadgeConfig[apt.status] || {
              label: apt.status,
              className: 'status-badge-default',
            };
            const isBusy = isProcessingId === apt.id;

            return (
              <div key={apt.id} className="appointment-item">
                <div className="appointment-time-col">
                  <span className="appointment-time">{apt.time}</span>
                  <span className="stylist-tag">✂️ {apt.stylist}</span>
                </div>

                <div className="appointment-main-col">
                  <div className="customer-info-line">
                    <span className="customer-name">{apt.customerName}</span>
                    {apt.customerPhone && (
                      <span className="customer-phone">{apt.customerPhone}</span>
                    )}
                  </div>
                  <div className="service-name">{apt.service}</div>
                </div>

                <div className="appointment-status-col">
                  <span className={`status-badge ${badge.className}`}>{badge.label}</span>

                  <select
                    className="status-selector"
                    value={apt.status}
                    onChange={(e) =>
                      onStatusChange(apt.id, e.target.value as AppointmentStatus)
                    }
                    disabled={isBusy}
                    title="Change status"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Gaps Section */}
      <div className="gaps-sub-container">
        <div className="gaps-sub-header" onClick={() => setShowGaps(!showGaps)}>
          <div className="gaps-title-row">
            <span className="gaps-icon">⏱️</span>
            <span className="gaps-title">
              Open Schedule Gaps ({filteredGaps.length})
            </span>
          </div>
          <button type="button" className="gaps-toggle-btn">
            {showGaps ? 'Hide Gaps ▲' : 'Show Gaps ▼'}
          </button>
        </div>

        {showGaps && (
          <div className="gaps-list">
            {filteredGaps.length === 0 ? (
              <p className="no-gaps-text">No schedule gaps identified for {activeDay}.</p>
            ) : (
              filteredGaps.map((gap) => (
                <div key={gap.id} className="gap-item-card">
                  <div className="gap-timing">
                    <span className="gap-time-range">
                      {gap.startTime} – {gap.endTime}
                    </span>
                    <span className="gap-stylist">Open Stylist: {gap.stylist}</span>
                  </div>
                  <div className="gap-suggestion">
                    💡 <em>AI Suggestion:</em> {gap.suggestedAction}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
