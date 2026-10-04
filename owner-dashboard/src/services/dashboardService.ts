import type {
  Appointment,
  AppointmentStatus,
  PendingApproval,
  ActivityLogItem,
  DashboardSummary,
  ScheduleGap,
} from '../types/dashboard';

// Mock Data
export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:30 AM',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    service: 'Haircut & Blowdry',
    stylist: 'Rahul',
    status: 'completed',
    date: 'today',
  },
  {
    id: 'apt-2',
    time: '11:00 AM',
    customerName: 'Amit Patel',
    customerPhone: '+91 98111 22334',
    service: 'Beard Trim & Facial',
    stylist: 'Karan',
    status: 'in_progress',
    date: 'today',
  },
  {
    id: 'apt-3',
    time: '02:00 PM',
    customerName: 'Sneha Verma',
    customerPhone: '+91 98222 33445',
    service: 'Balayage & Hair Spa',
    stylist: 'Pooja',
    status: 'confirmed',
    date: 'today',
  },
  {
    id: 'apt-4',
    time: '04:30 PM',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 98333 44556',
    service: 'Classic Men Haircut',
    stylist: 'Rahul',
    status: 'confirmed',
    date: 'today',
  },
  {
    id: 'apt-5',
    time: '06:00 PM',
    customerName: 'Ananya Roy',
    customerPhone: '+91 98444 55667',
    service: 'Keratin Treatment',
    stylist: 'Pooja',
    status: 'confirmed',
    date: 'today',
  },
  // Tomorrow's appointments
  {
    id: 'apt-6',
    time: '10:00 AM',
    customerName: 'Vikram Malhotra',
    customerPhone: '+91 98555 66778',
    service: 'Haircut + Styling',
    stylist: 'Rahul',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-7',
    time: '12:30 PM',
    customerName: 'Deepika Sen',
    customerPhone: '+91 98666 77889',
    service: 'Root Touch-up & Blowdry',
    stylist: 'Pooja',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-8',
    time: '03:30 PM',
    customerName: 'Manish Joshi',
    customerPhone: '+91 98777 88990',
    service: 'Detan Facial & Shave',
    stylist: 'Karan',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-9',
    time: '05:00 PM',
    customerName: 'Tanvi Mehra',
    customerPhone: '+91 98888 99001',
    service: 'Gel Nails & Manicure',
    stylist: 'Neha',
    status: 'confirmed',
    date: 'tomorrow',
  },
];

export const initialPendingApprovals: PendingApproval[] = [
  {
    id: 'appr-1',
    type: 'Late cancellation',
    customerName: 'Kunal Deshmukh',
    details: 'Wants to cancel 30 mins before 1:00 PM slot due to sudden flight delay. Standard policy requires 2 hr notice.',
    time: 'Today, 1:00 PM slot',
    createdAt: '10 mins ago',
    status: 'pending',
  },
  {
    id: 'appr-2',
    type: 'Reschedule',
    customerName: 'Meera Kapoor',
    details: 'Requests moving 3:00 PM Hair Color appointment to 7:00 PM tonight. Stylist Pooja available.',
    time: 'Requested: 7:00 PM Today',
    createdAt: '25 mins ago',
    status: 'pending',
  },
  {
    id: 'appr-3',
    type: 'Outside-hours request',
    customerName: 'Dr. Sameer Khan',
    details: 'Wants an early morning appointment at 8:15 AM tomorrow before salon opens at 9:00 AM.',
    time: 'Tomorrow, 8:15 AM',
    createdAt: '1 hour ago',
    status: 'pending',
  },
  {
    id: 'appr-4',
    type: 'Discount request',
    customerName: 'Shreya Bansal',
    details: 'First-time customer asking for 20% inaugural discount on Bridal Hair package (Rs. 4,500).',
    time: 'For Saturday booking',
    createdAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'appr-5',
    type: 'Unclear customer request',
    customerName: 'Anonymous Caller (WhatsApp)',
    details: 'AI Agent flagged message: "Need full body grooming and some coloring maybe tomorrow evening or whenever free". Needs manual slot confirmation.',
    time: 'Tomorrow evening',
    createdAt: '3 hours ago',
    status: 'pending',
  },
];

export const initialScheduleGaps: ScheduleGap[] = [
  {
    id: 'gap-1',
    date: 'today',
    startTime: '12:00 PM',
    endTime: '02:00 PM',
    stylist: 'Rahul & Pooja',
    suggestedAction: 'Send automated flash discount nudge to nearby clients',
  },
  {
    id: 'gap-2',
    date: 'today',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    stylist: 'Karan',
    suggestedAction: 'Chair open for quick beard trim or haircut walk-ins',
  },
  {
    id: 'gap-3',
    date: 'tomorrow',
    startTime: '01:30 PM',
    endTime: '03:30 PM',
    stylist: 'Rahul',
    suggestedAction: 'Candidate slot for rebooking inactive customers',
  },
];

export const initialActivityLogs: ActivityLogItem[] = [
  {
    id: 'log-1',
    timestamp: '11:45 AM',
    title: 'Reminder queued',
    detail: 'Automated 2-hour reminder SMS queued for Sneha Verma (2:00 PM)',
    type: 'reminder_queued',
  },
  {
    id: 'log-2',
    timestamp: '11:15 AM',
    title: 'Booking confirmed',
    detail: 'AI assistant auto-confirmed slot for Amit Patel with Stylist Karan',
    type: 'booking_confirmed',
  },
  {
    id: 'log-3',
    timestamp: '10:30 AM',
    title: 'Agent suggested slot',
    detail: 'AI suggested 12:30 PM tomorrow to Deepika Sen based on open chair',
    type: 'agent_suggestion',
  },
  {
    id: 'log-4',
    timestamp: '09:40 AM',
    title: 'Owner approved request',
    detail: 'Owner Rishav approved complimentary beard oil add-on for Vikram M.',
    type: 'owner_approved',
  },
  {
    id: 'log-5',
    timestamp: '09:05 AM',
    title: 'Owner rejected request',
    detail: 'Owner rejected walk-in without deposit during peak rush hours',
    type: 'owner_rejected',
  },
];

/**
 * Service abstraction layer for the Owner Dashboard.
 * Satyam will provide backend API endpoints; these methods can then be switched
 * from in-memory/mock state to HTTP calls without changing UI components.
 */
class DashboardService {
  private appointments: Appointment[] = [...initialAppointments];
  private pendingApprovals: PendingApproval[] = [...initialPendingApprovals];
  private scheduleGaps: ScheduleGap[] = [...initialScheduleGaps];
  private activityLogs: ActivityLogItem[] = [...initialActivityLogs];

  private apiUrl: string = import.meta.env.VITE_API_URL || '';

  async getDashboardSummary(): Promise<DashboardSummary> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/owner/summary`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }

    const todayCount = this.appointments.filter((a) => a.date === 'today' && a.status !== 'cancelled').length;
    const tomorrowCount = this.appointments.filter((a) => a.date === 'tomorrow' && a.status !== 'cancelled').length;
    const pendingCount = this.pendingApprovals.filter((a) => a.status === 'pending').length;
    const gapsCount = this.scheduleGaps.filter((g) => g.date === 'today').length;

    return {
      todayAppointments: todayCount,
      tomorrowAppointments: tomorrowCount,
      pendingApprovals: pendingCount,
      scheduleGaps: gapsCount,
    };
  }

  async getAppointments(date?: 'today' | 'tomorrow'): Promise<Appointment[]> {
    if (this.apiUrl) {
      try {
        const query = date ? `?date=${date}` : '';
        const res = await fetch(`${this.apiUrl}/api/owner/appointments${query}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }

    if (!date) return [...this.appointments];
    return this.appointments.filter((a) => a.date === date);
  }

  async updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus
  ): Promise<{ success: boolean; appointment: Appointment; log: ActivityLogItem }> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/owner/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (e) {
        console.warn('Backend unavailable, updating local mock state', e);
      }
    }

    const apt = this.appointments.find((a) => a.id === id);
    if (!apt) throw new Error(`Appointment ${id} not found`);

    const oldStatus = apt.status;
    apt.status = newStatus;

    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Status changed',
      detail: `Owner updated ${apt.customerName}'s appointment (${apt.service}) from ${oldStatus} to ${newStatus}`,
      type: 'status_changed',
    };

    this.activityLogs.unshift(logItem);
    return { success: true, appointment: { ...apt }, log: logItem };
  }

  async getPendingApprovals(): Promise<PendingApproval[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/owner/approvals`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }
    return this.pendingApprovals.filter((a) => a.status === 'pending');
  }

  async resolveApproval(
    id: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ success: boolean; log: ActivityLogItem }> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/owner/approvals/${id}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, comment }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock resolution', e);
      }
    }

    const item = this.pendingApprovals.find((a) => a.id === id);
    if (!item) {
      throw new Error(`Approval item ${id} not found`);
    }

    item.status = action === 'approve' ? 'approved' : 'rejected';

    const actionText = action === 'approve' ? 'approved' : 'rejected';
    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: action === 'approve' ? 'Owner approved request' : 'Owner rejected request',
      detail: `Owner ${actionText} ${item.type} for ${item.customerName}${comment ? ` • Note: "${comment}"` : ''}`,
      type: action === 'approve' ? 'owner_approved' : 'owner_rejected',
    };

    this.activityLogs.unshift(logItem);
    return { success: true, log: logItem };
  }

  async getScheduleGaps(date?: 'today' | 'tomorrow'): Promise<ScheduleGap[]> {
    if (this.apiUrl) {
      try {
        const query = date ? `?date=${date}` : '';
        const res = await fetch(`${this.apiUrl}/api/owner/gaps${query}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }

    if (!date) return [...this.scheduleGaps];
    return this.scheduleGaps.filter((g) => g.date === date);
  }

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/owner/activity-logs`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }
    return [...this.activityLogs];
  }
}

export const dashboardService = new DashboardService();
