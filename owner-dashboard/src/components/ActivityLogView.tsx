import type { ActivityLogItem, ActivityType } from '../types/dashboard';

interface ActivityLogViewProps {
  logs: ActivityLogItem[];
}

const activityBadgeConfig: Record<ActivityType, { icon: string; label: string; badgeClass: string }> = {
  agent_suggestion: { icon: '🤖', label: 'Agent Suggestion', badgeClass: 'log-badge-suggestion' },
  booking_confirmed: { icon: '✅', label: 'Booking Confirmed', badgeClass: 'log-badge-confirmed' },
  reminder_queued: { icon: '⏰', label: 'Reminder Queued', badgeClass: 'log-badge-reminder' },
  owner_approved: { icon: '👍', label: 'Owner Approved', badgeClass: 'log-badge-approved' },
  owner_rejected: { icon: '✕', label: 'Owner Rejected', badgeClass: 'log-badge-rejected' },
  status_changed: { icon: '🔄', label: 'Status Changed', badgeClass: 'log-badge-status' },
};

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Activity Log</h2>
          <p className="section-subtitle">Real-time trace of AI assistant and owner actions</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No activity recorded yet.</p>
        </div>
      ) : (
        <div className="activity-timeline">
          {logs.map((item) => {
            const config = activityBadgeConfig[item.type] || {
              icon: '•',
              label: item.title,
              badgeClass: 'log-badge-default',
            };

            return (
              <div key={item.id} className="timeline-item">
                <div className="timeline-icon-col">
                  <span className={`timeline-icon-bubble ${config.badgeClass}`}>
                    {config.icon}
                  </span>
                  <div className="timeline-connector"></div>
                </div>

                <div className="timeline-content-col">
                  <div className="timeline-header">
                    <span className="timeline-title">{item.title}</span>
                    <span className="timeline-time">{item.timestamp}</span>
                  </div>
                  <p className="timeline-detail">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
