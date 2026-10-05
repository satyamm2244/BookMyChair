import { useEffect, useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ScheduleView } from './components/ScheduleView';
import { PendingApprovals } from './components/PendingApprovals';
import { ActivityLogView } from './components/ActivityLogView';
import type {
  Appointment,
  AppointmentStatus,
  PendingApproval,
  ActivityLogItem,
  DashboardSummary,
  ScheduleGap,
} from './types/dashboard';
import { dashboardService } from './services/dashboardService';

export function App() {
  const [summary, setSummary] = useState<DashboardSummary>({
    todayAppointments: 0,
    tomorrowAppointments: 0,
    pendingApprovals: 0,
    openSlots: 0,
    scheduleGaps: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [gaps, setGaps] = useState<ScheduleGap[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [sum, apts, apprs, gapsData, logs] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getAppointments(),
        dashboardService.getPendingApprovals(),
        dashboardService.getScheduleGaps(),
        dashboardService.getActivityLogs(),
      ]);
      setSummary(sum);
      setAppointments(apts);
      setApprovals(apprs);
      setGaps(gapsData);
      setActivityLogs(logs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, note?: string) => {
    setProcessingId(id);
    try {
      const res = await dashboardService.resolveApproval(id, 'approve', note);
      setApprovals((prev) => prev.filter((item) => item.id !== id));
      setActivityLogs((prev) => [res.log, ...prev]);
      setSummary((prev) => ({
        ...prev,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
      }));
      showAlert(`Approval confirmed.${note ? ` Note attached: "${note}"` : ''}`);
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, note?: string) => {
    setProcessingId(id);
    try {
      const res = await dashboardService.resolveApproval(id, 'reject', note);
      setApprovals((prev) => prev.filter((item) => item.id !== id));
      setActivityLogs((prev) => [res.log, ...prev]);
      setSummary((prev) => ({
        ...prev,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
      }));
      showAlert(`Request rejected.${note ? ` Reason: "${note}"` : ''}`);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setProcessingId(id);
    try {
      const res = await dashboardService.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
      setActivityLogs((prev) => [res.log, ...prev]);
      showAlert(`Updated appointment status to ${newStatus.replace('_', ' ')}.`);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => {
      setAlertMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const scrollToApprovals = () => {
    const el = document.getElementById('pending-approvals-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-container">
      <Header onRefresh={loadData} isSyncing={isSyncing} />

      {alertMessage && (
        <div className="toast-notification">
          <span>{alertMessage}</span>
          <button className="toast-close" onClick={() => setAlertMessage(null)}>
            ×
          </button>
        </div>
      )}

      <main className="dashboard-content">
        <SummaryCards
          summary={summary}
          onFilterApprovals={scrollToApprovals}
          onFilterSchedule={(day) => setActiveDay(day)}
        />

        <div className="dashboard-columns">
          <div className="column-main">
            <ScheduleView
              appointments={appointments}
              gaps={gaps}
              activeDay={activeDay}
              onDayChange={setActiveDay}
              onStatusChange={handleStatusChange}
              isProcessingId={processingId}
            />

            <PendingApprovals
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessingId={processingId}
            />
          </div>

          <aside className="column-sidebar">
            <ActivityLogView logs={activityLogs} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
