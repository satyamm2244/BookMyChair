import type { Appointment, AppointmentStatus } from '../types/dashboard';

interface ScheduleViewProps {
  appointments: Appointment[];
  activeDay: 'today' | 'tomorrow';
  onDayChange: (day: 'today' | 'tomorrow') => void;
}

const statusBadgeConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'status-badge-confirmed' },
  in_progress: { label: 'In Progress', className: 'status-badge-progress' },
  completed: { label: 'Completed', className: 'status-badge-completed' },
  cancelled: { label: 'Cancelled', className: 'status-badge-cancelled' },
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  activeDay,
  onDayChange,
}) => {
  const filtered = appointments.filter((apt) => apt.date === activeDay);

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Schedule Overview</h2>
          <p className="section-subtitle">Real-time chair bookings and stylist allocations</p>
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

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No appointments booked for {activeDay}.</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filtered.map((apt) => {
            const badge = statusBadgeConfig[apt.status] || {
              label: apt.status,
              className: 'status-badge-default',
            };

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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
