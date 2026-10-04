import { useState } from 'react';
import type { PendingApproval, ApprovalType } from '../types/dashboard';

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  isProcessingId?: string | null;
}

const typeTagConfig: Record<ApprovalType, { label: string; badgeClass: string }> = {
  'Late cancellation': { label: 'Late Cancellation', badgeClass: 'tag-red' },
  'Reschedule': { label: 'Reschedule', badgeClass: 'tag-orange' },
  'Outside-hours request': { label: 'Outside Hours', badgeClass: 'tag-purple' },
  'Discount request': { label: 'Discount Inquiry', badgeClass: 'tag-blue' },
  'Unclear customer request': { label: 'Unclear Intent', badgeClass: 'tag-amber' },
};

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  approvals,
  onApprove,
  onReject,
  isProcessingId,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleNoteChange = (id: string, text: string) => {
    setNotes((prev) => ({ ...prev, [id]: text }));
  };

  const handleApproveClick = (id: string) => {
    onApprove(id, notes[id]?.trim() || undefined);
    setActiveNoteId(null);
  };

  const handleRejectClick = (id: string) => {
    onReject(id, notes[id]?.trim() || undefined);
    setActiveNoteId(null);
  };

  return (
    <div className="section-card" id="pending-approvals-section">
      <div className="section-header">
        <div>
          <div className="header-badge-row">
            <h2 className="section-title">Pending Approvals</h2>
            {approvals.length > 0 && (
              <span className="count-pill">{approvals.length} pending</span>
            )}
          </div>
          <p className="section-subtitle">
            Customer inquiries, edge cases, and policy exceptions requiring your sign-off
          </p>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="empty-state success-state">
          <span className="empty-icon">✅</span>
          <p>All caught up! No pending approvals at this moment.</p>
        </div>
      ) : (
        <div className="approvals-list">
          {approvals.map((item) => {
            const typeConfig = typeTagConfig[item.type] || {
              label: item.type,
              badgeClass: 'tag-blue',
            };
            const isBusy = isProcessingId === item.id;
            const isNoteOpen = activeNoteId === item.id;

            return (
              <div key={item.id} className="approval-card">
                <div className="approval-card-header">
                  <div className="approval-type-wrapper">
                    <span className={`tag-badge ${typeConfig.badgeClass}`}>
                      {typeConfig.label}
                    </span>
                    <span className="customer-target">{item.customerName}</span>
                  </div>
                  <span className="approval-created-time">{item.createdAt}</span>
                </div>

                <p className="approval-details">{item.details}</p>

                {isNoteOpen && (
                  <div className="approval-note-box">
                    <input
                      type="text"
                      className="approval-note-input"
                      placeholder="Optional note for AI agent / customer (e.g. Counter offer 10%)..."
                      value={notes[item.id] || ''}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    />
                  </div>
                )}

                <div className="approval-footer">
                  <div className="slot-reference-group">
                    <span className="slot-reference">🕒 {item.time}</span>
                    <button
                      type="button"
                      className="btn-toggle-note"
                      onClick={() => setActiveNoteId(isNoteOpen ? null : item.id)}
                    >
                      {isNoteOpen ? 'Hide Note' : '💬 Add Note'}
                    </button>
                  </div>

                  <div className="approval-actions">
                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => handleRejectClick(item.id)}
                      disabled={isBusy}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => handleApproveClick(item.id)}
                      disabled={isBusy}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
