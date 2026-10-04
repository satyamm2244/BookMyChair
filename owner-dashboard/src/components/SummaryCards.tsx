import type { DashboardSummary } from '../types/dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary;
  onFilterApprovals?: () => void;
  onFilterSchedule?: (day: 'today' | 'tomorrow') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  onFilterApprovals,
  onFilterSchedule,
}) => {
  return (
    <section className="summary-grid" aria-label="Key salon metrics">
      <div
        className="summary-card card-blue"
        onClick={() => onFilterSchedule?.('today')}
        role="button"
        tabIndex={0}
      >
        <div className="card-top">
          <span className="card-label">Today's Appointments</span>
          <span className="card-icon">📅</span>
        </div>
        <div className="card-value">{summary.todayAppointments}</div>
        <div className="card-footnote">Active bookings today</div>
      </div>

      <div
        className="summary-card card-purple"
        onClick={() => onFilterSchedule?.('tomorrow')}
        role="button"
        tabIndex={0}
      >
        <div className="card-top">
          <span className="card-label">Tomorrow's Appointments</span>
          <span className="card-icon">🗓️</span>
        </div>
        <div className="card-value">{summary.tomorrowAppointments}</div>
        <div className="card-footnote">Upcoming schedule</div>
      </div>

      <div
        className={`summary-card card-amber ${summary.pendingApprovals > 0 ? 'highlight-alert' : ''}`}
        onClick={onFilterApprovals}
        role="button"
        tabIndex={0}
      >
        <div className="card-top">
          <span className="card-label">Pending Approvals</span>
          <span className="card-icon">⚡</span>
        </div>
        <div className="card-value">{summary.pendingApprovals}</div>
        <div className="card-footnote">Requires owner action</div>
      </div>

      <div className="summary-card card-emerald">
        <div className="card-top">
          <span className="card-label">Schedule Gaps</span>
          <span className="card-icon">⏱️</span>
        </div>
        <div className="card-value">{summary.scheduleGaps}</div>
        <div className="card-footnote">Open slots available for nudge</div>
      </div>
    </section>
  );
};
