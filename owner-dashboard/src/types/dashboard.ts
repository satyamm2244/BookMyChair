export type AppointmentStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  time: string;
  customerName: string;
  customerPhone?: string;
  service: string;
  stylist: string;
  status: AppointmentStatus;
  date: 'today' | 'tomorrow';
  notes?: string;
}

export type ApprovalType =
  | 'Late cancellation'
  | 'Reschedule'
  | 'Outside-hours request'
  | 'Discount request'
  | 'Unclear customer request';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PendingApproval {
  id: string;
  type: ApprovalType;
  customerName: string;
  details: string;
  time: string;
  createdAt: string;
  status: ApprovalStatus;
}

export type ActivityType =
  | 'agent_suggestion'
  | 'booking_confirmed'
  | 'reminder_queued'
  | 'owner_approved'
  | 'owner_rejected';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  type: ActivityType;
}

export interface DashboardSummary {
  todayAppointments: number;
  tomorrowAppointments: number;
  pendingApprovals: number;
  scheduleGaps: number;
}
